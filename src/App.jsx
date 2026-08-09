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

  const userAvatar = user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.displayName || user?.email || 'User')}`;

  return (
    <div className="bg-slate-900 min-h-screen text-white pb-12">
      <div className="container mx-auto py-4 space-y-4 px-3 sm:px-0">
        
        {/* ১. সম্পূর্ণ হেডার সেকশন */}
        <div className="w-full bg-slate-950/90 p-3.5 sm:p-5 rounded-2xl border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          <Header />
        </div>

        {/* ২. মোবাইল রেসপন্সিভ প্রোফাইল প্যানেল */}
        <div className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 rounded-2xl border border-red-500/30 flex items-center justify-between gap-2 shadow-xl backdrop-blur-md">
          
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {user ? (
              <div className="relative shrink-0">
                <img 
                  src={userAvatar} 
                  alt="User Avatar" 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 object-cover border-2 border-red-500 shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-base sm:text-lg shrink-0">
                👤
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1 truncate">
                <span className="truncate">{user ? (user.displayName || 'Emergency Donor') : 'Guest User'}</span>
                {user && (
                  <span className="text-blue-400 text-[9px] sm:text-[10px] bg-blue-500/20 px-1.5 py-0.2 rounded-full font-bold border border-blue-500/30 shrink-0">
                    ✓
                  </span>
                )}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {user ? user.email : 'Log in to manage profile'}
              </p>
            </div>
          </div>

          <div className="shrink-0 ml-1">
            {user ? (
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="btn btn-xs sm:btn-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-[11px] sm:text-xs gap-1 rounded-xl px-2.5 sm:px-4 shadow-lg"
              >
                <span>⚙️</span> <span className="hidden xs:inline">Profile</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)} 
                className="btn btn-xs sm:btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none font-extrabold shadow-lg shadow-red-950/50 px-2.5 sm:px-4 text-[10px] sm:text-xs rounded-xl"
              >
                🔐 Login
              </button>
            )}
          </div>
        </div>

        {/* ৩. হিরো সেকশন */}
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

        {/* 4 Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded-xl border bg-slate-950 border-slate-800 shadow-2xl">
          <button
            onClick={() => setActiveTab("requests")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "requests"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span>🚨</span> Patient Requests
          </button>

          <button
            onClick={() => setActiveTab("register")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "register"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span>📝</span> Registration
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "search"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span>🔍</span> Exact Search
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "directory"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span>📋</span> Directory
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "requests" && (
          <PatientRequestFeed 
            bloodGroups={bloodGroups} 
            requests={requests} 
            setRequests={setRequests} 
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
    </div>
  );
}

export default App;