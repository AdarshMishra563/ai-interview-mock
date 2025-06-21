'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'


import { useSelector } from 'react-redux';

function Page() {
  const navigation=useRouter()

 const {token,user}=useSelector((state)=>state.user.user);


 useEffect(()=>{

  if(token && user){
    navigation.push("interview")
  }else{
    navigation.push("login")
  }
 },[token])
  return (
    <div  >Interview Loading.....</div>
  )
}

export default Page