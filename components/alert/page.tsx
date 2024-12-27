"use client"

import { useMyContext } from '@/context/MyContext'
import React, { useEffect } from 'react'

export default function Alert() {

    const { alertData, setAlertData } = useMyContext()

    useEffect(() => {
        const interval = setTimeout(() => {
            setAlertData({
                ...alertData,
                visible: false
            });
        }, 5000)

        return () => clearTimeout(interval);
    }, [alertData])

    return (
        <>{alertData.visible &&
            <div
                className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-lg shadow-lg ${alertData.status == 200 ? 'bg-green-500 text-white' :
                    alertData.status == 500 ? 'bg-red-500 text-white' :
                        alertData.status == 300 ? 'bg-yellow-500 text-black' :
                            'bg-blue-500 text-white'}`}
            >
                {alertData.message}
            </div>}
        </>
    )
}