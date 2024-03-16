import React from 'react';

export default function OrderDetailsModal({ order, onClose }) {
    return (
        <div className="fixed top-0 left-0 z-50 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-8 overflow-auto max-h-96 w-96">
                <div className="flex justify-between">
                    <h2 className="text-xl font-bold">Order Details</h2>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                <div className="mt-4">
                    <p><strong>Order ID:</strong> {order.Order_ID}</p>
                    <p><strong>Total:</strong> ${order.Total}</p>
                    <p><strong>Status:</strong> {order.Status}</p>
                    <p><strong>Creation Date:</strong> {order.Creation_Date}</p>
                    <p><strong>Modified Date:</strong> {order.Modified_Date}</p>
                    <hr className="my-4" />
                    <h3 className="text-lg font-bold">Items:</h3>
                    {order.Items.map(item => (
                        <div key={item.Product_Name} className="mt-2">
                            <p><strong>Product Name:</strong> {item.Product_Name}</p>
                            <p><strong>Description:</strong> {item.Product_Description}</p>
                            <p><strong>Quantity:</strong> {item.Quantity}</p>
                            <p><strong>Price:</strong> ${item.Price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
