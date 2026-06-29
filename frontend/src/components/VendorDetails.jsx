import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function VendorDetails({ vendorId, setView, setSelectedId, addAlert }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendorDetails = async () => {
            try {
                const res = await apiRequest(`/api/vendors/${vendorId}/`);
                setData(res);
            } catch (err) {
                addAlert('Failed to load vendor details.', 'error');
                setView('vendors');
            } finally {
                setLoading(false);
            }
        };

        fetchVendorDetails();
    }, [vendorId]);

    const handleDelete = async () => {
        if (!window.confirm(`Are you absolutely sure you want to delete vendor "${data.vendor.company_name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await apiRequest(`/api/vendors/${vendorId}/`, 'DELETE');
            addAlert(`Vendor "${data.vendor.company_name}" successfully deleted.`, 'success');
            setView('vendors');
        } catch (err) {
            addAlert(err.message || 'Failed to delete vendor.', 'error');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Vendor Profile...</div>;
    }

    const { vendor, quotations, total_submitted, approved_count, total_amount } = data;

    return (
        <div className="detail-grid">
            {/* Left Panel: Vendor Identity */}
            <div className="left-col">
                <div className="panel">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <div className="user-avatar" style={{ width: '72px', height: '72px', fontSize: '32px', borderRadius: 'var(--border-radius-md)' }}>
                            {vendor.company_name.slice(0, 1).toUpperCase()}
                        </div>
                    </div>
                    
                    <h3 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{vendor.company_name}</h3>
                    <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Contact: {vendor.name}</p>
                    
                    <ul className="info-list" style={{ marginBottom: '32px' }}>
                        <li className="info-item">
                            <span className="info-label">Email Address</span>
                            <span className="info-value">{vendor.email}</span>
                        </li>
                        <li className="info-item">
                            <span className="info-label">Contact Number</span>
                            <span className="info-value">{vendor.contact_number}</span>
                        </li>
                        <li className="info-item">
                            <span className="info-label">Business Address</span>
                            <span className="info-value" style={{ whiteSpace: 'pre-line', lineHeight: '1.4' }}>{vendor.business_address}</span>
                        </li>
                    </ul>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setView('vendor-edit')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            <span>Edit Vendor Information</span>
                        </button>
                        
                        <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleDelete}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            <span>Delete Vendor</span>
                        </button>

                        <button className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setView('vendors')}>
                            &larr; Back to Directory
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel: Summary Stats & Quotations history */}
            <div className="right-col">
                <div className="compare-summary-cards" style={{ marginTop: 0, marginBottom: '24px' }}>
                    <div className="panel" style={{ marginBottom: 0, padding: '20px', textAlign: 'center' }}>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submitted Quotes</h4>
                        <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{total_submitted}</p>
                    </div>
                    <div className="panel" style={{ marginBottom: 0, padding: '20px', textAlign: 'center' }}>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approved Quotes</h4>
                        <p style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{approved_count}</p>
                    </div>
                    <div className="panel" style={{ marginBottom: 0, padding: '20px', textAlign: 'center' }}>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Wins Value</h4>
                        <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>${total_amount}</p>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel-header">
                        <h3>Quotation Proposal History</h3>
                    </div>
                    {quotations.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Request Title</th>
                                        <th>Reference</th>
                                        <th>Quotation Amount</th>
                                        <th>Date Submitted</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotations.map((quote) => (
                                        <tr key={quote.id}>
                                            <td>
                                                <button 
                                                    className="btn-link" 
                                                    style={{ fontWeight: 600, color: 'var(--primary)' }}
                                                    onClick={() => {
                                                        setSelectedId(quote.request_id);
                                                        setView('request-details');
                                                    }}
                                                >
                                                    {quote.request_title}
                                                </button>
                                            </td>
                                            <td><code>{quote.vendor_reference}</code></td>
                                            <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${quote.amount}</td>
                                            <td>{new Date(quote.submission_date).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge badge-${quote.status.toLowerCase()}`}>
                                                    {quote.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '32px 0' }}>
                            This vendor has not submitted any quotation proposals yet.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
