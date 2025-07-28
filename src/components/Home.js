import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export const Home = () => {
    const navigate = useNavigate();

    return (
        <div className='home-container'>
            {/* Header */}
            <header className='header'>
                <div className='header-content'>
                    <div className='logo'>Das&Co</div>
                    <h1 className='header-title'>INVENTORY MANAGEMENT SYSTEM</h1>
                    <div></div>
                </div>
            </header>

            {/* Hero Section */}
            <section className='hero-section'>
                <div className='hero-content'>
                    <div className='hero-text'>
                        <h1 className='hero-title'>
                            Maximize your warehouse efficiency
                        </h1>
                        <p className='hero-subtitle'>
                            Modern online warehouse management software designed to streamline your operations and boost productivity
                        </p>
                        <div className='hero-actions'>
                            <button
                                className='cta-button'
                                onClick={() => navigate("/dashboard")}
                            >
                                📊 View Dashboard
                            </button>
                            <button
                                className='secondary-button'
                                onClick={() => navigate("/Add_stock")}
                            >
                                📦 Manage Inventory
                            </button>
                        </div>
                    </div>
                    <div></div>
                </div>
            </section>

            {/* Features Section */}
            <section className='features-section'>
                <div className='features-container'>
                    <div className='section-header'>
                        <h2 className='section-title'>Improve performance & process time</h2>
                        <p className='section-subtitle'>
                            Better organize your warehouse with our smart double entry inventory system
                        </p>
                    </div>

                    <div className='features-grid'>
                        <div className='feature-card'>
                            <div className='feature-icon'>📦</div>
                            <h3 className='feature-title'>Smart Inventory Tracking</h3>
                            <p className='feature-description'>
                                Real-time inventory tracking with automated alerts for low stock levels and seamless restocking workflows.
                            </p>
                        </div>

                        <div className='feature-card'>
                            <div className='feature-icon'>📊</div>
                            <h3 className='feature-title'>Advanced Analytics</h3>
                            <p className='feature-description'>
                                Comprehensive reporting and analytics to help you make data-driven decisions and optimize your operations.
                            </p>
                        </div>

                        <div className='feature-card'>
                            <div className='feature-icon'>⚡</div>
                            <h3 className='feature-title'>Lightning Fast Operations</h3>
                            <p className='feature-description'>
                                Streamlined processes that reduce manual work and increase efficiency across all warehouse operations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className='stats-section'>
                <div className='stats-container'>
                    <div className='stats-grid'>
                        <div className='stat-item'>
                            <div className='stat-number'>99.9%</div>
                            <div className='stat-label'>Uptime</div>
                        </div>
                        <div className='stat-item'>
                            <div className='stat-number'>24/7</div>
                            <div className='stat-label'>Support</div>
                        </div>
                        <div className='stat-item'>
                            <div className='stat-number'>500+</div>
                            <div className='stat-label'>Happy Clients</div>
                        </div>
                        <div className='stat-item'>
                            <div className='stat-number'>1M+</div>
                            <div className='stat-label'>Items Managed</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className='about-section'>
                <div className='about-container'>
                    <div className='section-header'>
                        <h2 className='section-title'>About Our Platform</h2>
                    </div>

                    <div className='about-content'>
                        <div className='about-text'>
                            <h3 className='about-title'>Revolutionizing Warehouse Management</h3>
                            <p className='about-description'>
                                We are committed to providing you with a powerful and user-friendly platform that empowers you to make informed inventory decisions, navigate the complex world of warehouse management, and ultimately grow your business operations.
                            </p>
                            <p className='about-description'>
                                Our mission is to democratize warehouse management by offering a comprehensive, educational, and accessible resource for businesses looking to optimize their inventory operations.
                            </p>
                        </div>
                        <div className='about-image'></div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className='mission-section'>
                <div className='about-container'>
                    <div className='section-header'>
                        <h2 className='section-title'>Our Mission</h2>
                        <p className='section-subtitle'>
                            Creating a community of efficient warehouse managers
                        </p>
                    </div>

                    <div className='mission-grid'>
                        <div className='mission-card'>
                            <h3 className='mission-title'>User-Friendly Platform</h3>
                            <p className='mission-text'>
                                Intuitive interface designed for users of all technical levels, ensuring smooth operations across your team.
                            </p>
                        </div>

                        <div className='mission-card'>
                            <h3 className='mission-title'>Portfolio Management</h3>
                            <p className='mission-text'>
                                Comprehensive inventory portfolio management with detailed tracking and forecasting capabilities.
                            </p>
                        </div>

                        <div className='mission-card'>
                            <h3 className='mission-title'>News and Updates</h3>
                            <p className='mission-text'>
                                Stay updated with the latest inventory management trends and best practices in the industry.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home;
