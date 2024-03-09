import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from "./common/Header";

export default function Orders() {
    const [orders, setOrders] = useState(null);
    console.log(orders)
    const [user, loading, error] = useAuthState(auth);
    
    useEffect(() => {
        const getOrders = async () => {
            if (!user) return; // Ensure user is authenticated before fetching orders
            
            try {
                // Get the user's email (assuming it's used as the user identifier)
                const userEmail = user.email;
                
                // Prepare the request
                const response = await fetch('http://127.0.0.1:5000/get_previous_orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user_id: userEmail })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setOrders(JSON.parse(data[0])); // Assuming the orders are stored in 'Orders' key
                } else {
                    console.error('Failed to fetch orders:', response.status);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        
        getOrders();
        console.log(orders)
    }, [user]); // Fetch orders whenever 'user' changes

    return (
        <>
            <Header />
            <section className="bg-white text-black min-h-screen">
                <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                    <div className="mx-auto max-w-lg text-center">
                        <h2 className="text-3xl font-bold sm:text-4xl">Order List</h2>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {orders && orders.map(order => (
                            <div key={order.Order_ID} className="block rounded-xl border border-gray-200 p-8 shadow-xl transition hover:border-pink-500/10 hover:shadow-teal-600/30">
                                <h2 className="mt-4 text-xl font-bold text-black">Order ID: {order.Order_ID}</h2>
                                <p className="mt-1 text-sm text-gray-800">Total: ${order.Total}</p>
                                <p className="mt-1 text-sm text-gray-800">Status: {order.Status}</p>
                                <p className="mt-1 text-sm text-gray-800">Creation Date: {order.Creation_Date}</p>
                                <p className="mt-1 text-sm text-gray-800">Modified Date: {order.Modified_Date}</p>
                                
                                <div className="mt-4">
                                    <h3 className="text-lg font-bold text-black">Items:</h3>
                                    {order.Items.map(item => (
                                        <div key={item.Product_Name} className="mt-2">
                                            <p className="text-sm text-gray-800">{item.Product_Name}</p>
                                            <p className="text-sm text-gray-800">Description: {item.Product_Description}</p>
                                            <p className="text-sm text-gray-800">Quantity: {item.Quantity}</p>
                                            <p className="text-sm text-gray-800">Price: ${item.Price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <a
                            href="#"
                            className="inline-block rounded bg-pink-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-pink-700 focus:outline-none focus:ring focus:ring-yellow-400"
                        >
                            Move to Cart
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
