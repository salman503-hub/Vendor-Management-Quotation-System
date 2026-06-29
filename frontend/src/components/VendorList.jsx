import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function VendorList({ setView, setSelectedId, addAlert }) {
    const [vendors, setVendors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await apiRequest('/api/vendors/');
                setVendors(res);
            } catch (err) {
                addAlert('Failed to load vendors list.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchVendors();
    }, []);

    // Filter vendors in real time
    const filteredVendors = vendors.filter(vendor => {
        const query = searchQuery.toLowerCase();
        return (
            vendor.name.toLowerCase().includes(query) ||
            vendor.company_name.toLowerCase().includes(query) ||
            vendor.email.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Vendor Directory...</div>;
    }

    return (
        <div>
            {/* Search and Add Controls */}
            <div className="action-header">
                <div className="search-box">
                    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search vendors by name, company, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <button className="btn btn-primary" onClick={() => setView('vendor-add')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Add New Vendor</span>
                </button>
            </div>

            {/* Vendors Cards Grid */}
            {filteredVendors.length > 0 ? (
                <div className="cards-grid">
                    {filteredVendors.map((vendor) => (
                        <div className="card" key={vendor.id}>
                            <div>
                                <div className="card-title">{vendor.company_name}</div>
                                <div className="card-meta">Contact: <strong>{vendor.name}</strong></div>
                                <div className="card-body">
                                    <p style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                        <span>{vendor.email}</span>
                                    </p>
                                    <p style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        <span>{vendor.contact_number}</span>
                                    </p>
                                    <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', marginTop: '12px', color: 'var(--text-secondary)' }}>
                                        <svg style={{ marginTop: '3px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {vendor.business_address}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="card-footer">
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Joined {new Date(vendor.created_at).toLocaleDateString()}</span>
                                <button 
                                    className="btn btn-secondary btn-sm" 
                                    style={{ fontSize: '11px', padding: '4px 10px' }}
                                    onClick={() => {
                                        setSelectedId(vendor.id);
                                        setView('vendor-details');
                                    }}
                                >
                                    View Profile &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="panel" style={{ textAlign: 'center', padding: '48px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '16px' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <h3 style={{ marginBottom: '8px' }}>No Vendors Found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Add vendors or adjust your search queries.</p>
                    <button className="btn btn-primary" onClick={() => setView('vendor-add')}>Add Your First Vendor</button>
                </div>
            )}
        </div>
    );
}
