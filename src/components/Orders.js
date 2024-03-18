import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from "./common/Header";
import OrderDetailsModal from "./OrderDetailsModal";
import { useNavigate } from 'react-router';

export default function Orders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState(null);
    const [user, loading, error] = useAuthState(auth);
    const [selectedOrder, setSelectedOrder] = useState(null); // State to track selected order
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null); // State to track selected order
    const [message, setMessage] = useState(null);
    console.log(orders)
    
    const selectOrder = (orderIndex) => {
        //console.log(orderIndex)
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
    }, [user]); // Fetch orders whenever 'user' changes

    // Function to handle clicking on "Show Details" button
    const showDetails = (orderId) => {
        setSelectedOrderDetails(orderId); // Set the selected order ID
    };

    // Function to close the modal
    const closeModal = () => {
        setSelectedOrderDetails(null);
    };

    const moveToCart = async (e) => {
        
        e.preventDefault()
        //console.log(orderId)
        if(selectedOrder !== null)
        {
            const orderId = selectedOrder
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
                    const data = await response.json();
                    if (data.error) {
                        // Display alert for failed items
                        setMessage(`${data.error}`);
                        
                    } else {
                        // Display success message
                        setMessage('Items from previous order added to cart successfully');
                        
                    }
                    // Optionally, you can update the UI to reflect changes
                } else {
                    console.error('Failed to move items to cart:', response.status);
                }
            } catch (error) {
                console.error('Error moving items to cart:', error);
            }
        }
        else{
            alert("Please select an order to move to cart")
        }
        
    };

    return (
        <>
            <Header />
            <section className="bg-white text-black min-h-screen">
                <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                    <div className="mx-auto max-w-lg text-center">
                        <h2 className="text-3xl font-bold sm:text-4xl">Order List</h2>
                    </div>
                    {message && (
                        <div className="bg-yellow-200 p-4 text-yellow-800 text-center">{message}</div>
                    )}
                    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 my-10">
                        {orders && orders.map(order => (
                            <div key={order.Order_ID} 
                            onClick={() => setSelectedOrder(order.Order_ID)}
                            className={`block rounded-xl border-4 p-8 ${
                                selectedOrder === order.Order_ID ? 'border-4 border-blue-800 hover:border-blue-600 hover:shadow-blue-700/10' : 'border-gray-200  shadow-xl transition hover:border-teal-500/10 hover:shadow-teal-600/30' 
                            }`}>
                                <h2 className="mt-4 text-xl font-bold text-black">Order ID: {order.Order_ID}</h2>
                                <p className="mt-1 text-sm text-gray-800">Total: ${order.Total.toFixed(2)}</p>
                                {/* <p className="mt-1 text-sm text-gray-800">Status: {order.Status}</p> */}
                                <p className="mt-1 text-sm text-gray-800">Creation Date: {(order.Creation_Date).slice(0, 10)}</p>
                                {/* <p className="mt-1 text-sm text-gray-800">Modified Date: {order.Modified_Date}</p> */}
                                <button
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    onClick={() => showDetails(order.Order_ID)}
                                >
                                    Show Details
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 flex justify-center">
                                    <button
                                        className="inline-block rounded bg-pink-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-700 focus:outline-none focus:ring focus:ring-yellow-400"
                                        onClick={(e) => moveToCart(e)}
                                    >
                                        Move to Cart
                                    </button>
                    </div>
                </div>
            </section>
            {selectedOrderDetails && (
                <OrderDetailsModal
                    order={orders.find(order => order.Order_ID === selectedOrderDetails)}
                    onClose={closeModal}
                />
            )}
        </>
    );
}