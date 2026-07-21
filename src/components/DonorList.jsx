import React, {useEffect, useState} from 'react';




const DonorList = () => {
const [donosrs, setDonors] = React.useState([]);

useEffect(() => {
   async function loadDonors() {
const res = await fetch('/public/data.json');
const data = await res.json();
setDonors(data);
   }
   loadDonors();
  }, []);

  console.log(donosrs, "Donors List:");


    return <div></div>;
};

export default DonorList;