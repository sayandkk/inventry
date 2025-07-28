import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { database } from "./Firebase";
import { useNavigate } from 'react-router-dom';
import "./Suppliers.css";

function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        category: "",
        notes: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const categories = ["Electronics", "Groceries", "Clothing", "Books", "Tools", "Medical", "Sports", "Other"];

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const suppliersCollection = collection(database, "suppliers");
            const suppliersSnapshot = await getDocs(suppliersCollection);
            const suppliersArray = suppliersSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setSuppliers(suppliersArray.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            const timestamp = new Date().toISOString();
            const suppliersCollection = collection(database, "suppliers");

            if (editingId) {
                const supplierDoc = doc(database, "suppliers", editingId);
                await updateDoc(supplierDoc, {
                    ...formData,
                    updatedAt: timestamp
                });
                setEditingId(null);
            } else {
                await addDoc(suppliersCollection, {
                    ...formData,
                    createdAt: timestamp,
                    updatedAt: timestamp
                });
            }

            setFormData({
                name: "",
                email: "",
                phone: "",
                address: "",
                category: "",
                notes: ""
            });

            fetchSuppliers();
        } catch (error) {
            console.error("Error saving supplier:", error);
        }
    };

    const handleEdit = (supplier) => {
        setFormData({
            name: supplier.name || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: supplier.address || "",
            category: supplier.category || "",
            notes: supplier.notes || ""
        });
        setEditingId(supplier.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this supplier?")) {
            try {
                await deleteDoc(doc(database, "suppliers", id));
                fetchSuppliers();
            } catch (error) {
                console.error("Error deleting supplier:", error);
            }
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="suppliers-container">
            <div className="suppliers-wrapper">
                {/* Header */}
                <div className="suppliers-header">
                    <h1 className="suppliers-title">🏢 Suppliers Management</h1>
                    <p className="suppliers-subtitle">Manage your supplier relationships</p>
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
                    <button className="nav-btn active">
                        🏢 Suppliers
                    </button>
                    <button
                        className="nav-btn"
                        onClick={() => navigate("/home")}
                    >
                        🏠 Home
                    </button>
                </div>

                {/* Search */}
                <div className="form-section">
                    <h2 className="form-title">🔍 Search Suppliers</h2>
                    <input
                        className="form-input"
                        type="text"
                        placeholder="Search by name, email, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Add/Edit Form */}
                <div className="form-section">
                    <h2 className="form-title">
                        {editingId ? "✏️ Edit Supplier" : "➕ Add New Supplier"}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Supplier Name *</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    name="name"
                                    placeholder="Enter supplier name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    className="form-input"
                                    type="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone *</label>
                                <input
                                    className="form-input"
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <textarea
                                className="form-textarea"
                                name="address"
                                placeholder="Enter supplier address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-textarea"
                                name="notes"
                                placeholder="Additional notes about the supplier"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn">
                                {editingId ? "🔄 Update Supplier" : "➕ Add Supplier"}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({
                                            name: "",
                                            email: "",
                                            phone: "",
                                            address: "",
                                            category: "",
                                            notes: ""
                                        });
                                    }}
                                >
                                    ❌ Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Suppliers Table */}
                <div className="table-section">
                    <div className="table-header">
                        <h2 className="table-title">📋 Suppliers List ({filteredSuppliers.length})</h2>
                    </div>

                    <div className="table-container">
                        <table className="suppliers-table">
                            <thead>
                                <tr>
                                    <th>Supplier Details</th>
                                    <th>Contact</th>
                                    <th>Category</th>
                                    <th>Address</th>
                                    <th>Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuppliers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                                            <div>
                                                <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                                                    {searchTerm
                                                        ? "🔍 No suppliers match your search"
                                                        : "🏢 No suppliers added yet"}
                                                </p>
                                                <p style={{ fontSize: '0.875rem' }}>
                                                    {searchTerm
                                                        ? "Try adjusting your search terms"
                                                        : "Add your first supplier to get started!"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSuppliers.map((supplier) => (
                                        <tr key={supplier.id}>
                                            <td>
                                                <div className="supplier-info">
                                                    <div className="supplier-name">{supplier.name}</div>
                                                    {supplier.notes && (
                                                        <div className="supplier-notes">{supplier.notes}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-info">
                                                    <div>📧 {supplier.email}</div>
                                                    <div>📞 {supplier.phone}</div>
                                                </div>
                                            </td>
                                            <td>
                                                {supplier.category ? (
                                                    <span className="category-badge">
                                                        {supplier.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">No category</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="address-cell">
                                                    {supplier.address || "No address provided"}
                                                </div>
                                            </td>
                                            <td className="date-cell">
                                                {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'Unknown'}
                                            </td>
                                            <td>
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={() => handleEdit(supplier)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => handleDelete(supplier.id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary */}
                {suppliers.length > 0 && (
                    <div className="form-section">
                        <h2 className="form-title">📊 Suppliers Summary</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0ea5e9' }}>{suppliers.length}</div>
                                <div style={{ color: '#0369a1', fontWeight: '600' }}>Total Suppliers</div>
                            </div>
                            {Object.entries(
                                suppliers.reduce((acc, supplier) => {
                                    const cat = supplier.category || 'Uncategorized';
                                    acc[cat] = (acc[cat] || 0) + 1;
                                    return acc;
                                }, {})
                            ).map(([category, count]) => (
                                <div key={category} style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>{count}</div>
                                    <div style={{ color: '#16a34a', fontWeight: '600' }}>{category}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Suppliers;
