import { useState, useEffect } from 'react';
import Header from './components/Header';
import DonorRegistry from './components/DonorRegistry';
import DonorList from './components/DonorList';
import DonorFind from './components/DonorFind';

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

// ১০০ এবং ৭০ পয়েন্টের নতুন Scoring Logic
const computeScore = (donor, requestedBloodData) => {
  const allowedDonors = bloodCompatibility[requestedBloodData.bloodGroup] ?? [];
  
  if (!allowedDonors.includes(donor.bloodGroup)) {
    return 0; // ব্লাড গ্রুপ না মিললে 0 পয়েন্ট
  }

  // ব্লাড গ্রুপ + ডিভিশন দুইটাই মিললে 100 পয়েন্ট
  if (donor.division === requestedBloodData.division) {
    return 100;
  }

  // ব্লাড গ্রুপ মিলছে কিন্তু ডিভিশন আলাদা হলে 70 পয়েন্ট
  return 70;
};

const bloodGroups = Object.keys(bloodCompatibility);

function App() {
  const [donors, setDonors] = useState([]);
  const [requestedBloodData, setRequestedBloodData] = useState({
    name: "",
    bloodGroup: "",
    division: ""
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
      .filter(donor => donor.score > 0)
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
    <div className='bg-slate-800 min-h-screen'>
      <div className='container mx-auto py-4 space-y-4'>
        <Header />
        <DonorRegistry 
          divisions={divisions} 
          bloodGroups={bloodGroups} 
          donors={donors} 
          setDonors={setDonors} 
        />
        <DonorFind 
          divisions={divisions} 
          bloodGroups={bloodGroups} 
          requestedBloodData={requestedBloodData}
          setRequestedBloodData={setRequestedBloodData}
          matchedDonors={matchedList}
        />
        <DonorList donors={donors} />
      </div>   
    </div>
  );
}

export default App;