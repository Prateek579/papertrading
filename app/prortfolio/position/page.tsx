'use client'

import { useMyContext } from '@/context/MyContext'
import React, { useEffect, useState, useMemo } from 'react'
import { getSocket } from '@/config/socket';

type order = {
    id: number,
    authorId: number,
    company: string,
    quantity: number,
    capital: number,
    result: boolean,
    isActive: boolean,
    createdAt: number,
    currentPrice?: number,
}

type user = {
    name: string,
    capital: number,
}

export default function page() {

    const [orders, setOrders] = useState<order[]>()
    const [userDetails, setUserDetails] = useState<user>();
    const [hasExecuted, setHasExecuted] = useState<boolean>(false);

    const socket = useMemo(() => {
        const socket = getSocket();
        return socket.connect();
    }, []);


    const { alertData, setAlertData, setSpinner } = useMyContext();

    //GET method for fetching all RUNNING ORDERS 
    const fetchOrders = async () => {
        try {
            setSpinner(true);
            const response = await fetch('/api/stockData/position', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token') || '',
                }
            });
            setSpinner(false);
            if (!response.ok) throw new Error('Failed to fetch order');
            const orderList = await response.json();
            // console.log("orderlist response is", orderList);
            if (orderList.status == 200) {
                setOrders(orderList.Orders);
            } else {
                setAlertData({
                    ...alertData,
                    visible: true,
                    message: orderList.message,
                    status: 500,
                })
                // console.log("create user status error")
            }
        } catch (error) {
            // console.log("feching order list error", error)
            setAlertData({
                ...alertData,
                visible: true,
                status: 300,
                message: "Fetching order list error"
            })
        }
    }

    //PUT request for completing the ORDER
    const handleCompleteOrder = async (id: number, result: number, cmp: string) => {
        try {
            setSpinner(true);
            const response = await fetch('/api/stockData/position', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token') || '',
                },
                body: JSON.stringify({ orderId: id, result })
            });
            setSpinner(false);
            if (!response.ok) throw new Error('Failed to COMPLETE order');
            const orderList = await response.json();
            if (orderList.status == 200) {
                setAlertData({
                    ...alertData,
                    visible: true,
                    message: orderList.message,
                    status: 200,
                })
                //leaving the room;
                socket.emit("leave-room", cmp)
                fetchOrders()
            } else {
                setAlertData({
                    ...alertData,
                    visible: true,
                    message: orderList.message,
                    status: 500,
                })
                // console.log("create user status error")
            }
        } catch (error) {
            // console.log("feching order list error", error)
            setAlertData({
                ...alertData,
                status: 300,
                message: "Fetching order list error"
            })
        }
    }

    //fething USER details
    const fetchUserDetails = async () => {
        try {
            setSpinner(true);
            const response = await fetch('/api/userData/userDetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token') || '',
                }
            });
            setSpinner(false);
            if (!response.ok) throw new Error('Failed to fetch user details');
            const userData = await response.json();
            // console.log("User details is", userData.user);
            if (userData.status == 200) {
                setUserDetails(userData.user)
            } else {
                setAlertData({
                    ...alertData,
                    visible: true,
                    message: userData.message,
                    status: userData.status,
                })
                // console.log("create user status error")
            }
        } catch (error) {
            // console.log("feching order list error", error)
            setAlertData({
                ...alertData,
                status: 300,
                message: "Fetching order list error"
            })
        }
    }


    useEffect(() => {
        //sending STOCK LIST to the SOCKET.IO
        if (!hasExecuted && orders && orders.length > 0) {
            console.log("stock sending.....")
            orders.forEach((stock) => {
                socket.emit("stock-subscribe", stock.company);
            })
            setHasExecuted(true);
        }
    }, [orders])

    useEffect(() => {
        fetchUserDetails();
        fetchOrders();
        socket.on("stock-error", (message, error) => {
            setAlertData({
                ...alertData,
                status: 500,
                message: message,
            })
            console.log(message, " error ", error);
        })
        socket.on("stock-update", ({ stockName, stockPrice }) => {
            console.log("stock name ", stockName, " stock details ", stockPrice);
            setOrders((prevItems) =>
                prevItems?.map((item) =>
                    item.company == stockName ? {
                        ...item,
                        currentPrice: stockPrice
                    } : item
                )
            )
        })
        return () => {
            socket.disconnect(); // Disconnect when the component unmounts
            // console.log("Disconnected from server");
        };
    }, [])

    return (
        <div className='position p-16 min-h-screen bg-white'>
            <ul className="position_top rounded-md current-status mt-5 p-3">
                <li className='flex flex-row justify-between mb-5'><p>Available Capital</p> <p>${userDetails?.capital}</p> </li>
                <li className='flex flex-row justify-between'><p>Total Return</p> <p>{userDetails ? <p>${userDetails?.capital - 100000}( {((userDetails.capital - 100000) / 1000).toFixed(2)}%)</p> : "Calculating"}</p></li>
            </ul>
            <div className="current-position">
                <ul className='my-8'>
                    {orders && orders.map((data, key) => {
                        return (
                            <li className='position_page_list p-3 mb-3 rounded-md' key={key}>
                                <ul>
                                    <li className='flex flex-row items-center justify-between mb-2'>
                                        <p>Company Name : {data.company}</p>
                                        <p className={`${ data.currentPrice && data.currentPrice * data.quantity >= data.capital ? "text-green-500" : "text-red-600"}`} >${data.currentPrice ? data.currentPrice * data.quantity >= data.capital ? ("+" + (data.currentPrice * data.quantity - data.capital).toFixed(2)) : (data.currentPrice * data.quantity - data.capital).toFixed(2) : "updating..."}</p>
                                    </li>
                                    <li className='flex flex-row items-center justify-between mb-2'>
                                        <p>Total capital : {data.capital}</p>
                                        <p>Invested Price : {(data.capital / data.quantity).toFixed(2)}</p>
                                    </li>
                                    <li className='flex flex-row items-center justify-between'>
                                        <p>{data.quantity}Qty</p>
                                        <p>{data.createdAt}</p>
                                    </li>
                                </ul>
                                <button className='position_complete_btn rounded-md mt-2' onClick={() => handleCompleteOrder(data.id, data.currentPrice ? data.currentPrice * data.quantity - data.capital : 0, data.company)}>Complete Order</button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}
