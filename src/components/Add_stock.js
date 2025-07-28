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
import { useNavigate } from 'react-router-dom';
import "./Add_stock.css";

function Add_stock() {
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemSKU, setItemSKU] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [items, setItems] = useState([]);
  const [editItemId, setEditItemId] = useState(null);
  const [newQuantities, setNewQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const navigate = useNavigate();

  const unitOptions = ["Kg", "Litre", "Meter", "Piece", "Pack", "Box"];
  const categories = ["Electronics", "Groceries", "Clothing", "Books", "Tools", "Medical", "Sports", "Other"];
  const stockFilters = ["all", "low-stock", "out-of-stock", "in-stock"];

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
    if (itemName && itemQuantity && itemPrice && itemUnit && itemCategory) {
      try {
        const itemsCollection = collection(database, "items");
        const timestamp = new Date().toISOString();

        // Generate SKU if not provided
        const sku = itemSKU || `SKU-${Date.now()}`;

        if (editItemId) {
          const itemDoc = doc(database, "items", editItemId);
          await updateDoc(itemDoc, {
            name: itemName,
            quantity: parseInt(itemQuantity),
            unit: itemUnit,
            price: parseFloat(itemPrice),
            sku: sku,
            category: itemCategory,
            image: itemImage,
            updatedAt: timestamp,
          });

          setEditItemId(null);
        } else {
          await addDoc(itemsCollection, {
            name: itemName,
            quantity: parseInt(itemQuantity),
            unit: itemUnit,
            price: parseFloat(itemPrice),
            sku: sku,
            category: itemCategory,
            image: itemImage,
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        }

        // Reset form
        setItemName("");
        setItemQuantity("");
        setItemUnit("");
        setItemPrice("");
        setItemSKU("");
        setItemCategory("");
        setItemImage("");

        // Refresh items
        const updatedItemsSnapshot = await getDocs(itemsCollection);
        const updatedItemsArray = updatedItemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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
      alert("Please fill in all required fields (Name, Quantity, Price, Unit, Category)");
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

          // Sort items alphabetically based on their names after deletion
          const sortedItems = updatedItems.sort((a, b) =>
            a.name.localeCompare(b.name)
          );

          setItems(sortedItems);
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

          // Sort items alphabetically based on their names after the update
          const sortedItems = updatedItems.sort((a, b) =>
            a.name.localeCompare(b.name)
          );

          setItems(sortedItems);
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
      setItemSKU(selectedItem.sku || "");
      setItemCategory(selectedItem.category || "");
      setItemImage(selectedItem.image || "");
      setEditItemId(id);

      // Initialize the new quantity state for the edited item
      setNewQuantities({ ...newQuantities, [id]: "" });
    }
  };

  // Filter and search functions
  const getFilteredItems = () => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Stock filter
    if (filterStock === "low-stock") {
      filtered = filtered.filter(item => Number(item.quantity || 0) < 10);
    } else if (filterStock === "out-of-stock") {
      filtered = filtered.filter(item => Number(item.quantity || 0) === 0);
    } else if (filterStock === "in-stock") {
      filtered = filtered.filter(item => Number(item.quantity || 0) > 0);
    }

    return filtered;
  };

  const getStockStatus = (quantity) => {
    const qty = Number(quantity || 0);
    if (qty === 0) return { status: "Out of Stock", class: "status-out-of-stock" };
    if (qty < 10) return { status: "Low Stock", class: "status-low-stock" };
    return { status: "In Stock", class: "status-in-stock" };
  };

  const deleteItemPermanently = async (id) => {
    if (window.confirm("Are you sure you want to delete this item permanently?")) {
      try {
        const itemDoc = doc(database, "items", id);
        await deleteDoc(itemDoc);

        const updatedItems = items.filter((item) => item.id !== id);
        setItems(updatedItems);
      } catch (error) {
        console.error("Error deleting item:", error.message);
      }
    }
  };

  return (
    <div className="inventory-container">
      <div className="inventory-wrapper">
        {/* Header */}
        <div className="inventory-header">
          <h1 className="inventory-title">📦 Advanced Inventory Management</h1>
          <p className="inventory-subtitle">Add, edit, and manage your inventory with smart features</p>
        </div>

        {/* Navigation */}
        <div className="nav-buttons">
          <button className="nav-btn active">
            📦 Manage Stock
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate("/dashboard")}
          >
            📊 Dashboard
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate("/suppliers")}
          >
            🏢 Suppliers
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate("/Sell")}
          >
            💰 Sell Items
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate("/home")}
          >
            🏠 Home
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="form-section">
          <h2 className="form-title">🔍 Search & Filter</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Search Items</label>
              <input
                className="form-input"
                type="text"
                placeholder="Search by name, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Filter by Category</label>
              <select
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Filter by Stock</label>
              <select
                className="form-select"
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
              >
                <option value="all">All Items</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock (&lt; 10)</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        <div className="form-section">
          <h2 className="form-title">
            {editItemId ? "✏️ Edit Item" : "➕ Add New Item"}
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">SKU</label>
              <input
                className="form-input"
                type="text"
                placeholder="Auto-generated if empty"
                value={itemSKU}
                onChange={(e) => setItemSKU(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                className="form-input"
                type="number"
                placeholder="Enter quantity"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit *</label>
              <select
                className="form-select"
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
            </div>

            <div className="form-group">
              <label className="form-label">Price per Unit (₹) *</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                placeholder="Enter price"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                className="form-input"
                type="url"
                placeholder="Enter image URL (optional)"
                value={itemImage}
                onChange={(e) => setItemImage(e.target.value)}
              />
            </div>
          </div>

          <button className="submit-btn" onClick={addItem}>
            {editItemId ? "🔄 Update Item" : "➕ Add Item"}
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="form-section">
          <h2 className="form-title">📊 Inventory Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0ea5e9' }}>{getFilteredItems().length}</div>
              <div style={{ color: '#0369a1', fontWeight: '600' }}>Total Items</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>
                {getFilteredItems().reduce((sum, item) => sum + Number(item.quantity || 0), 0)}
              </div>
              <div style={{ color: '#16a34a', fontWeight: '600' }}>Total Quantity</div>
            </div>
            <div style={{ background: '#fefce8', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#eab308' }}>
                ₹{getFilteredItems().reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0).toFixed(2)}
              </div>
              <div style={{ color: '#ca8a04', fontWeight: '600' }}>Total Value</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
                {getFilteredItems().filter(item => Number(item.quantity || 0) < 10).length}
              </div>
              <div style={{ color: '#dc2626', fontWeight: '600' }}>Low Stock Items</div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="table-section">
          <div className="table-header">
            <h2 className="table-title">📋 Inventory Items ({getFilteredItems().length})</h2>
          </div>

          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Item Details</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredItems().length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      <div>
                        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                          {searchTerm || filterCategory || filterStock !== "all"
                            ? "🔍 No items match your search criteria"
                            : "📦 No items in inventory"}
                        </p>
                        <p style={{ fontSize: '0.875rem' }}>
                          {searchTerm || filterCategory || filterStock !== "all"
                            ? "Try adjusting your search or filters"
                            : "Add your first item to get started!"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  getFilteredItems().map((item) => {
                    const stockStatus = getStockStatus(item.quantity || 0);
                    return (
                      <tr key={item.id}>
                        <td>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '50px',
                              height: '50px',
                              background: '#f3f4f6',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem'
                            }}>
                              📦
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            Added: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {item.sku || 'N/A'}
                        </td>
                        <td>
                          <span style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {item.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="quantity-cell">
                          {item.quantity || 0} {item.unit}
                        </td>
                        <td className="price-cell">
                          ₹{Number(item.price || 0).toFixed(2)}/{item.unit}
                        </td>
                        <td className="price-cell">
                          ₹{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                        </td>
                        <td>
                          <span className={`status-badge ${stockStatus.class}`}>
                            {stockStatus.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => editItem(item.id)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteItemPermanently(item.id)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Add_stock;
