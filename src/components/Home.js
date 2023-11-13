import React from 'react'
import "./Home.css"
import { useNavigate } from 'react-router-dom'



export const Home = () => {

    const navigate = useNavigate();

    return (
        <div>

            <div className='head'>
                <h5> INVENTRY MANAGEMENT SYSTEM</h5>
            </div>

            <div className=' outer'>

                <div className='middle1'>


                    <div className='sell'>



                        <button type="button" class="button" onClick={() => navigate("/Sells")} >
                            Sell

                        </button>





                    </div>
                    <div className='add'>
                        <button type="button" class="button" onClick={() => navigate("/Add_stock")} >
                            Add

                        </button>
                    </div>
                </div>

                <div className='details'>



                    <div className='det1'> <p>Maximize your</p>
                        <p> warehouse efficiency</p></div>

                    <p className='in'>Modern online warehouse management software</p>

                </div>
            </div>


            <div className='det2'>
                <div className='firstp'>
                    <p className='det2p1'>
                        <p>
                            Improve performance
                            & process time
                        </p>
                        <p className='det2p2'>

                            Better organize your warehouse with the smart double entry inventory system

                        </p>

                        <p className='det2p3'>

                            Get the most efficient stocking method and improve all your internal operations. Odoo's double-entry inventory has no stock input, output or transformation. Instead, all operations are stock moves between locations.
                        </p>

                    </p>
                </div><div className='secondp'>
                    <div className='img1'>
                        <h1>      </h1>
                    </div>
                </div>


            </div>


            <div className='about'>
                <h1>About</h1>

                <br>
                </br>



                <h2>About Our Stock Exchange Website

                    <p className='aboutp'>We are committed to providing you with a powerful and user-friendly platform that empowers you to make informed investment decisions, navigate the complex world of stocks and securities, and ultimately grow your financial portfolio. We believe that anyone, regardless of their background or experience, should have access to the tools and knowledge needed to thrive in the world of finance.

                    </p>
                </h2>

                <h2> Our Mission

                    <p className='aboutp'>
                        Our mission is to democratize finance by offering a comprehensive, educational, and accessible resource for individuals and organizations looking to engage with the stock market. We aim to create a community of informed investors who can confidently navigate the financial markets, manage their investments, and achieve their financial goals.


                    </p>
                </h2>


                <h2>Key Features

                    <p className='aboutp'>
                        User-Friendly Platform
                        <br></br>
                        Portfolio Management
                        <br></br>
                        News and Updates
                    </p>
                </h2>

            </div>


        </div >
    )
}
export default Home;
