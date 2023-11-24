import React, { Component } from 'react';
import { BrowserRouter, Link, Router, Routes, useNavigate } from "react-router-dom"
import { Route } from 'react-router-dom';
import Login from './components/Login';
import Add_stock from './components/Add_stock';
import Sell from './components/Sell';


import Home from './components/Home';
import './App.css';

function App() {



  return (


    <BrowserRouter>

      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='home' element={<Home />} />
        <Route path='Add_stock' element={<Add_stock />} />
        <Route path='Sell' element={<Sell />} />


      </Routes>
    </BrowserRouter>






  );
}


export default App;
