import React, { useState } from 'react';
import "./Add_stock.css"

function Add_stock() {
    const [items, setItems] = useState([]);
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState('');
    const [itemPrice, setItemPrice] = useState('');

    const addItem = () => {
        if (itemName && itemQuantity && itemPrice) {
            const newItem = {
                name: itemName,
                quantity: itemQuantity,
                price: itemPrice,
            };
            setItems([...items, newItem]);
            setItemName('');
            setItemQuantity('');
            setItemPrice('');
        } else {
            alert('Please fill in all fields');
        }
    };

    return (
        <div>
            <h1>ADD STOCK</h1>
            <div className='inpubox'>
                <input
                    type="text"
                    placeholder="Name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Quantity"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                />
                <button onClick={addItem}>Add Item</button>
            </div>
            <ul>
                {items.map((item, index) => (
                    <div key={index} className='result'>
                        <p>Name: {item.name}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: {item.price}</p>
                    </div>
                ))}
            </ul>
        </div>
    );
}

export default Add_stock;
