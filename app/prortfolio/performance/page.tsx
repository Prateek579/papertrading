'use client'

import { useMyContext } from '@/context/MyContext'
import React, { useEffect, useState } from 'react'
import { Reorder } from "framer-motion";

type order = {
    id: number,
    authorId: number,
    company: string,
    quantity: number,
    capital: number,
    result: number,
    isActive: boolean,
    createdAt: number,
}

export default function page() {

    const [orders, setOrders] = useState<order[]>()

    const { alertData, setAlertData, setSpinner } = useMyContext();

    const fetchOrders = async () => {
        try {
            setSpinner(true);
            const response = await fetch('/api/stockData/history', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token') || '',
                }
            });
            setSpinner(false);
            if (!response.ok) throw new Error('Failed to fetch orders');
            const orders = await response.json();
            // console.log("orders response is", orders);
            if (orders.status == 200) {
                setOrders(orders.Orders)
            }
            if (orders.status != 200) {
                setAlertData({
                    ...alertData,
                    visible: true,
                    message: orders.message,
                    status: 500,
                })
                // console.log("create user status error")
            }
        } catch (error) {
            // console.log("feching orders error", error)
            setAlertData({
                ...alertData,
                status: 300,
                message: "Fetching orders error"
            })
        }
    }

    useEffect(() => {
        fetchOrders();
    }, [])

    return (
        <div className='performance_page min-h-screen p-16'>
            <div className="current-position">
                <h1 className='text-center text-4xl font-bold font-mono text-black'>Your Completed Orders</h1>
                <ul className='my-8 mx-2'>
                    {orders &&
                        <Reorder.Group axis='y' values={orders} onReorder={setOrders}>
                            {orders && orders.map((data) => {
                                return (
                                    <Reorder.Item key={data.id} value={data}>
                                        <li className='performance_item mb-3 p-4 rounded-md'>
                                            <ul>
                                                <li className='flex flex-row items-center justify-between mb-2'>
                                                    <p>Company Name : {data.company}</p>
                                                    <p className={`${data.result > 0 ? "text-green-500" : "text-red-600"}`}>${data.result}</p>
                                                </li>
                                                <li className='flex flex-row items-center justify-between'>
                                                    <p>{data.quantity}Qty</p>
                                                    <p>{data.createdAt}</p>
                                                </li>
                                            </ul>
                                        </li>
                                    </Reorder.Item>
                                )
                            })}
                        </Reorder.Group>
                    }
                </ul>
            </div>
        </div>
    )
}


//  #EC4186, #38124A, #EE544A #FFFFFF