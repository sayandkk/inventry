import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { database } from "./Firebase";
import "./Add_stock.css";

function Add_stock() {
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemUnit, setItemUnit] = useState(""); // Added state for unit
  const [itemPrice, setItemPrice] = useState("");
  const [items, setItems] = useState([]);
  const [editItemId, setEditItemId] = useState(null);

  // Define unit options
  const unitOptions = ["Kg", "Litre", "Meter", "Piece"];

  useEffect(() => {
    const fetchItems = async () => {
      const itemsCollection = collection(database, "items");
      const itemsSnapshot = await getDocs(itemsCollection);
      const itemsArray = itemsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsArray);
    };

    fetchItems();
  }, []);

  const addItem = async () => {
    if (itemName && itemQuantity && itemPrice && itemUnit) {
      try {
        const itemsCollection = collection(database, "items");

        if (editItemId) {
          const itemDoc = doc(database, "items", editItemId);
          await updateDoc(itemDoc, {
            name: itemName,
            quantity: itemQuantity,
            unit: itemUnit,
            price: itemPrice,
          });

          setEditItemId(null);
        } else {
          await addDoc(itemsCollection, {
            name: itemName,
            quantity: itemQuantity,
            unit: itemUnit,
            price: itemPrice,
          });
        }

        setItemName("");
        setItemQuantity("");
        setItemUnit("");
        setItemPrice("");

        // Fetch items again to update the items state
        const updatedItemsSnapshot = await getDocs(itemsCollection);
        const updatedItemsArray = updatedItemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(updatedItemsArray);
      } catch (error) {
        console.error(
          "Error adding/updating item to Firestore:",
          error.message
        );
      }
    } else {
      alert("Please fill in all fields");
    }
  };

  const editItem = (id) => {
    const selectedItem = items.find((item) => item.id === id);
    if (selectedItem) {
      setItemName(selectedItem.name);
      setItemQuantity(selectedItem.quantity);
      setItemUnit(selectedItem.unit);
      setItemPrice(selectedItem.price);
      setEditItemId(id);
    }
  };

  return (
    <div className="adding">
      <h1>ADD STOCK</h1>
      <div className="inpubox">
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
        <select
          className="adop"
          value={itemUnit}
          onChange={(e) => setItemUnit(e.target.value)}
        >
          <option value="" disabled>
            Select Unit
          </option>
          {unitOptions.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Price per unit"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
        />
        <button className="adbutton" onClick={addItem}>
          {editItemId ? "Update Item" : "Add Item"}
        </button>
      </div>
      <ul className="adul">
        {items.map((item) => (
          <div key={item.id} className="result">
            <p className="adr">
              Name: <p className="adp">{item.name}</p>
            </p>
            <p className="adr">
              Quantity:{" "}
              <p className="adp">
                {item.quantity} {item.unit}
              </p>
            </p>
            <p className="adr">
              Price:{" "}
              <p className="adp">
                {item.price}
                {"₹"}/{item.unit}
              </p>
            </p>
            <button className="adbutton" onClick={() => editItem(item.id)}>
              Edit
            </button>
          </div>
        ))}
      </ul>
    </div>
  );
}

export default Add_stock;
