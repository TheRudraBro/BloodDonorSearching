import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { auth, db } from './firebase/config';

import Header from './components/Header';
import HeroSection from './components/HeroSection';
import BloodCompatibilityModal from './components/BloodCompatibilityModal';
import UserProfileModal from './components/UserProfileModal';
import AuthModal from './components/AuthModal';
import DonorRegistry from './components/DonorRegistry';
import DonorList from './components/DonorList';
import DonorFind from './components/DonorFind';
import DonorMap from './components/DonorMap';
import PatientRequestFeed from './components/PatientRequestFeed';
import Footer from './components/Footer';

import LiveEmergencyTicker from './components/LiveEmergencyTicker';
import EmergencyShareModal from './components/EmergencyShareModal';
import ReportFakeModal from './components/ReportFakeModal';

const divisions = [
  "Dhaka", "Chattogram", "Khulna", "Rajshahi", 
  "Sylhet", "Barishal", "Rangpur", "Mymensingh"
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const computeScore = (donor, requestedBloodData) => {
  if (donor.bloodGroup !== requestedBloodData.bloodGroup) {
    return 0;
  }

  let score = 50;

  if (requestedBloodData.division && donor.division === requestedBloodData.division) {
    score += 20;
  }
  if (requestedBloodData.zila && donor.zila === requestedBloodData.zila) {
    score += 15;
  }
  if (requestedBloodData.thana && donor.thana === requestedBloodData.thana) {
    score += 15;
  }

  return score;
};

const initialRequests = [
  {
    id: "REQ-1001",
    patientName: "Kamrul Islam",
    bloodGroup: "O+",
    bags: "2",
    hospital: "Square Hospital, Panthapath",
    division: "Dhaka",
    zila: "Dhaka",
    phone: "01712345678",
    neededTime: "Today within 4:00 PM",
    createdAt: "10:30 AM",
    status: "Emergency"
  },
  {
    id: "REQ-1002",
    patientName: "Sumaiya Akter",
    bloodGroup: "AB-",
    bags: "1",
    hospital: "Chittagong Medical College",
    division: "Chattogram",
    zila: "Chattogram",
    phone: "01823456789",
    neededTime: "Tomorrow Morning",
    createdAt: "11:15 AM",
    status: "Emergency"
  }
];

function App() {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState(initialRequests);
  const [activeTab, setActiveTab] = useState("search");
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [selectedShareReq, setSelectedShareReq] = useState(null);
  const [selectedReportReq, setSelectedReportReq] = useState(null);

  const [requestedBloodData, setRequestedBloodData] = useState({
    name: "",
    bloodGroup: "",
    division: "",
    zila: "",
    thana: ""
  });

  const loadLocalDonors = async () => {
    try {
      const res = await fetch("/data.json");
      const data = await res.json();
      setDonors(data);
    } catch (err) {
      console.error("Local data load error:", err);
    }
  };

  useEffect(() => {
    try {
      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
        });
        return () => unsubscribe();
      }
    } catch (err) {
      console.error("Auth listener error:", err);
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      if (db) {
        const q = query(collection(db, "donors"));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const liveDonors = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          if (liveDonors.length > 0) {
            setDonors(liveDonors);
          } else {
            loadLocalDonors();
          }
        }, (error) => {
          console.warn("Firestore fallback to local JSON:", error);
          loadLocalDonors();
        });
      } else {
        loadLocalDonors();
      }
    } catch (err) {
      console.error("Firestore init error:", err);
      loadLocalDonors();
    }

    return () => unsubscribe();
  }, []);

  const handleQuickBloodGroupSelect = (group) => {
    setRequestedBloodData({ ...requestedBloodData, bloodGroup: group });
    setActiveTab("search");
  };

  const matchesDonors = () => {
    if (!requestedBloodData.bloodGroup) return [];

    return donors
      .map(donor => ({
        ...donor,
        score: computeScore(donor, requestedBloodData)
      }))
      .filter(donor => {
        if (donor.score === 0) return false;
        const matchZila = !requestedBloodData.zila || donor.zila === requestedBloodData.zila;
        const matchThana = !requestedBloodData.thana || donor.thana === requestedBloodData.thana;
        return matchZila && matchThana;
      })
      .sort((a, b) => b.score - a.score);
  };

  const matchedList = matchesDonors();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      alert("Logged out successfully!");
    }
  };

  const defaultFallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=dc2626&color=ffffff&bold=true`;
  const userAvatar = user?.photoURL || defaultFallbackAvatar;

  return (
    <div className="bg-slate-900 min-h-screen text-white flex flex-col justify-between">
      <div className="container mx-auto py-4 space-y-4 px-3 sm:px-0">
        
        {/* Main Header Section */}
        <div className="w-full bg-slate-950/90 p-3.5 sm:p-5 rounded-2xl border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          <Header />
        </div>

        {/* Live Emergency Ticker */}
        <LiveEmergencyTicker requests={requests} />

        {/* Ultra-Premium Profile Top Bar */}
        <div className="w-full bg-slate-950/80 p-3 sm:p-4 rounded-2xl border border-slate-800 hover:border-red-500/30 flex items-center justify-between gap-3 shadow-2xl backdrop-blur-xl transition-all duration-300">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {user ? (
              <div className="relative shrink-0">
                <img 
                  src={userAvatar} 
                  alt="" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultFallbackAvatar;
                  }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900 object-cover ring-2 ring-red-500/80 p-0.5 shadow-lg shadow-red-950/40"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-950 animate-pulse"></span>
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 shadow-inner">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                <span className="truncate tracking-wide">{user ? (user.displayName || 'Emergency Donor') : 'Guest User'}</span>
                {user && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate tracking-tight font-medium">
                {user ? user.email : 'Log in to manage profile & status'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {user ? (
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="btn btn-xs sm:btn-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 font-semibold text-[11px] sm:text-xs gap-1.5 rounded-xl px-3 sm:px-4 shadow-md active:scale-95 transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden xs:inline">Profile</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)} 
                className="btn btn-xs sm:btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none font-bold shadow-lg shadow-red-950/50 px-3.5 sm:px-4 text-[11px] sm:text-xs rounded-xl active:scale-95 transition-all duration-200 gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <HeroSection 
          donorsCount={donors.length}
          requestsCount={requests.length}
          bloodGroups={bloodGroups}
          selectedBloodGroup={requestedBloodData.bloodGroup}
          onSelectBloodGroup={handleQuickBloodGroupSelect}
          onOpenChart={() => setIsChartOpen(true)}
        />

        {/* Modals */}
        <BloodCompatibilityModal 
          isOpen={isChartOpen} 
          onClose={() => setIsChartOpen(false)} 
        />

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          setUser={setUser} 
        />

        <UserProfileModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          user={user} 
          onLogout={handleLogout} 
        />

        <EmergencyShareModal 
          isOpen={!!selectedShareReq} 
          onClose={() => setSelectedShareReq(null)} 
          request={selectedShareReq} 
        />

        <ReportFakeModal 
          isOpen={!!selectedReportReq} 
          onClose={() => setSelectedReportReq(null)} 
          request={selectedReportReq} 
        />

        {/* 4 Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded-xl border bg-slate-950 border-slate-800 shadow-2xl">
          <button
            onClick={() => setActiveTab("requests")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "requests"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Patient Requests
          </button>

          <button
            onClick={() => setActiveTab("register")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "register"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Registration
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "search"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Exact Search
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "directory"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Directory
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "requests" && (
          <PatientRequestFeed 
            bloodGroups={bloodGroups} 
            requests={requests} 
            setRequests={setRequests} 
            onShare={(req) => setSelectedShareReq(req)}
            onReport={(req) => setSelectedReportReq(req)}
          />
        )}

        {activeTab === "register" && (
          <DonorRegistry 
            divisions={divisions} 
            bloodGroups={bloodGroups} 
            donors={donors} 
            setDonors={setDonors} 
          />
        )}

        {activeTab === "search" && (
          <div className="space-y-6">
            <DonorFind 
              divisions={divisions} 
              bloodGroups={bloodGroups} 
              requestedBloodData={requestedBloodData}
              setRequestedBloodData={setRequestedBloodData}
              matchedDonors={matchedList}
            />
            <DonorMap donors={requestedBloodData.bloodGroup ? matchedList : []} />
          </div>
        )}

        {activeTab === "directory" && (
          <DonorList donors={donors} />
        )}
      </div>

      {/* Ultra-Modern Footer */}
      <Footer 
        onSelectTab={setActiveTab} 
        onSelectBloodGroup={handleQuickBloodGroupSelect} 
      />
    </div>
  );
}

export default App;