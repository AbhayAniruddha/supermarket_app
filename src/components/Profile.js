import Header from "./common/Header"
import { useState,useEffect } from "react";
import { auth } from "../firebase/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';


export default function Profile(){

    const [user, loading, error] = useAuthState(auth);
    const [info,setInfo] = useState([]);
    const [address,setAddress] = useState([]);
    const [text, setText] = useState('');
    const [pc, setPC] = useState('');

    const handleButtonClick = async() => {
        if (text.trim() !== '' && pc.trim() !== '') {
            try {

                const response = await fetch('http://127.0.0.1:5000/address/update', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                    email: user.email,
                    address: text,
                    postal_code: pc
                    })
                });
  
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const jsonData = await response.json();
                alert("Address added successfully!")
              
            } catch (error) {
                console.error('There was a problem with updating address', error);
            }
 
        } else {
          alert("Address field/Postal Code is empty!")
        }
      };
    
    const handleAddressChange = (event) => {
        setText(event.target.value);
    };
    const handlePostalCodeChange = (event) => {
        setPC(event.target.value);
    };
    

    useEffect(()=>{
        //fetch data from db
        const fetchInfo = async()=> {
          try {

              const response = await fetch('http://127.0.0.1:5000/profile/get', {
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
            setInfo(JSON.parse(jsonData[0]))
            
          } catch (error) {
              console.error('There was a problem with the fetch operation:', error);
          }

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
    }, [user]);

    return(
        <>
            <Header/>
            <div className="flex flex-row items-start ml-10 sm:ml-[100px] mt-10 sm:mt-20 mr-10 sm:mr-0 flex-wrap">
                <div className="flex flex-col grow">
                <div className="text-5xl mb-3 font-bold">Profile</div>
                {info!==null && info.length>0 && (
                <>
                <div className="flow-root w-full pr-0 sm:pr-20">
                    <dl className="-my-3 divide-y divide-gray-100 text-sm">
                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium text-gray-900">First Name</dt>
                        <dd className="text-gray-700 sm:col-span-2">{info[0].First_Name}</dd>
                        </div>

                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium text-gray-900">Last Name</dt>
                        <dd className="text-gray-700 sm:col-span-2">{info[0].Last_Name}</dd>
                        </div>

                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium text-gray-900">Email Id</dt>
                        <dd className="text-gray-700 sm:col-span-2">{auth.currentUser.email}</dd>
                        </div>

                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium text-gray-900">Mobile</dt>
                        <dd className="text-gray-700 sm:col-span-2">{info[0].Mobile}</dd>
                        </div>
                    </dl>
                </div>
                <div className="text-4xl mt-20 mb-10 font-semibold">Addresses</div>
                <div className="flow-root w-full pr-0 sm:pr-20">
                    <dl className="-my-3 divide-y divide-gray-100 text-sm"></dl>
                    {address ? (
                            address.map((addr, index) => (
                                <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-4 sm:gap-4">
                                    <dt className="font-medium text-gray-900">Address {index+1}</dt>
                                    <dd className="text-gray-700 sm:col-span-2">{addr.address}</dd>
                                    <dd className="text-gray-700 sm:col-span-1">{addr.postal_code}</dd>
                                </div>
                            ))
                        ) : (
                        <div>No Addresses</div>
                        )}
                    
                </div>
                </>

                )}
                </div>
                
                <div className="flex flex-col items-start w-full sm:w-1/2 pl-0 sm:pl-[10%]">
                    <div className="text-3xl my-10 font-semibold">Add Delivery Address</div>
                    <div>
                        <label htmlFor="Address" className="block text-xs font-medium text-gray-700"> Address </label>
                        <textarea
                            value={text}
                            onChange={handleAddressChange}
                            rows = "3"
                            id="Address"
                            placeholder="xyz street, abc apartment"
                            className="mt-1 w-[300px] rounded-md border-solid border-gray-600 shadow-sm sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="PostalCode" className="block text-xs font-medium text-gray-700 mt-3"> Postal Code </label>
                        <textarea
                            value={pc}
                            onChange={handlePostalCodeChange}
                            rows = "1"
                            id="PostalCode"
                            placeholder=""
                            className="mt-1 w-full rounded-md border-solid border-gray-600 shadow-sm sm:text-sm"
                        />
                    </div>
                    <button
                    onClick={handleButtonClick}
                    className="block rounded-md bg-gray-900 mt-4 px-5 py-2.5 mb-20 text-sm font-medium text-white transition hover:bg-teal-500"
                    >
                    Add
                    </button>
                </div>

            </div>


        </>

    )
}