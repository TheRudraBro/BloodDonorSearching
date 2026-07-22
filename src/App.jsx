// App.jsx
import { useState, useEffect } from 'react'
import Header from './components/Header'
import DonorRegistry from './components/DonorRegistry'
import DonorList from './components/DonorList'

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

const bloodGroups = Object.keys(bloodCompatibility);

function App() {
  const [donors, setDonors] = useState([]);

  // data.json থেকে ইনিশিয়াল ৫০ জনের ডেটা App-এ লোড করুন
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
        {/* DonorList-এ donors পাস করে দিন */}
        <DonorList donors={donors} />
      </div>   
    </div>
  );
}

export default App;