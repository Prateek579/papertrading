"use client"

import { useMyContext } from '@/context/MyContext'
import React, { useEffect } from 'react'

export default function Spinner() {

    const { spinner } = useMyContext()

    return (
        <>{spinner &&
            <div
                className="fixed h-screen w-screen flex items-center justify-center shadow-l"
            >
                <img src="/spinner.gif" alt="spinner" className="bg-white rounded-lg shadow-lg w-28" />
            </div>}
        </>
        // <div className="fixed h-screen w-screen flex items-center justify-center shadow-l  fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-lg shadow-lg">
        //     <img src="/spinner.gif" alt="Loading spinner" className="bg-white rounded-lg shadow-lg" />
        // </div>
    )
}