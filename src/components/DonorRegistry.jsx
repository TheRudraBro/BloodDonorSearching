import React from 'react';
import { useForm } from 'react-hook-form';

const DonorRegistry = ({ divisions, bloodGroups, donors, setDonors }) => {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    const newDonor = {
      ...data,
      id: `DN-${1000 + donors.length + 1}`,
      available: true
    };

    setDonors([...donors, newDonor]);
    reset();
  };

  return (
    <div className="card bg-slate-900 shadow-sm border border-slate-700">
      <div className="card-body">
        <h2 className="text-3xl font-bold text-white mb-6">Donor Registry</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            {...register("name", { required: true })} 
            placeholder="Type your full name here" 
            className="input input-bordered w-full bg-slate-800 text-white border-slate-700 placeholder:text-slate-400" 
          />

          <select 
            defaultValue="" 
            className="select select-bordered w-full bg-slate-800 text-white border-slate-700"
            {...register("bloodGroup", { required: true })}
          >
            <option value="" disabled>Pick a blood group</option>
            {bloodGroups.map((group, index) => (
              <option key={index} value={group}>{group}</option>
            ))}
          </select>

          <select 
            defaultValue="" 
            className="select select-bordered w-full bg-slate-800 text-white border-slate-700"
            {...register("division", { required: true })}
          >
            <option value="" disabled>Select your Division</option>
            {divisions.map((division, index) => (
              <option key={index} value={division}>{division}</option>
            ))}
          </select>

          <input 
            type="text" 
            {...register("phone", { required: true })} 
            placeholder="Type your Contact Number here" 
            className="input input-bordered w-full bg-slate-800 text-white border-slate-700 placeholder:text-slate-400" 
          />

          <button type="submit" className="btn btn-primary col-span-1 md:col-span-2">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonorRegistry;