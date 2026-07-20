import React from 'react';
import { useForm } from 'react-hook-form';

const DonorRegistry = () => {

const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = (data) => console.log(data)

  console.log(watch("example"))


    return (
       <div className="card bg-slate-900 shadow-sm">
      <div className="card-body ">


<form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
  
<input 
type="text" 
{...register("name")} 
placeholder="Type your name here" 
className="input w-full" />

<select defaultValue="Pick a color" 
className="select select-bordered w-full">
  <option disabled={true}>Pick a blood group</option>
  <option>A+</option>
  <option>A-</option>
  <option>B+</option>
  <option>B-</option>
  <option>AB+</option>
  <option>AB-</option>
  <option>O+</option>
  <option>O-</option>
</select>

<select defaultValue="Select Your Location" 
className="select select-bordered w-full">
  <option disabled={true}>Select your Location</option>
  <option>Dhaka</option>
  <option>Chittagong</option>
  <option>Khulna</option>
  <option>Rajshahi</option>
  <option>Sylhet</option>
  <option>Barisal</option>
  <option>Mymensingh</option>
</select>

<input 
type="text" 
{...register("name")} 
placeholder="Type your name here" 
className="input w-full" />

    </form>

</div>
</div>
    );
};

export default DonorRegistry;