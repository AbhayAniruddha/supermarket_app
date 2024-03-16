import Header from "./common/Header"
import { useState,useEffect } from "react";
import { auth } from "../firebase/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from "react-router-dom";

export default function Cart(){
    const navigate = useNavigate();
    const [user, loading, error] = useAuthState(auth);
    const [items,setItems] = useState([])
    const [quantity,setQuantity]= useState();
    const [address,setAddress] = useState([]);
    const [forceRerender, setForceRerender] = useState(false);
    // Define state to store the selected address
    const [selectedAddress, setSelectedAddress] = useState(null);
    

    // Event handler to update the selected address
    const selectAddress = (addressIndex) => {
    setSelectedAddress(addressIndex);
    };

    useEffect(()=>{
        //fetch data from db
        const fetchCart = async()=> {
          try {

              const response = await fetch('http://127.0.0.1:5000/cart/get', {
                  method: 'POST',
                  headers: {
                  'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                  email: user.email
                  })
              });

              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              const jsonData = await response.json();
              console.log(jsonData[0])
              // console.log(JSON.parse(jsonData[0])[0]);
            setItems(JSON.parse(jsonData[0]))
            
          } catch (error) {
              console.error('There was a problem with the fetch operation:', error);
          }
      }

      fetchCart();
    }, [forceRerender,user]);
    useEffect(()=>{
        //fetch data from db
        const fetchInfo = async()=> {


          try {

            const response = await fetch('http://127.0.0.1:5000/address/get', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                email: user.email
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const jsonData = await response.json();
            console.log(jsonData[0])
            // console.log(JSON.parse(jsonData[0])[0]);
          setAddress(JSON.parse(jsonData[0]))
          
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
      }

      fetchInfo();
    }, []);

    const IncQuantity = async(Pname,Quantity) => {
        try {
            const newQuantity = Quantity+1;
            setQuantity(newQuantity);
            
            const response = await fetch('http://127.0.0.1:5000/cart/update', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                email: user.email,
                quantity: newQuantity,
                name: Pname
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const jsonData = await response.json();
            console.log(jsonData[0])
            setForceRerender(prev => !prev);
            
          
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
      };
    
    const DecQuantity = async(Pname,Quantity) => {
        try {
            const newQuantity = Quantity-1;
            setQuantity(newQuantity);

            const response = await fetch('http://127.0.0.1:5000/cart/update', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                email: user.email,
                quantity: newQuantity,
                name: Pname
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const jsonData = await response.json();
            console.log(jsonData[0])
            setForceRerender(prev => !prev);
          
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
        
    };

    const delete_item = async(pname) => {
        try {

            const response = await fetch('http://127.0.0.1:5000/cart/delete', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                email: user.email,
                name: pname
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const jsonData = await response.json();
            console.log(jsonData[0])
            setForceRerender(prev => !prev);
          
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
    
    let totalPrice = 0;
    if(items)
    {
        totalPrice = items.reduce((total, item) => total + (item.Price * item.Quantity), 0);
    }    

    const Checkout = async()=>{
        // Perform action based on the selected address
        if(items===null)
        {
            alert('Add item to carts first')
            return
        }
        if (selectedAddress !== null) {
            const selectedAddr = address[selectedAddress];
            try {

                const response = await fetch('http://127.0.0.1:5000/move_to_previous_order', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                    user_id: user.email,
                    address_id:selectedAddress
                    })
                });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const jsonData = await response.json();
                alert(jsonData.message)
                navigate("/Orders")
              
            } catch (error) {
                alert('There was a problem with the ordering operation:', error);
            }
            
        } else {
        alert("Please select an address before proceeding to checkout.");
        }
    }

    return(
    <>
        <Header/>
        <section>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto max-w-3xl">
            <header className="text-center">
                <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">Your Cart</h1>
            </header>

            <div className="mt-8">
                <ul className="space-y-4">
                    {items ? (
                        items.map((item, index) => (
                            <li key={index} className="flex items-center gap-4">
                            <img
                            src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=830&q=80"
                            alt=""
                            className="size-16 rounded object-cover"
                            />
                    
                            <div>
                            <h3 className="text-sm text-gray-900">{item.Product_Name}</h3>
                    
                            <dl className="mt-0.5 space-y-px text-[10px] text-gray-600">
                                <div>
                                <dt className="inline">Description:</dt>
                                <dd className="inline">{item.Product_Description}</dd>
                                </div>
                            </dl>
                            </div>
                    
                            <div className="flex flex-1 items-center justify-end gap-2">
                            <div>
                                <label for="Quantity" class="sr-only"> Quantity </label>
                    
                                <div class="flex items-center gap-1">
                                    <button onClick={() => DecQuantity(item.Product_Name,item.Quantity)} type="button" class="size-10 leading-10 text-gray-600 transition hover:opacity-75">
                                    -
                                    </button>
                    
                                    <div
                                    class="h-10 w-16 rounded border-gray-200 text-center py-2"
                                    >
                                    {item.Quantity}
                                    </div>
                    
                                    <button onClick={() => IncQuantity(item.Product_Name,item.Quantity)} type="button" class="size-10 leading-10 text-gray-600 transition hover:opacity-75">
                                    +
                                    </button>
                                </div>
                            </div>
                    
                    
                            <button onClick={() => delete_item(item.Product_Name)} className="text-gray-600 transition hover:text-red-600">
                                <span className="sr-only">Remove item</span>
                    
                                <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="h-4 w-4"
                                >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                                </svg>
                            </button>
                            </div>
                        </li>
                         ))
                    ) : (
                    <div>Cart Empty</div>
                    )}
  
                </ul>

                <div className="mt-8 flex justify-end border-t border-gray-100 pt-8">
                <div className="w-screen max-w-lg space-y-4">
                    <dl className="space-y-0.5 text-sm text-gray-700">

                    <div className="flex justify-between !text-base font-medium">
                        <dt>Total</dt>
                        <dd>{totalPrice}</dd>
                    </div>
                    </dl>

                    <div className="text-3xl container">Addresses</div>
                            <div className="flow-root ">
                                <dl className="-my-3 divide-y divide-gray-100 text-sm"></dl>
                                {address ? (
                                            address.map((addr, index) => (
                                                <div
                                                key={addr.address_id}
                                                onClick={() => selectAddress(addr.address_id)} // Update the selected address on click
                                                className={`grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-4 sm:gap-4 cursor-pointer ${
                                                    selectedAddress === addr.address_id ? 'border border-blue-500' : '' // Apply border for selected address
                                                }`}
                                                >
                                                <dt className="font-medium text-gray-900">Address {index + 1}</dt>
                                                <dd className="text-gray-700 sm:col-span-2">{addr.address}</dd>
                                                <dd className="text-gray-700 sm:col-span-1">{addr.postal_code}</dd>
                                                </div>
                                            ))
                                            ) : (
                                            <div>No Addresses</div>
                                    )}
                                
                            </div>


                    <div className="flex justify-end">
                    <button
                        onClick={Checkout}
                        className="block rounded bg-gray-700 px-5 py-3 text-sm text-gray-100 transition hover:bg-gray-600"
                        >
                        Checkout
                        </button>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </section>
    </>
    )
}
