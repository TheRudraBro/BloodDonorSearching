import { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import BloodCompatibilityModal from './components/BloodCompatibilityModal'; // New Modal
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
  
  // Compatibility Modal State
  const [isChartOpen, setIsChartOpen] = useState(false);

  const [requestedBloodData, setRequestedBloodData] = useState({
    name: "",
    bloodGroup: "",
    division: "",
    zila: "",
    thana: ""
  });

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
        <Header />

        {/* Hero Section & Quick Chips */}
        <HeroSection 
          donorsCount={donors.length}
          requestsCount={requests.length}
          bloodGroups={bloodGroups}
          selectedBloodGroup={requestedBloodData.bloodGroup}
          onSelectBloodGroup={handleQuickBloodGroupSelect}
          onOpenChart={() => setIsChartOpen(true)}
        />

        {/* Compatibility Modal */}
        <BloodCompatibilityModal 
          isOpen={isChartOpen} 
          onClose={() => setIsChartOpen(false)} 
        />

        {/* 4 Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700/80 shadow-2xl">
          <button
            onClick={() => setActiveTab("requests")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "requests"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-800/90 text-slate-200 hover:bg-slate-700"
            }`}
          >
            <span>🚨</span> Patient Requests
          </button>

          <button
            onClick={() => setActiveTab("register")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "register"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-800/90 text-slate-200 hover:bg-slate-700"
            }`}
          >
            <span>📝</span> Registration
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "search"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-800/90 text-slate-200 hover:bg-slate-700"
            }`}
          >
            <span>🔍</span> Exact Search
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "directory"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-1 ring-red-400"
                : "bg-slate-800/90 text-slate-200 hover:bg-slate-700"
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