import React from 'react';
import { useState, useEffect } from 'react';
import Header from './common/Header';
import { useParams } from 'react-router-dom';
import {auth} from '../firebase/firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function ProductDisplay() {
    const [user, loading, error] = useAuthState(auth);
    const { category } = useParams();
    const products = useGetProducts(category);
    const onAddToCart = (e,product) => {
        e.preventDefault()
        // Get the necessary data such as user ID, product ID, and quantity
        const user_id = user.email; // Assuming you have a function to get the user ID
        const product_id = product.Product_Id; // Assuming you have a function to get the product ID
        const quantity = 1 // Assuming you have a function to get the quantity
    
        // Prepare the data to send in the request body
        const data = {
            user_id: user_id,
            product_id: product_id,
            quantity: quantity
        };
        // console.log(data)
    
        //Send a POST request to the server to add the item to the cart
        fetch('http://127.0.0.1:5000/add_cart_item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to add item to cart');
        })
        .then(data => {
            // Handle the successful response from the server
            alert(data.message); // Log the response from the server
            // Optionally, you can update the UI to reflect that the item was added to the cart
        })
        .catch(error => {
            // Handle errors that occur during the request
            alert('Error adding item to cart:', error);
            // Optionally, you can show an error message to the user
        });
    };
    
    return (
        <>
            <Header />
            <section className="bg-gray-900 text-white min-h-screen">
                <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                    {products === null || loading ? (
                        <div className="text-center text-gray-400">Out of Stock</div>
                    ) : (
                        <div className=' flex flex-wrap gap-8'>
                            {products.map((product, idx) => {
                                return (
                                    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" id={`${product.Product_Id}`}>
                                        <div class="group relative block overflow-hidden max-w-64">
                                            
                                            <img
                                                src={`${product.Product_Image}`}
                                                alt=""
                                                class="h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72"
                                            />
        
                                            <div class="relative border border-gray-100 bg-white p-6">
        
                                                <h3 class="mt-4 text-lg font-medium text-gray-900">{product.Product_Name}</h3>
        
                                                <p class="mt-1.5 text-sm text-gray-700">{product.Product_Brand}</p>
                                                <p class="mt-1.5 text-sm text-gray-700">{product.Product_Price}</p>
                                                <p class="mt-1.5 text-sm text-gray-700">{product.Product_Description}</p>
        
                                                <form class="mt-4">
                                                    {user ? (<button
                                                        class="block w-full rounded bg-yellow-400 p-4 text-sm font-medium transition hover:scale-105"
                                                        onClick={(e)=>onAddToCart(e,product)}
                                                        type='button'
                                                       
                                                    >
                                                        Add to Cart
                                                    </button>):(<button
                                                        class="block w-full rounded p-4 text-sm font-medium transition hover:scale-105 bg-slate-600"
                                                        onClick={(e)=>{alert("Sign In to add items to cart")}}
                                                        type='button'
                                                       
                                                    >
                                                        Add to Cart
                                                    </button>)
                                                    }
                                                </form>
                                            </div>
                                        </div>
        
        
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

function useGetProducts(category) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/products/${category}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const jsonData = await response.json();
                setProducts(JSON.parse(jsonData[0]));
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        };

        fetchProducts();
    }, [category]);
    return products;
}

