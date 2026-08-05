import { useState, useEffect } from 'react';
import Header from './components/Header';
import DonorRegistry from './components/DonorRegistry';
import DonorList from './components/DonorList';
import DonorFind from './components/DonorFind';
import DonorMap from './components/DonorMap'; // অথবা DonorGoogleMap

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

        // জেলা ও থানা ফিল্টারিং (যদি সিলেক্ট করা থাকে)
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

        {/* শুধু ব্লাড গ্রুপ সিলেক্ট করলেই ম্যাপে রেজাল্ট দেখাবে */}
        <DonorMap donors={requestedBloodData.bloodGroup ? matchedList : []} />

        <DonorList donors={donors} />
      </div>   
    </div>
  );
}

export default App;