import Header from "../src/components/common/Header";
import { Link } from "react-router-dom";
import { useState,useEffect } from "react";
import Home from './components/Home';

function App() {
  const categories = useGetCategories();
  return (
    <>
      <Header />
      <section className="bg-gray-900 text-white min-h-screen">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Kickstart your marketing</h2>

            <p className="mt-4 text-gray-300">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequuntur aliquam doloribus
              nesciunt eos fugiat. Vitae aperiam fugit consequuntur saepe laborum.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category,idx)=>{
              return(
            <Link
              className="block rounded-xl border border-gray-800 p-8 shadow-xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
              to={`/products/${category.Category}`}
              id={`${category.Category_ID}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-10 text-pink-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                />
              </svg>

              <h2 className="mt-4 text-xl font-bold text-white">{category.Category}</h2>

              <p className="mt-1 text-sm text-gray-300">
                {category.Category_Description}
              </p>
            </Link>);
          })}   
          </div>
        </div>
      </section>
    </>);
}

export default App;

function useGetCategories(){
  const [categories,setCategories] = useState([])

    useEffect(()=>{
        //fetch data from db
        const fetchProducts = async()=> {
          try {
              const response = await fetch("http://127.0.0.1:5000/categories");
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              const jsonData = await response.json();
              // console.log(JSON.parse(jsonData[0]));
            setCategories(JSON.parse(jsonData[0]))
          } catch (error) {
              console.error('There was a problem with the fetch operation:', error);
          }
      }

      fetchProducts();
    },[])
    return categories;
}
