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

// Modals & Alert Ticker
import LiveEmergencyTicker from './components/LiveEmergencyTicker';
import EmergencyPosterModal from './components/EmergencyPosterModal';
import DonorRewardsModal from './components/DonorRewardsModal';

const divisions = [
  "Dhaka", "Chattogram", "Khulna", "Rajshahi", 
  "Sylhet", "Barishal", "Rangpur", "Mymensingh"
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const computeScore = (donor, requestedBloodData) => {
  if (donor.bloodGroup !== requestedBloodData.bloodGroup) return 0;
  let score = 50;
  if (requestedBloodData.division && donor.division === requestedBloodData.division) score += 20;
  if (requestedBloodData.zila && donor.zila === requestedBloodData.zila) score += 15;
  if (requestedBloodData.thana && donor.thana === requestedBloodData.thana) score += 15;
  return score;
};

function App() {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("requests");
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [selectedPosterReq, setSelectedPosterReq] = useState(null);
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
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
        return () => unsubscribe();
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    let unsubDonors = () => {};
    let unsubRequests = () => {};

    try {
      if (db) {
        const qDonors = query(collection(db, "donors"));
        unsubDonors = onSnapshot(qDonors, (snapshot) => {
          const liveDonors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (liveDonors.length > 0) setDonors(liveDonors);
          else loadLocalDonors();
        }, () => loadLocalDonors());

        const qRequests = query(collection(db, "patient_requests"));
        unsubRequests = onSnapshot(qRequests, (snapshot) => {
          const liveRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRequests(liveRequests);
        }, (err) => console.error("Requests error:", err));
      } else {
        loadLocalDonors();
      }
    } catch (err) {
      loadLocalDonors();
    }

    return () => {
      unsubDonors();
      unsubRequests();
    };
  }, []);

  const handleQuickBloodGroupSelect = (group) => {
    setRequestedBloodData({ ...requestedBloodData, bloodGroup: group });
    setActiveTab("search");
  };

  const matchesDonors = () => {
    if (!requestedBloodData.bloodGroup) return [];
    return donors
      .map(donor => ({ ...donor, score: computeScore(donor, requestedBloodData) }))
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

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=dc2626&color=ffffff&bold=true`;

  return (
    <div className="bg-[#070b14] min-h-screen text-white flex flex-col justify-between selection:bg-red-600 selection:text-white antialiased">
      
      {/* FULL SCREEN WIDE DESKTOP CONTAINER */}
      <main className="w-full max-w-[96%] xl:max-w-[1600px] 2xl:max-w-[1720px] mx-auto py-3 sm:py-5 px-2 sm:px-4 lg:px-6 space-y-3.5 sm:space-y-4 flex-1">
        
        {/* 1. Header */}
        <Header />

        {/* 2. Live Alert Ticker */}
        <LiveEmergencyTicker requests={requests} />

        {/* 3. Top Profile Bar (Fixed Image Loading Issue) */}
        <div className="w-full bg-[#0d1322] p-3 sm:p-4 rounded-2xl border border-red-950/80 flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {user ? (
              <img 
                src={user.photoURL || defaultAvatar} 
                alt="Avatar" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultAvatar;
                }}
                className="w-10 h-10 rounded-full bg-slate-900 object-cover ring-2 ring-red-500/80 p-0.5 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#080d1a] border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                {user ? (user.displayName || 'Emergency Donor') : 'Guest User'}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                {user ? user.email : 'Log in to access donor rewards & certificates'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {user ? (
              <>
                <button 
                  onClick={() => setIsRewardsOpen(true)}
                  className="btn btn-xs sm:btn-sm bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[10px] sm:text-xs rounded-xl px-2.5 sm:px-3 active:scale-95"
                >
                  🏆 Rewards
                </button>
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="btn btn-xs sm:btn-sm bg-[#080d1a] hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-[10px] sm:text-xs rounded-xl px-2.5 sm:px-4 active:scale-95"
                >
                  Profile
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)} 
                className="btn btn-xs sm:btn-sm bg-red-600 hover:bg-red-700 text-white border-none font-bold px-3 sm:px-4 text-[11px] sm:text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-950/60 active:scale-95"
              >
                <span>🔒</span> Login
              </button>
            )}
          </div>
        </div>

        {/* 4. Hero Section */}
        <HeroSection 
          donorsCount={donors.length}
          requestsCount={requests.length}
          bloodGroups={bloodGroups}
          selectedBloodGroup={requestedBloodData.bloodGroup}
          onSelectBloodGroup={handleQuickBloodGroupSelect}
          onOpenChart={() => setIsChartOpen(true)}
        />

        {/* Modals */}
        <BloodCompatibilityModal isOpen={isChartOpen} onClose={() => setIsChartOpen(false)} />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} setUser={setUser} />
        <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onLogout={handleLogout} />
        <DonorRewardsModal isOpen={isRewardsOpen} onClose={() => setIsRewardsOpen(false)} user={user} />
        <EmergencyPosterModal isOpen={!!selectedPosterReq} onClose={() => setSelectedPosterReq(null)} request={selectedPosterReq} />

        {/* 5. 4 Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 sm:p-2 rounded-2xl border bg-[#0d1322] border-red-950/80 shadow-2xl">
          <button
            onClick={() => setActiveTab("requests")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "requests"
                ? "bg-red-600 text-white shadow-lg ring-1 ring-red-400"
                : "bg-[#080d1a] text-slate-300 hover:bg-slate-900"
            }`}
          >
            <span>🚨</span> <span className="truncate">Patient Requests</span>
          </button>

          <button
            onClick={() => setActiveTab("register")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "register"
                ? "bg-red-600 text-white shadow-lg ring-1 ring-red-400"
                : "bg-[#080d1a] text-slate-300 hover:bg-slate-900"
            }`}
          >
            <span>📝</span> <span className="truncate">Registration</span>
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "search"
                ? "bg-red-600 text-white shadow-lg ring-1 ring-red-400"
                : "bg-[#080d1a] text-slate-300 hover:bg-slate-900"
            }`}
          >
            <span>🔍</span> <span className="truncate">Exact Search</span>
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "directory"
                ? "bg-red-600 text-white shadow-lg ring-1 ring-red-400"
                : "bg-[#080d1a] text-slate-300 hover:bg-slate-900"
            }`}
          >
            <span>📋</span> <span className="truncate">Directory</span>
          </button>
        </div>

        {/* 6. Dynamic Content Section */}
        <div className="w-full">
          {activeTab === "requests" && (
            <PatientRequestFeed 
              bloodGroups={bloodGroups} 
              requests={requests} 
              onShare={(req) => setSelectedPosterReq(req)}
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
            <div className="space-y-4 sm:space-y-5">
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
      </main>

      {/* Footer */}
      <Footer 
        onSelectTab={setActiveTab} 
        onSelectBloodGroup={handleQuickBloodGroupSelect} 
      />
    </div>
  );
}

export default App;