"use client";
import { useMyContext } from '@/context/MyContext';
import React, { useEffect, useState } from 'react'

export default function page() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResults, setFilteredResults] = useState<{ key: string; value: string }[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [stockQuant, setStockQuant] = useState(1);
    const [stockDetails, setStockDetails] = useState({
        c: 0,
        d: 0,
        dp: 0,
        h: 0,
        l: 0,
        o: 0,
        pc: 0,
        t: 0,
    });
    const [companyName, setCompanyName] = useState("");

    const { alertData, setAlertData, setSpinner } = useMyContext();

    const stockSymbols = {
        APPLE: 'AAPL',
        GOOGLE: 'GOOGL',
        MICROSOFT: 'MSFT',
        AMAZON: 'AMZN',
        TESLA: 'TSLA',
        NVIDIA: 'NVDA',
    }


    //make a API request to fetch the stock data
    const searchStock = async (stock: string) => {
        setSpinner(true);
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`); // Adjust based on your API
        const data = await res.json();
        // console.log("data", data)
        if (data) {
            setStockDetails(data);
        }
        // console.log("stock data ", stockDetails);
        setSpinner(false);
    }

    //setting the searchterm 
    const handleSelect = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // console.log("search clicked")
        setStockQuant(1);
        setStockDetails({
            ...stockDetails,
            c: 0
        })
        if (searchTerm != '') {
            const results = Object.entries(stockSymbols)
                .filter(([key, value]) =>
                    key.toLowerCase().includes(searchTerm.toLowerCase()) || value.toLowerCase().includes(searchTerm.toLowerCase()) ? value : ""
                );
            // console.log("result", results)
            if (results.length > 0) {
                setCompanyName(results[0][1]);
                // console.log("selected company is", results[0][1])
                searchStock(results[0][1]);
                setShowDropdown(false);
            } else {
                setAlertData({
                    ...alertData,
                    visible: true,
                    message: "Company details is not available",
                    status: 200,
                })
            }
        }
    };

    //making a new order
    const placeOrder = async () => {
        // console.log("Placed order clicked")
        if (companyName != "" && stockDetails.c != 0) {
            try {
                setSpinner(true);
                const response = await fetch('/api/stockData/newOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('token') || '',
                    },
                    body: JSON.stringify({
                        company: companyName,
                        quantity: stockQuant,
                        capital: stockQuant * stockDetails.c
                    }),
                });
                setSpinner(false);
                if (!response.ok) throw new Error('Failed to create order');
                const createdOrder = await response.json();
                // console.log("create order response is", createdOrder);
                if (createdOrder.status == 200) {
                    setAlertData({
                        ...alertData,
                        visible: true,
                        message: createdOrder.message,
                        status: 200,
                    })
                    // console.log("create order succesfully")
                }
                else {
                    setAlertData({
                        ...alertData,
                        visible: true,
                        message: createdOrder.message,
                        status: 500,
                    })
                    // console.log("create user status error")
                }
            } catch (error) {
                setAlertData({
                    ...alertData,
                    visible: true,
                    message: "User order error",
                    status: 500,
                })
                // console.error("User order error", error);
            }
        } else {
            setAlertData({
                ...alertData,
                visible: true,
                message: "Please provide all details for order placing",
                status: 500,
            })
            // console.log("Please provide all details for order placing")
        }
    }

    //updating the dropdown menu results
    useEffect(() => {
        setStockDetails({
            ...stockDetails,
            c: 0
        })
        if (searchTerm) {
            const results = Object.entries(stockSymbols)
                .filter(([key, value]) =>
                    key.toLowerCase().includes(searchTerm.toLowerCase()) || value.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(([key, value]) => ({ key, value }));
            setFilteredResults(results);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    }, [searchTerm]);

    return (
        <div className="order_page min-h-screen p-10">
            <form className='order_form flex flex-col items-start justify-between rounded-md' onSubmit={handleSelect}>
                <div className='order_search_bar w-full flex flex-row items-center justify-between'>
                    <input type="text" id='search_stock' className='rounded-md outline-non h-9 pl-3 text-black outline-none'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} />
                    <button className='text-base rounded-md'>Search</button>
                </div>
                {showDropdown && (
                    <> <h4 className='flex flex-row justify-between pt-3' >Search Results</h4>
                        <ul className="dropdown flex flex-col w-full" style={{ maxHeight: "100px" }}>
                            {filteredResults ?
                                filteredResults.map(({ key, value }, index) => (
                                    <a href='#' className='order_dropdown_list py-1 text-base' key={index} onClick={() => setSearchTerm(key)}>
                                        {key}
                                    </a>
                                )
                                ) : (
                                    <li>No results found</li>
                                )}
                        </ul></>
                )}
            </form>
            {stockDetails.c != 0 && (
                //STOCK WHOLE DAY DETAILS 
                <div className="order_search_results">
                    <h4 className='text-2xl text-center mt-5 text-black'>{searchTerm} STOCK DETAILS</h4>
                    <ul className='my-4 rounded-md p-3'>
                        <li>Current Price : ${stockDetails.c}</li>
                        <li className='flex flex-row'>Change Points : <p className={`${stockDetails.d > 0 ? "text-green-500" : "text-red-600"}`}> {stockDetails.d}</p>
                        </li>
                        <li className='flex flex-row'>Stock Change : <p className={`${stockDetails.dp > 0 ? "text-green-500" : "text-red-600"}`}>{stockDetails.dp}</p>%</li>
                        <li>Day High : ${stockDetails.h}</li>
                        <li>Day Low : ${stockDetails.l}</li>
                        <li>Open : ${stockDetails.o}</li>
                        {/* {Object.entries(stockDetails).map(([key, value], index) => (
                            <li className='flex flex-row items-center justify-between p-1 ' key={index} >
                                {key}:{value}
                            </li>
                        ))} */}
                    </ul>

                    {/* //SELECT THE STOCK QUANTITY */}
                    <div className="order_select_quantity mt-2 p-4 flex flex-row items-center justify-between rounded-md">
                        <div className="company_name">
                            <h4>Company Name : {searchTerm}</h4>
                            <h4>Currect Price : {stockDetails.c}</h4>
                        </div>
                        <div className="order_select">
                            <div className='order_change_quantity flex flex-row items-center justify-between'>
                                <button type='button' className="rounded-md text-md px-4 py-2" onClick={() => setStockQuant((data) => data = data - 1)}>
                                    <i className="fa-solid fa-minus"></i>
                                </button>
                                <p className='mx-3 bg-white text-black px-3 py-2 rounded-md w-20 text-center'>{(stockDetails.c * stockQuant).toFixed(2)}</p>
                                <button type='button' className="rounded-md text-md px-4 py-2" onClick={() => setStockQuant((data) => data = data + 1)}>
                                    <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>
                            <button className='rounded-md px-3 py-2 mt-2 w-full' onClick={placeOrder}>
                                Placed Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}