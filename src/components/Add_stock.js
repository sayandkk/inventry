import React, { Component } from 'react'
import "./Add_stock.css"

import { useState } from 'react';


function Add_stock() {




    return (
        <div>
            <div className='header'>
                <h1 >ADD STOCK</h1>
            </div>



            <div className='sdetails'>
                <div className='no'>
                    <p>No</p>
                    <input type="text"  ></input>

                </div>
                <div className='name'>
                    <p>Name</p>
                    <input type="text" ></input>
                </div>

                <div className='qty'>
                    <p>Qty</p>
                    <input type="text"  ></input>
                </div>
                <div className='price'>
                    <p>Price</p>
                    <input type="text" ></input>
                </div>

                <div className='sub'>
                    <button type="button" class="sbutton" >
                        Submitt

                    </button>
                </div>









            </div>

            <div className='sdet'>


                <h1>STOCK DETAILS</h1>

                <div className='fulldet'>
                    <div className='no'>
                        <p>No</p>

                    </div>
                    <div className='name'>
                        <p>Name</p>
                    </div>

                    <div className='qty'>
                        <p>Qty</p>
                    </div>
                    <div className='price'>
                        <p>Price</p>

                    </div>



                </div>


            </div>




        </div>

    )
}
export default Add_stock;


