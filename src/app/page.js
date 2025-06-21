'use client'
import React from 'react'

import { useRouter } from 'next/navigation'

function page() {
  const navigation=useRouter();
  return (
    <div  onClick={()=>{navigation.push("login")}}>Interview</div>
  )
}

export default page