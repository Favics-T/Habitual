import React from 'react'
import Image from '../assets/OnboardingImage.jpg'
import { Outlet } from 'react-router-dom'
function AuthLayout({children}) {
  return (
    <div className='flex h-screen bg-[rgb(240,237,237)]'>
        <div className='flex justify-center items-center ml-10 h-screen  w-2/5'>
<img src={Image} alt="Welcome to Habitual" className=' h-100 rounded-2xl ' />
        </div>
        <div className='flex-1  px-8 py-20'>
             <Outlet />
        </div>

    </div>
  )
}

export default AuthLayout
