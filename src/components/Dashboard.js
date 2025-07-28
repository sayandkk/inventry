import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { database } from "./Firebase";
import { useNavigate } from 'react-router-dom';
import "./Dashboard.css";

function Dashboard() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const itemsCollection = collection(database, "items");
                const itemsSnapshot = await getDocs(itemsCollection);
                const itemsArray = itemsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setItems(itemsArray);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching items:", error);
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    // Calculate analytics
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
    const lowStockItems = items.filter(item => Number(item.quantity || 0) < 10);
    const outOfStockItems = items.filter(item => Number(item.quantity || 0) === 0);

    // Category breakdown
    const categoryStats = items.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = { count: 0, value: 0 };
        }
        acc[category].count += 1;
        acc[category].value += Number(item.price || 0) * Number(item.quantity || 0);
        return acc;
    }, {});

    // Recent items (last 5)
    const recentItems = items
        .filter(item => item.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    // Top value items
    const topValueItems = items
        .map(item => ({
            ...item,
            totalValue: Number(item.price || 0) * Number(item.quantity || 0)
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);

    // Print functions
    const handlePrint = () => {
        window.print();
    };

    const handlePrintInventory = () => {
        const printWindow = window.open('', '_blank');
        const currentDate = new Date().toLocaleDateString();

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Complete Inventory Report - ${currentDate}</title>
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
                    <div class="report-title">Complete Inventory Report</div>
                    <div class="date">Generated on: ${currentDate}</div>
                </div>
                
                <div class="summary">
                    <div class="summary-item"><strong>Total Items:</strong> ${totalItems}</div>
                    <div class="summary-item"><strong>Total Quantity:</strong> ${totalQuantity}</div>
                    <div class="summary-item"><strong>Total Value:</strong> ₹${totalValue.toLocaleString()}</div>
                    <div class="summary-item"><strong>Low Stock Items:</strong> ${lowStockItems.length}</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Price (₹)</th>
                            <th>Total Value (₹)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => {
            const qty = Number(item.quantity || 0);
            const status = qty === 0 ? 'Out of Stock' : qty < 10 ? 'Low Stock' : 'In Stock';
            return `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.sku || 'N/A'}</td>
                                    <td>${item.category || 'N/A'}</td>
                                    <td>${qty}</td>
                                    <td>${item.unit || 'N/A'}</td>
                                    <td>${Number(item.price || 0).toFixed(2)}</td>
                                    <td>${(Number(item.price || 0) * qty).toFixed(2)}</td>
                                    <td>${status}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>This report was generated automatically by Das&Co Inventory Management System</p>
                    <p>For any queries, please contact the inventory management team</p>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-wrapper">
                {/* Print Header (only visible when printing) */}
                <div className="print-header">
                    <div style={{ fontSize: '20pt', fontWeight: 'bold' }}>Das&Co Inventory Management</div>
                    <div style={{ fontSize: '16pt', margin: '5pt 0' }}>Dashboard Report</div>
                    <div className="print-date">Generated on: {new Date().toLocaleDateString()}</div>
                </div>

                {/* Header */}
                <div className="dashboard-header">
                    <h1 className="dashboard-title">📊 Inventory Dashboard</h1>
                    <p className="dashboard-subtitle">Real-time analytics and insights</p>
                </div>

                {/* Print Actions */}
                <div className="print-actions">
                    <button className="print-btn" onClick={handlePrint}>
                        🖨️ Print Dashboard
                    </button>
                    <button className="print-btn" onClick={handlePrintInventory}>
                        📋 Print Complete Inventory
                    </button>
                </div>

                {/* Navigation */}
                <div className="nav-buttons">
                    <button className="nav-btn active">
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

                {/* Key Metrics */}
                <div className="metrics-section">
                    <h2 className="section-title">📈 Key Metrics</h2>
                    <div className="metrics-grid">
                        <div className="metric-card metric-primary">
                            <div className="metric-icon">📦</div>
                            <div className="metric-content">
                                <div className="metric-value">{totalItems}</div>
                                <div className="metric-label">Total Items</div>
                            </div>
                        </div>

                        <div className="metric-card metric-success">
                            <div className="metric-icon">📊</div>
                            <div className="metric-content">
                                <div className="metric-value">{totalQuantity.toLocaleString()}</div>
                                <div className="metric-label">Total Quantity</div>
                            </div>
                        </div>

                        <div className="metric-card metric-warning">
                            <div className="metric-icon">💰</div>
                            <div className="metric-content">
                                <div className="metric-value">₹{totalValue.toLocaleString()}</div>
                                <div className="metric-label">Total Value</div>
                            </div>
                        </div>

                        <div className="metric-card metric-danger">
                            <div className="metric-icon">⚠️</div>
                            <div className="metric-content">
                                <div className="metric-value">{lowStockItems.length}</div>
                                <div className="metric-label">Low Stock Alerts</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                    <div className="chart-grid">
                        {/* Category Breakdown */}
                        <div className="chart-card">
                            <h3 className="chart-title">📊 Category Breakdown</h3>
                            <div className="category-chart">
                                {Object.entries(categoryStats).map(([category, stats]) => {
                                    const percentage = (stats.count / totalItems * 100).toFixed(1);
                                    return (
                                        <div key={category} className="category-item">
                                            <div className="category-info">
                                                <span className="category-name">{category}</span>
                                                <span className="category-stats">{stats.count} items ({percentage}%)</span>
                                            </div>
                                            <div className="category-bar">
                                                <div
                                                    className="category-progress"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="category-value">₹{stats.value.toLocaleString()}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Stock Status */}
                        <div className="chart-card">
                            <h3 className="chart-title">📋 Stock Status</h3>
                            <div className="stock-status">
                                <div className="status-item status-good">
                                    <div className="status-count">{items.length - lowStockItems.length}</div>
                                    <div className="status-label">In Stock</div>
                                </div>
                                <div className="status-item status-warning">
                                    <div className="status-count">{lowStockItems.length - outOfStockItems.length}</div>
                                    <div className="status-label">Low Stock</div>
                                </div>
                                <div className="status-item status-danger">
                                    <div className="status-count">{outOfStockItems.length}</div>
                                    <div className="status-label">Out of Stock</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tables Section */}
                <div className="tables-section">
                    <div className="table-grid">
                        {/* Recent Items */}
                        <div className="table-card">
                            <h3 className="table-title">🕒 Recently Added Items</h3>
                            <div className="table-content">
                                {recentItems.length === 0 ? (
                                    <p className="empty-message">No recent items</p>
                                ) : (
                                    <table className="mini-table">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Category</th>
                                                <th>Quantity</th>
                                                <th>Added</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="item-name">{item.name}</td>
                                                    <td>
                                                        <span className="category-tag">
                                                            {item.category || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>{item.quantity} {item.unit}</td>
                                                    <td className="date-cell">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Top Value Items */}
                        <div className="table-card">
                            <h3 className="table-title">💎 Top Value Items</h3>
                            <div className="table-content">
                                {topValueItems.length === 0 ? (
                                    <p className="empty-message">No items found</p>
                                ) : (
                                    <table className="mini-table">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Total Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topValueItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="item-name">{item.name}</td>
                                                    <td>{item.quantity} {item.unit}</td>
                                                    <td>₹{Number(item.price || 0).toFixed(2)}</td>
                                                    <td className="value-cell">₹{Number(item.totalValue || 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                {lowStockItems.length > 0 && (
                    <div className="alerts-section">
                        <h2 className="section-title">⚠️ Low Stock Alerts</h2>
                        <div className="alerts-grid">
                            {lowStockItems.map((item) => (
                                <div key={item.id} className="alert-card">
                                    <div className="alert-icon">📦</div>
                                    <div className="alert-content">
                                        <div className="alert-title">{item.name}</div>
                                        <div className="alert-message">
                                            Only {item.quantity} {item.unit} remaining
                                        </div>
                                    </div>
                                    <div className="alert-action">
                                        <button
                                            className="btn-small"
                                            onClick={() => navigate("/Add_stock")}
                                        >
                                            Restock
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
