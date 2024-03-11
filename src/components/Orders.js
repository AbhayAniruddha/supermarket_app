import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from "./common/Header";

export default function Orders() {
    const [orders, setOrders] = useState(null);
    console.log(orders)
    const [user, loading, error] = useAuthState(auth);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const selectOrder = (orderIndex) => {
        console.log(orderIndex)
        setSelectedOrder(orderIndex);
    }
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
    const moveToCart = async (e,orderId) => {
        
        e.preventDefault()
        console.log(orderId)
        try {
            // Prepare the request
            const response = await fetch('http://127.0.0.1:5000/move_to_cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: user.email, order_id: orderId })
            });

            if (response.ok) {
                alert('Items moved to cart successfully');
                // Optionally, you can update the UI to reflect changes
            } else {
                console.error('Failed to move items to cart:', response.status);
            }
        } catch (error) {
            console.error('Error moving items to cart:', error);
        }
    };
    return (
        <>
            <Header />
            <section className="bg-gray-900 text-white min-h-screen">
                <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                    <div className="mx-auto max-w-lg text-center">
                        <h2 className="text-3xl font-bold sm:text-4xl">Order List</h2>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {orders && orders.map(order => (
                            <div key={order.Order_ID} 
                            onClick={() => selectOrder(order.Order_ID)}
                            className={`block rounded-xl border border-gray-800 p-8 shadow-xl transition hover:border-pink-500/10 hover:shadow-pink-500/10${
                                selectedOrder === order.Order_ID ? 'hover:border-blue-500/10 hover:shadow-blue-500/10' : '' 
                            }`}>
                                <h2 className="mt-4 text-xl font-bold text-white">Order ID: {order.Order_ID}</h2>
                                <p className="mt-1 text-sm text-gray-300">Total: ${order.Total}</p>
                                <p className="mt-1 text-sm text-gray-300">Status: {order.Status}</p>
                                <p className="mt-1 text-sm text-gray-300">Creation Date: {order.Creation_Date}</p>
                                <p className="mt-1 text-sm text-gray-300">Modified Date: {order.Modified_Date}</p>
                                
                                <div className="mt-4">
                                    <h3 className="text-lg font-bold text-white">Items:</h3>
                                    {order.Items.map(item => (
                                        <div key={item.Product_Name} className="mt-2">
                                            <p className="text-sm text-gray-300">{item.Product_Name}</p>
                                            <p className="text-sm text-gray-300">Description: {item.Product_Description}</p>
                                            <p className="text-sm text-gray-300">Quantity: {item.Quantity}</p>
                                            <p className="text-sm text-gray-300">Price: ${item.Price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                                    <button
                                        className="inline-block rounded bg-pink-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-700 focus:outline-none focus:ring focus:ring-yellow-400"
                                        onClick={(e) => moveToCart(e,orders[selectedOrder-1].Order_ID)}
                                    >
                                        Move to Cart
                                    </button>
                    </div>
                </div>
            </section>
        </>
    );
}
