import React, { useState, useEffect } from "react";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
} from "firebase/firestore";
import { database } from "./Firebase";
import { useNavigate } from 'react-router-dom';
import "./Add_stock.css";

function Sell() {
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const [showCheckout, setShowCheckout] = useState(false);
    const navigate = useNavigate();

    const categories = ["Electronics", "Groceries", "Clothing", "Books", "Tools", "Medical", "Sports", "Other"];

    useEffect(() => {
        const fetchItems = async () => {
            const itemsCollection = collection(database, "items");
            const itemsSnapshot = await getDocs(itemsCollection);
            const itemsArray = itemsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Filter only items with stock > 0
            const inStockItems = itemsArray.filter(item => Number(item.quantity || 0) > 0);
            setItems(inStockItems.sort((a, b) => a.name.localeCompare(b.name)));
        };

        fetchItems();
    }, []);

    const getFilteredItems = () => {
        let filtered = items;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        return filtered;
    };

    const addToCart = (item, quantity) => {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        const totalInCart = existingItem ? existingItem.quantity : 0;

        if (totalInCart + quantity > Number(item.quantity || 0)) {
            alert(`Only ${Number(item.quantity || 0) - totalInCart} items available in stock`);
            return;
        }

        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + quantity }
                    : cartItem
            ));
        } else {
            setCart([...cart, { ...item, quantity: quantity }]);
        }
    };

    const updateCartQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        const item = items.find(i => i.id === itemId);
        if (newQuantity > Number(item.quantity || 0)) {
            alert(`Only ${Number(item.quantity || 0)} items available in stock`);
            return;
        }

        setCart(cart.map(cartItem =>
            cartItem.id === itemId
                ? { ...cartItem, quantity: newQuantity }
                : cartItem
        ));
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + (Number(item.price || 0) * item.quantity), 0);
    };

    const processSale = async () => {
        if (cart.length === 0) {
            alert("Cart is empty");
            return;
        }

        if (!customerInfo.name) {
            alert("Please enter customer name");
            return;
        }

        try {
            // Create sale record
            const salesCollection = collection(database, "sales");
            const saleData = {
                customerInfo,
                items: cart,
                totalAmount: getTotalAmount(),
                saleDate: new Date().toISOString(),
                status: "completed"
            };

            await addDoc(salesCollection, saleData);

            // Update inventory quantities
            for (const cartItem of cart) {
                const itemDoc = doc(database, "items", cartItem.id);
                const currentItem = await getDoc(itemDoc);
                const newQuantity = Number(currentItem.data().quantity || 0) - cartItem.quantity;

                await updateDoc(itemDoc, {
                    quantity: newQuantity,
                    updatedAt: new Date().toISOString()
                });
            }

            // Reset form
            setCart([]);
            setCustomerInfo({ name: "", email: "", phone: "" });
            setShowCheckout(false);

            // Refresh items
            const itemsCollection = collection(database, "items");
            const itemsSnapshot = await getDocs(itemsCollection);
            const itemsArray = itemsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const inStockItems = itemsArray.filter(item => Number(item.quantity || 0) > 0);
            setItems(inStockItems.sort((a, b) => a.name.localeCompare(b.name)));

            alert("Sale completed successfully!");
        } catch (error) {
            console.error("Error processing sale:", error);
            alert("Error processing sale");
        }
    };

    // Print functions
    const handlePrintReceipt = () => {
        if (cart.length === 0) {
            alert("Cart is empty. Add items to generate a receipt.");
            return;
        }

        const printWindow = window.open('', '_blank');
        const currentDate = new Date().toLocaleString();

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sales Receipt - ${currentDate}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; max-width: 400px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .company-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
                    .receipt-title { font-size: 16px; margin-bottom: 5px; }
                    .date { font-size: 12px; color: #666; }
                    .customer-info { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #000; padding: 5px; text-align: left; }
                    th { background-color: #f0f0f0; font-weight: bold; font-size: 12px; }
                    td { font-size: 11px; }
                    .total-row { font-weight: bold; background-color: #f9f9f9; }
                    .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #666; }
                    .text-right { text-align: right; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">Das&Co</div>
                    <div class="receipt-title">Sales Receipt</div>
                    <div class="date">${currentDate}</div>
                </div>
                
                <div class="customer-info">
                    <strong>Customer Information:</strong><br>
                    Name: ${customerInfo.name || 'Walk-in Customer'}<br>
                    ${customerInfo.email ? `Email: ${customerInfo.email}<br>` : ''}
                    ${customerInfo.phone ? `Phone: ${customerInfo.phone}<br>` : ''}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cart.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td class="text-right">₹${Number(item.price || 0).toFixed(2)}</td>
                                <td class="text-right">₹${(Number(item.price || 0) * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3"><strong>TOTAL</strong></td>
                            <td class="text-right"><strong>₹${getTotalAmount().toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>

                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Das&Co Inventory Management System</p>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
    };

    const handlePrintAvailableItems = () => {
        const availableItems = getFilteredItems();
        const printWindow = window.open('', '_blank');
        const currentDate = new Date().toLocaleDateString();

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Available Items for Sale - ${currentDate}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                    .report-title { font-size: 18px; margin-bottom: 5px; }
                    .date { font-size: 12px; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #f0f0f0; font-weight: bold; }
                    .summary { margin-bottom: 20px; }
                    .summary-item { display: inline-block; margin-right: 30px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">Das&Co Inventory Management</div>
                    <div class="report-title">Available Items for Sale</div>
                    <div class="date">Generated on: ${currentDate}</div>
                </div>
                
                <div class="summary">
                    <div class="summary-item"><strong>Available Items:</strong> ${availableItems.length}</div>
                    <div class="summary-item"><strong>Total Stock:</strong> ${availableItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Available Qty</th>
                            <th>Unit</th>
                            <th>Price (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${availableItems.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.sku || 'N/A'}</td>
                                <td>${item.category || 'N/A'}</td>
                                <td>${item.quantity}</td>
                                <td>${item.unit || 'N/A'}</td>
                                <td>₹${Number(item.price || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>This report shows all items currently available for sale</p>
                    <p>Das&Co Inventory Management System</p>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="inventory-container">
            <div className="inventory-wrapper">
                {/* Header */}
                <div className="inventory-header">
                    <h1 className="inventory-title">💰 Sales Point</h1>
                    <p className="inventory-subtitle">Sell items and manage transactions</p>
                </div>

                {/* Print Actions */}
                <div className="print-actions">
                    <button className="print-btn" onClick={handlePrintReceipt}>
                        🧾 Print Receipt
                    </button>
                    <button className="print-btn" onClick={handlePrintAvailableItems}>
                        📋 Print Available Items
                    </button>
                </div>

                {/* Navigation */}
                <div className="nav-buttons">
                    <button
                        className="nav-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        className="nav-btn"
                        onClick={() => navigate("/Add_stock")}
                    >
                        📦 Manage Stock
                    </button>
                    <button
                        className="nav-btn"
                        onClick={() => navigate("/suppliers")}
                    >
                        🏢 Suppliers
                    </button>
                    <button className="nav-btn active">
                        💰 Sell Items
                    </button>
                    <button
                        className="nav-btn"
                        onClick={() => navigate("/home")}
                    >
                        🏠 Home
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Products Section */}
                    <div>
                        {/* Search and Filter */}
                        <div className="form-section">
                            <h2 className="form-title">🔍 Find Products</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Search Products</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="Search by name or SKU..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Filter by Category</label>
                                    <select
                                        className="form-select"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="form-section">
                            <h2 className="form-title">🛍️ Available Products ({getFilteredItems().length})</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {getFilteredItems().map((item) => (
                                    <div key={item.id} style={{
                                        background: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s ease'
                                    }}>
                                        {/* Product Image */}
                                        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '120px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    background: '#f3f4f6',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '2rem'
                                                }}>
                                                    📦
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                                                {item.name}
                                            </h3>
                                            <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                                                SKU: {item.sku || 'N/A'} | Category: {item.category || 'N/A'}
                                            </p>
                                            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#059669' }}>
                                                    ₹{Number(item.price || 0).toFixed(2)}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.875rem',
                                                    color: Number(item.quantity || 0) < 10 ? '#ef4444' : '#16a34a',
                                                    fontWeight: '500'
                                                }}>
                                                    Stock: {item.quantity} {item.unit}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Add to Cart */}
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input
                                                type="number"
                                                min="1"
                                                max={Number(item.quantity || 0)}
                                                defaultValue="1"
                                                style={{
                                                    flex: '1',
                                                    padding: '0.5rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem'
                                                }}
                                                id={`quantity-${item.id}`}
                                            />
                                            <button
                                                style={{
                                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => {
                                                    const quantity = parseInt(document.getElementById(`quantity-${item.id}`).value);
                                                    addToCart(item, quantity);
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, #059669, #047857)';
                                                    e.target.style.transform = 'translateY(-1px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                                                    e.target.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                🛒 Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {getFilteredItems().length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                                    <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                                        {searchTerm || selectedCategory
                                            ? "🔍 No products match your search"
                                            : "📦 No products available for sale"}
                                    </p>
                                    <p style={{ fontSize: '0.875rem' }}>
                                        {searchTerm || selectedCategory
                                            ? "Try adjusting your search or filters"
                                            : "Add some inventory items first"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Section */}
                    <div>
                        <div className="form-section" style={{ position: 'sticky', top: '2rem' }}>
                            <h2 className="form-title">🛒 Shopping Cart ({cart.length})</h2>

                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    <p>🛒 Cart is empty</p>
                                    <p style={{ fontSize: '0.875rem' }}>Add some items to get started</p>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items */}
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                                        {cart.map((item) => (
                                            <div key={item.id} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.75rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                marginBottom: '0.5rem',
                                                background: '#f9fafb'
                                            }}>
                                                <div style={{ flex: '1' }}>
                                                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                        ₹{Number(item.price || 0).toFixed(2)} each
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={Number(item.quantity || 0)}
                                                        value={cart.find(c => c.id === item.id)?.quantity || 1}
                                                        onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value))}
                                                        style={{
                                                            width: '60px',
                                                            padding: '0.25rem',
                                                            border: '1px solid #d1d5db',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        style={{
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div style={{
                                        borderTop: '2px solid #e5e7eb',
                                        paddingTop: '1rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: '1.25rem',
                                            fontWeight: '700',
                                            color: '#1f2937'
                                        }}>
                                            <span>Total:</span>
                                            <span>₹{getTotalAmount().toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    {!showCheckout ? (
                                        <button
                                            className="submit-btn"
                                            onClick={() => setShowCheckout(true)}
                                            style={{ width: '100%' }}
                                        >
                                            💳 Proceed to Checkout
                                        </button>
                                    ) : (
                                        <div>
                                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                                                Customer Information
                                            </h3>
                                            <div className="form-group">
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    placeholder="Customer Name *"
                                                    value={customerInfo.name}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    className="form-input"
                                                    type="email"
                                                    placeholder="Email (optional)"
                                                    value={customerInfo.email}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    className="form-input"
                                                    type="tel"
                                                    placeholder="Phone (optional)"
                                                    value={customerInfo.phone}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="submit-btn"
                                                    onClick={processSale}
                                                    style={{ flex: '1' }}
                                                >
                                                    ✅ Complete Sale
                                                </button>
                                                <button
                                                    className="cancel-btn"
                                                    onClick={() => setShowCheckout(false)}
                                                    style={{ flex: '1' }}
                                                >
                                                    ❌ Back
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sell;
