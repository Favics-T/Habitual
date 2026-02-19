import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Input from './component/Input'
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { Link } from 'react-router-dom';

export default function Login() {
    const {formData,handleInputChange,login} = useContext(AuthContext)
 
    const Option =({icon, text})=>{
        return(
        <div className='border  border-[#A6B28B] text-[#1C352D] justify-center w-full rounded-xl text-lg font-bold items-center gap-4 flex p-1'>
                <h1 className='text-lg'>{icon}</h1>
                <h1 className='text-sm'>{text}</h1>
        </div>)
    }
 
    return (
    <div className='flex flex-col gap-8 text-[#222222] '>

        <div className='flex flex-col gap-4'>
            <h1 className='font-bold text-2xl'>Welcome Back</h1>
            <p className='text-sm text-gray-500'>Login with one of the following options</p>

                <div className='flex gap-8 w-full'>
                    <Option text='Continue With Google' icon={<FcGoogle />} />
            <Option text='Continue With Facebook' icon={<FaFacebookF />}/>
                </div>
            
        </div>

        <div class="flex items-center">
  <hr class="grow border-gray-300" />
  <span class="px-4 text-gray-500 font-medium">OR</span>
  <hr class="grow border-gray-300" />
</div>

<form onSubmit={login} className="flex flex-col gap-8">
  <Input
    name="email"
    type="email"
    value={formData.email}
    placeholder="rachealwoods@gmail.com"
    onChange={handleInputChange}
  />
  <Input
    name="password"
    type="password"
    value={formData.password}
    placeholder="Enter password"
    onChange={handleInputChange}
  />
  <button
    type="submit"
    className="bg-[#1C352D] p-2 text-white rounded-2xl font-semibold"
  >
    Login
  </button>
</form>


    <p className='text-center'>No Account? <Link to='/signup'><span className='text-lg font-bold text-[#1c352d]'>Sign up</span></Link></p>


    </div>
    
  )
}
