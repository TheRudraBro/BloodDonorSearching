import React from 'react';
import { useForm } from 'react-hook-form';

const DonorRegistry = ({divisions, bloodGroups}) => {
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
placeholder="Type your full name here" 
className="input w-full" />

<select defaultValue="Pick a color" 
className="select select-bordered w-full"
{...register("bloodGroup")}>
  
  <option disabled={true}>Pick a blood group</option>
   {
      bloodGroups.map((group, index) => {
        return <option key={index} value={group}>{group}</option>
      } )
    }
</select>

<select defaultValue="Select Your Division" 
className="select select-bordered w-full"
{...register("division")}>
  <option disabled={true}>Select your Division</option>
    {
      divisions.map((division, index) => {
        return <option key={index} value={division}>{division}</option>
      } )
    }
</select>

<input 
type="text" 
{...register("contact")} 
placeholder="Type your Contact Number here" 
className="input w-full" />


<button type="submit" className="btn btn-primary col-span-2">Submit</button>

    </form>

</div>
</div>
    );
};

export default DonorRegistry;