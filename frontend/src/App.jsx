import React, { useState, useEffect } from 'react';
import { apiRequest } from './utils/api';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import VendorList from './components/VendorList';
import VendorDetails from './components/VendorDetails';
import VendorForm from './components/VendorForm';
import RequestList from './components/RequestList';
import RequestDetails from './components/RequestDetails';
import RequestForm from './components/RequestForm';
import QuoteForm from './components/QuoteForm';
import CompareMatrix from './components/CompareMatrix';

export default function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('dashboard'); // dashboard, vendors, vendor-details, requests, request-details, compare, submit-quote, vendor-add, vendor-edit, request-add, request-edit
    const [selectedId, setSelectedId] = useState(null);
    const [authView, setAuthView] = useState('login'); // login, register
    
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Apply theme changes to document element
    useEffect(() => {
        const html = document.documentElement;
        if (isDarkMode) {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // Check user authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await apiRequest('/api/me/');
                if (data.authenticated) {
                    setUser(data.user);
                }
            } catch (err) {
                // Not logged in, keep user null
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, []);

    // Alert helper
    const addAlert = (message, type = 'info') => {
        const id = Date.now() + Math.random();
        setAlerts(prev => [...prev, { id, message, type }]);
        
        // Auto dismiss after 4 seconds
        setTimeout(() => {
            setAlerts(prev => prev.filter(alert => alert.id !== id));
        }, 4000);
    };

    const handleLogout = async () => {
        try {
            await apiRequest('/api/logout/', 'POST');
            setUser(null);
            setView('dashboard');
            addAlert('You have been logged out successfully.', 'info');
        } catch (err) {
            addAlert('Failed to log out.', 'error');
        }
    };

    if (checkingAuth) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', fontFamily: 'Outfit' }}>
                <h3>Loading Teyzix Procure...</h3>
            </div>
        );
    }

    // Render Login / Register if user is not authenticated
    if (!user) {
        return (
            <div style={{ fontFamily: 'Outfit' }}>
                {authView === 'login' ? (
                    <Login 
                        onLoginSuccess={setUser} 
                        onNavigateToRegister={() => setAuthView('register')}
                        addAlert={addAlert} 
                    />
                ) : (
                    <Register 
                        onRegisterSuccess={setUser} 
                        onNavigateToLogin={() => setAuthView('login')}
                        addAlert={addAlert} 
                    />
                )}
                
                {/* Float Alerts for login page */}
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, width: '320px' }}>
                    {alerts.map(alert => (
                        <div key={alert.id} className={`alert alert-${alert.type}`} style={{ boxShadow: 'var(--shadow-lg)' }}>
                            <span>{alert.message}</span>
                            <button className="alert-close" onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}>&times;</button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Get current view title
    const getViewTitle = () => {
        switch (view) {
            case 'dashboard': return 'Procurement Dashboard';
            case 'vendors': return 'Vendor Directory';
            case 'vendor-details': return 'Vendor Profile';
            case 'vendor-add': return 'Add New Vendor';
            case 'vendor-edit': return 'Edit Vendor Details';
            case 'requests': return 'Quotation Requests';
            case 'request-details': return 'Quotation Bids';
            case 'request-add': return 'Create Quotation Request';
            case 'request-edit': return 'Edit Request Details';
            case 'submit-quote': return 'Submit Quote Proposal';
            case 'compare': return 'Proposal Comparison';
            default: return 'Overview';
        }
    };

    // Render active component
    const renderActiveView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard setView={setView} setSelectedId={setSelectedId} addAlert={addAlert} />;
            case 'vendors':
                return <VendorList setView={setView} setSelectedId={setSelectedId} addAlert={addAlert} />;
            case 'vendor-details':
                return <VendorDetails vendorId={selectedId} setView={setView} setSelectedId={setSelectedId} addAlert={addAlert} />;
            case 'vendor-add':
                return <VendorForm setView={setView} addAlert={addAlert} />;
            case 'vendor-edit':
                return <VendorForm vendorId={selectedId} setView={setView} addAlert={addAlert} />;
            case 'requests':
                return <RequestList setView={setView} setSelectedId={setSelectedId} addAlert={addAlert} />;
            case 'request-details':
                return <RequestDetails requestId={selectedId} setView={setView} setSelectedId={setSelectedId} addAlert={addAlert} />;
            case 'request-add':
                return <RequestForm setView={setView} addAlert={addAlert} />;
            case 'request-edit':
                return <RequestForm requestId={selectedId} setView={setView} addAlert={addAlert} />;
            case 'submit-quote':
                return <QuoteForm requestId={selectedId} setView={setView} addAlert={addAlert} />;
            case 'compare':
                return <CompareMatrix requestId={selectedId} setView={setView} setSelectedId={setSelectedId} addAlert={addAlert} />;
            default:
                return <Dashboard setView={setView} setSelectedId={setSelectedId} addAlert={addAlert} />;
        }
    };

    return (
        <div className="app-container" style={{ fontFamily: 'Outfit' }}>
            {/* Sidebar Navigation */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <h1>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                            <path d="M12 2v20"></path>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span>Teyzix React</span>
                    </h1>
                </div>
                
                <div className="sidebar-nav">
                    <button 
                        className={`sidebar-link ${view === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setView('dashboard'); setSidebarOpen(false); }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                        <span>Dashboard</span>
                    </button>
                    
                    <button 
                        className={`sidebar-link ${view.startsWith('vendor') ? 'active' : ''}`}
                        onClick={() => { setView('vendors'); setSidebarOpen(false); }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>Vendors</span>
                    </button>
                    
                    <button 
                        className={`sidebar-link ${view.startsWith('request') || view === 'compare' ? 'active' : ''}`}
                        onClick={() => { setView('requests'); setSidebarOpen(false); }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                        <span>Requests</span>
                    </button>
                    
                    <button 
                        className={`sidebar-link ${view === 'submit-quote' ? 'active' : ''}`}
                        onClick={() => { setSelectedId(null); setView('submit-quote'); setSidebarOpen(false); }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>Submit Quote</span>
                    </button>
                </div>

                <div className="sidebar-footer">
                    <div className="user-badge">
                        <div className="user-avatar">
                            {user.username.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user.username}</span>
                            <span className="user-role">Administrator</span>
                        </div>
                    </div>
                    
                    <button onClick={handleLogout} className="logout-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Body Workspace */}
            <main className="main-content">
                <header>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                            id="mobile-menu-toggle"
                            className="theme-toggle no-print" 
                            style={{ display: 'none' }} /* shown via CSS media query */
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <div className="page-title">
                            <h2>{getViewTitle()}</h2>
                        </div>
                    </div>
                    <div className="header-actions">
                        {/* Theme Toggle */}
                        <button 
                            className="theme-toggle" 
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? (
                                /* Sun Icon */
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="23"></line>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line x1="21" y1="12" x2="23" y2="12"></line>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                </svg>
                            ) : (
                                /* Moon Icon */
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                </svg>
                            )}
                        </button>
                        
                        <span className="no-print" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            Hi, <strong>{user.username}</strong>
                        </span>
                    </div>
                </header>

                <div className="content-wrapper">
                    {/* Notifications / Alerts Section */}
                    {alerts.length > 0 && (
                        <div className="alert-messages">
                            {alerts.map(alert => (
                                <div key={alert.id} className={`alert alert-${alert.type}`}>
                                    <span>{alert.message}</span>
                                    <button className="alert-close" onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}>&times;</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Render active sub-view component */}
                    {renderActiveView()}
                </div>
            </main>
        </div>
    );
}
