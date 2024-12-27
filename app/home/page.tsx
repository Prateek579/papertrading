"use client";

import React, { useState } from 'react'
import { useMyContext } from '@/context/MyContext';
import { useRouter } from 'next/navigation';


export default function Login() {
    const [rgstrLyt, setRgstrLyt] = useState<boolean>(false);
    const [showPass, setShowPass] = useState(false);

    const { name, setName, email, setEmail, password, setPassword, alertData, setAlertData, setSpinner } = useMyContext();

    const router = useRouter();

    //method for signUp and signIn user
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // console.log("handlesubmit clicked")
        setSpinner(true);
        if (name != '' && email != '' && password != '') {
            try {
                const response = await fetch('/api/auth/signIn', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name, email, password
                    }),
                });
                // console.log("response ", response)
                const createdUser = await response.json();
                // console.log("create user response is", createdUser);
                setSpinner(false);
                if (createdUser.status == 200) {
                    localStorage.setItem('token', createdUser.token);
                    router.push('/prortfolio/charting');
                }
                else {
                    setAlertData({
                        ...alertData,
                        visible: true,
                        message: createdUser.message,
                        status: createdUser.status
                    })
                    // console.log("create user status error")
                }
            } catch (error) {
                setSpinner(false);
                // console.error("User creating error", error);
            }
        } else if (name == '' && password != '' && email != '') {
            try {
                const response = await fetch('/api/auth/signUp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email, password
                    }),
                });
                const signUpUser = await response.json();
                setSpinner(false);
                // console.log("SingUp user response is", signUpUser);
                if (signUpUser.status == 200) {
                    localStorage.setItem('token', signUpUser.token);
                    router.push('/prortfolio/charting');
                }
                else {
                    setAlertData({
                        ...alertData,
                        visible: true,
                        message: signUpUser.message,
                        status: signUpUser.status
                    })
                    // console.log("singUp status error")
                }
            } catch (error) {
                setSpinner(false);
                // console.error("SignUp user error", error);
            }
        } else {
            setSpinner(false);
            console.log("else clicked")
            setAlertData({
                ...alertData,
                visible: true,
                message: "All field are mendatory",
                status: 300,
            })
        }
    }

    return (
        <div className='home h-screen w-screen login flex flex-row bg-black'>
            <div className="home_left"></div>
            <div className="home_right login_container flex flex-col items-center justify-center">
                <div className="w-2/3 rotate-vert-center">
                    <div className="home_nevbar w-full bg-slate-950 flex flex-row items-center justify-around py-4 border-x-2 border-t-2 border-sky-500 rounded-tl-lg rounded-tr-lg">
                        <button className={`home_singIn ${rgstrLyt === false && "text-green-500"}`} onClick={() => setRgstrLyt(!rgstrLyt)}>SignIn</button>
                        <button className={`home_singIn ${rgstrLyt === true && "text-green-500"}`} onClick={() => setRgstrLyt(!rgstrLyt)}>SignUp</button>
                    </div>
                    <form onSubmit={handleSubmit} className='  border-2 w-full border-sky-500 px-11 py-12 rounded-bl-lg rounded-br-lg bg-slate-950 flex flex-col items-center justify-start'>
                        {rgstrLyt == true && (
                            <div className='login_input w-full bg-gray-700 border border-gray-700 rounded-md p-2 pl-4 mb-8' >
                                {/* <label htmlFor="name">Enter Your Name</label> : */}
                                <input id='name' type="text" className="login_name bg-transparent outline-none" placeholder='User Name' value={name} onChange={(e) => setName(e.target.value)} />
                            </div>)}
                        <div className="login_input w-full  bg-gray-700 border border-gray-700 rounded-md p-2 pl-4 mb-8">
                            {/* <label htmlFor="email">Enter Your Email</label> : */}
                            <input id='email' type="email" className="login_email bg-transparent outline-none" placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="login_input w-full bg-gray-700 border border-gray-700 rounded-md p-2 px-4 mb-8 flex flex-row items-center justify-between">
                            {/* <label htmlFor="password">Enter Your Password</label> : */}
                            <input id='password' type={`${showPass == true ? "text" : "password"}`} className="login_password bg-transparent mr-2 outline-none" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                            <i className={`${showPass == true ? "fa-regular fa-eye-slash cursor-pointer" : "fa-regular fa-eye cursor-pointer"}`} onClick={() => setShowPass(!showPass)}></i>
                        </div>
                        <button className='w-full p-3 border-2 rounded-md border-sky-500'>{rgstrLyt == false ? "SignIn" : "SignUp"}</button>
                    </form>
                </div>
            </div>
        </div>
    )
}