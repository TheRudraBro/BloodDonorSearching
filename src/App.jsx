import { useState } from 'react'
import Header from './components/Header'
import DonorRegistry from './components/DonorRegistry'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className= 'bg-slate-800'>
    <div className='container mx-auto py-4 space-y-4'>

      <Header/>
      <DonorRegistry/>
</div>   
</div>

    </>
  )
}

export default App
