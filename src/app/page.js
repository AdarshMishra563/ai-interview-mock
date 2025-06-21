'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'


import { useSelector } from 'react-redux';

function Page() {
  const navigation=useRouter()

 const k=useSelector((state)=>state?.user?.user);


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