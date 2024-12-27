"use client";
import React, { useEffect, useRef, useState } from 'react';

export default function Chart() {
    const container = useRef<HTMLDivElement>(null);
    const [stockName, setStockName] = useState<string>("NASDAQ:GOOGL");
    const [stockList, setStockLists] = useState({
        APPLE: "NASDAQ:AAPL",
        MICROSOFT: "NASDAQ:MSFT",
        GOOGLE: "NASDAQ:GOOGL",
        NVIDIA: "NASDAQ:NVDA",
        AMAZON: "NASDAQ:AMZN",
        TESLA: "NASDAQ:TSLA",
        BITCOIN: "CSE:BTC",
        COIN: "NASDAQ:COIN",
    });

    const createWidget = () => {
        if (container.current) {

            container.current.innerHTML = "";

            const script = document.createElement("script");
            script.src =
                "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;

            script.innerHTML = `
            {
              "autosize": true,
              "symbol": "${stockName}",
              "interval": "D",
              "timezone": "Etc/UTC",
              "theme": "dark",
              "style": "1",
              "locale": "en",
              "allow_symbol_change": true,
              "calendar": false
            }`;

            container.current.appendChild(script);
        }
    };

    useEffect(() => {
        createWidget();
    }, [stockName]);

    return (
        <div className='h-screen flex flex-row justify-between bg-white'>
            <div className="tradingview-widget-container h-full" ref={container} style={{ height: "100%", width: "3/4" }}>
                <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
            </div>
            <div className="stock-option w-1/4 bg-white">
                <ul className="stock-us flex flex-col items-start justify-center m-3">
                    {Object.entries(stockList).map((items) => {
                        return (
                            <li className="chart_page_stock stock w-full mb-1 p-2 rounded-md" onClick={() => setStockName(items[1])}>
                                {items[0]}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
}

// T0E24CJ20XYOJGJY