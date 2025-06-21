'use client'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'


import { useSelector } from 'react-redux';

function Page() {
  const navigation=useRouter()

 const k=useSelector((state)=>state?.user?.user);
useEffect(()=>{
const fetch=async ()=>{

  const data=axios.get("https://ai-interview-nodebackend.onrender.com");
  console.log(data)
}
fetch();

},[])

 useEffect(()=>{

  if(k?.token && k?.user){
    navigation.push("/interview")
  }else{
    navigation.push("/login")
  }
 },[k?.token])
  return (
    <div  >Interview Loading.....</div>
  )
}

export default Page