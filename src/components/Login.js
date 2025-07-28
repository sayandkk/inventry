import React from 'react'
import "./Login.css"
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button';

function Login() {
    const navigate = useNavigate();

    return (
        <div className='login'>
            <div className="login-container">
                <div className="login-header">
                    <h1 className="login-title">Das&Co</h1>
                    <p className="login-subtitle">Advanced Inventory Management System</p>
                </div>

                <Button
                    onClick={() => navigate("/home")}
                    className='logbtn'
                    variant="contained"
                    size="large"
                >
                    Enter Dashboard
                </Button>

                <div className="login-features">
                    <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        Real-time inventory tracking
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        Smart stock management
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        Advanced analytics & reporting
                    </div>
                </div>

                <div className="company-info">
                    <div className="company-name">Das&Co</div>
                    <div className="company-tagline">Streamlining warehouse operations since 2024</div>
                </div>
            </div>
        </div>
    )
}

export default Login