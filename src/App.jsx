import { useState } from 'react'
import Header from './components/Header'
import DonorRegistry from './components/DonorRegistry'
import DonorList from './components/DonorList'


const divisions = [
  "Dhaka",
  "Chittagong",
  "Khulna",
  "Rajshahi",
  "Sylhet",
  "Barisal",
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
console.log(bloodGroups, "Blood Groups:");
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className= 'bg-slate-800'>
    <div className='container mx-auto py-4 space-y-4'>

      <Header/>
      <DonorRegistry divisions={divisions} bloodGroups={bloodGroups} />
      <DonorList/>
</div>   
</div>

    </>
  )
}

export default App
