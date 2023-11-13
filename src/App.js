import React, { Component } from 'react';
import { BrowserRouter, Link, Router, Routes, useNavigate } from "react-router-dom"
import { Route } from 'react-router-dom';
import Login from './components/Login';
import Sell from './components/Sell';
import Add_stock from './components/Add_stock';

import Home from './components/Home';
import './App.css';

function App() {



  return (


    <BrowserRouter>

      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='home' element={<Home />} />
        <Route path='Sells' element={<Sell />} />
        <Route path='Add_stock' element={<Add_stock />} />


      </Routes>
    </BrowserRouter>






  );
}


export default App;
