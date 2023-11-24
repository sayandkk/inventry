import React, { useState, useEffect } from "react";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import { database } from "./Firebase";
import "./Add_stock.css";

function Sell() {
    const [itemName, setItemName] = useState("");
    const [itemQuantity, setItemQuantity] = useState("");
    const [itemUnit, setItemUnit] = useState("");
    const [itemPrice, setItemPrice] = useState("");
    const [items, setItems] = useState([]);
    const [editItemId, setEditItemId] = useState(null);
    const [newQuantities, setNewQuantities] = useState({});

    const unitOptions = ["Kg", "Litre", "Meter", "Piece"];

    useEffect(() => {
        const fetchItems = async () => {
            const itemsCollection = collection(database, "items");
            const itemsSnapshot = await getDocs(itemsCollection);
            const itemsArray = itemsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Sort items alphabetically based on their names
            const sortedItems = itemsArray.sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            setItems(sortedItems);
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

                const updatedItemsSnapshot = await getDocs(itemsCollection);
                const updatedItemsArray = updatedItemsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Sort items alphabetically based on their names after the update
                const sortedItems = updatedItemsArray.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

                setItems(sortedItems);
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

    const deleteItem = async (id) => {
        try {
            const itemDoc = doc(database, "items", id);

            if (newQuantities[id] !== "") {
                const currentDoc = await getDoc(itemDoc);
                const currentQuantity = currentDoc.data().quantity;

                // Calculate the remaining quantity after deletion
                const remainingQuantity =
                    currentQuantity - parseInt(newQuantities[id], 10);

                if (remainingQuantity <= 0) {
                    // If remaining quantity is zero or negative, delete the item
                    await deleteDoc(itemDoc);

                    // Update the items state after deletion
                    const updatedItems = items.filter((item) => item.id !== id);
                    setItems(updatedItems);
                } else {
                    // If remaining quantity is positive, update the item with the new quantity
                    await updateDoc(itemDoc, { quantity: remainingQuantity });

                    // Fetch the updated item data after the update
                    const updatedItemDoc = await getDoc(itemDoc);
                    const updatedItem = {
                        id: updatedItemDoc.id,
                        ...updatedItemDoc.data(),
                    };

                    // Update the items state with the modified item
                    const updatedItems = items.map((item) =>
                        item.id === updatedItem.id ? updatedItem : item
                    );
                    setItems(updatedItems);
                }

                // Reset the new quantity for the item
                setNewQuantities({ ...newQuantities, [id]: "" });
            }
        } catch (error) {
            console.error("Error updating/deleting item in Firestore:", error.message);
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

            // Initialize the new quantity state for the edited item
            setNewQuantities({ ...newQuantities, [id]: "" });
        }
    };

    return (
        <div className="adding">
            <h1>Sells</h1>
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
            <table className="adtable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>
                                {item.quantity} {item.unit}
                            </td>
                            <td>{item.unit}</td>
                            <td>
                                {item.price}
                                {"₹"}/{item.unit}
                            </td>
                            <td>
                                <input
                                    type="number"
                                    id={`newQuantity-${item.id}`}
                                    value={newQuantities[item.id]}
                                    onChange={(e) =>
                                        setNewQuantities({
                                            ...newQuantities,
                                            [item.id]: e.target.value,
                                        })
                                    }
                                />
                            </td>
                            <td>
                                <button className="adbutton" onClick={() => editItem(item.id)}>
                                    Edit
                                </button>
                            </td>
                            <td>
                                <button
                                    className="adbutton"
                                    onClick={() => deleteItem(item.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Sell;
