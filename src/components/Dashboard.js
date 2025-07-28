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
                {/* Header */}
                <div className="dashboard-header">
                    <h1 className="dashboard-title">📊 Inventory Dashboard</h1>
                    <p className="dashboard-subtitle">Real-time analytics and insights</p>
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
