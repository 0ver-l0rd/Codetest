import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {v4 as uid} from 'uuid'

function Login() {
    const[name,setName]=useState("")
    const[uuid,setUuid]=useState("");
    const navigate=useNavigate();
    


const generateUuid=()=>{
    setUuid(uid)
}

const handleLogin=(e)=>{
    e.preventDefault();
    navigate(`/${uuid}`,{
        state:name
    })
}
  return (
    <div className="login-container ">
      <div className="w-[40rem] p-4  rounded-lg shadow-2xl sm:p-6 md:p-8 bg-gray-800 ">
	  <form onSubmit={handleLogin} className="space-y-6 bg-gray-800 border-gray-700" action="#">
          <h5 className="text-2xl font-semibold bg-gray-800 text-gray-900 dark:text-white border-gray-700">
            Sign in 
          </h5>
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-xl bg-gray-800 font-medium text-gray-900 dark:text-white bg-gray-800 border-gray-700"
            >
              Your Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="bg-gray-50 border bg-gray-800 border-gray-700 border-gray-300 text-gray-900 text-xl rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
    value={name}
    onChange={e=>setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="uuid"
              className="block mb-2 text-xl bg-gray-800 font-medium text-gray-900 dark:text-white"
            >
              Your UID
            </label>
            <input
              type="text"
              name="uuid"
              id="uuid"
              value={uuid}
              onChange={e=>setUuid(e.target.value)}
              className=" border bg-gray-800 border-gray-300 text-gray-900 text-xl rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              required
            />
          </div>
          <div className="flex items-start bg-gray-800">
        
            <p
        onClick={generateUuid}
              className="ml-auto text-xl  bg-gray-800 text-blue-700 hover:underline dark:text-blue-500 font-semibold cursor-pointer"
            >
              Generate UID
            </p>
          </div>
          <button
    disabled={!name||!uuid}
            type="submit"
         className="text-white bg-purple-700
		  focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-xl  py-4 text-center mr-2 mb-2 w-full"
          >
            Login
          </button>
        
        </form>
      </div>
    </div>
  );
}

export default Login;
