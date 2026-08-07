import { useState, useEffect } from 'react';
import Header from './components/Header';
import DonorRegistry from './components/DonorRegistry';
import DonorList from './components/DonorList';
import DonorFind from './components/DonorFind';
import DonorMap from './components/DonorMap';

const divisions = [
  "Dhaka",
  "Chattogram",
  "Khulna",
  "Rajshahi",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh"
];

const bloodCompatibility = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"]
};

const computeScore = (donor, requestedBloodData) => {
  const allowedDonors = bloodCompatibility[requestedBloodData.bloodGroup] ?? [];
  if (!allowedDonors.includes(donor.bloodGroup)) {
    return 0;
  }

  if (
    donor.bloodGroup === requestedBloodData.bloodGroup &&
    donor.division === requestedBloodData.division
  ) {
    return 100;
  }

  return 70;
};

const bloodGroups = Object.keys(bloodCompatibility);

function App() {
  const [donors, setDonors] = useState([]);
  
  // ১. বর্তমানে কোন ট্যাব সিলেক্ট করা আছে তা রাখার স্টেট (Default: 'register')
  const [activeTab, setActiveTab] = useState("register");

  const [requestedBloodData, setRequestedBloodData] = useState({
    name: "",
    bloodGroup: "",
    division: "",
    zila: "",
    thana: ""
  });

  const matchesDonors = () => {
    if (!requestedBloodData.bloodGroup) {
      return [];
    }

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

  useEffect(() => {
    async function loadDonors() {
      try {
        const res = await fetch("/data.json");
        const data = await res.json();
        setDonors(data);
      } catch (error) {
        console.error("Error loading donors:", error);
      }
    }
    loadDonors();
  }, []);

  return (
    <div className='bg-slate-800 min-h-screen pb-12'>
      <div className='container mx-auto py-4 space-y-6 px-4 sm:px-0'>
        {/* Header */}
        <Header />

      {/* ২. ৩টি অপশনের নেভিগেশন বাটন/ট্যাব (Mobile Optimized UI) */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700/80 shadow-2xl">
  <button
    onClick={() => setActiveTab("register")}
    className={`py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
      activeTab === "register"
        ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
        : "bg-slate-800/90 text-slate-200 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/50"
    }`}
  >
    <span>📝</span> Donor Registration
  </button>

  <button
    onClick={() => setActiveTab("search")}
    className={`py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
      activeTab === "search"
        ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
        : "bg-slate-800/90 text-slate-200 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/50"
    }`}
  >
    <span>🔍</span> Donor Search
  </button>

  <button
    onClick={() => setActiveTab("directory")}
    className={`py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
      activeTab === "directory"
        ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
        : "bg-slate-800/90 text-slate-200 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/50"
    }`}
  >
    <span>📋</span> Active Donor Directory
  </button>
</div>

        {/* ৩. একটিভ ট্যাব অনুযায়ী কম্পোনেন্ট রেন্ডারিং */}
        
        {/* Tab 1: Registration */}
        {activeTab === "register" && (
          <DonorRegistry 
            divisions={divisions} 
            bloodGroups={bloodGroups} 
            donors={donors} 
            setDonors={setDonors} 
          />
        )}

        {/* Tab 2: Donor Search & Map */}
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

        {/* Tab 3: Active Donor Directory */}
        {activeTab === "directory" && (
          <DonorList donors={donors} />
        )}

      </div>   
    </div>
  );
}

export default App;