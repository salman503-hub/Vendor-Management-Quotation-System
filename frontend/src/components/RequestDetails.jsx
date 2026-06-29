import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function RequestDetails({ requestId, setView, setSelectedId, addAlert }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchRequestDetails = async () => {
        try {
            const res = await apiRequest(`/api/requests/${requestId}/`);
            setData(res);
        } catch (err) {
            addAlert('Failed to load request details.', 'error');
            setView('requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequestDetails();
    }, [requestId]);

    const handleDelete = async () => {
        if (!window.confirm(`Are you absolutely sure you want to delete this request? This action cannot be undone.`)) {
            return;
        }

        try {
            await apiRequest(`/api/requests/${requestId}/`, 'DELETE');
            addAlert('Quotation request deleted successfully.', 'success');
            setView('requests');
        } catch (err) {
            addAlert(err.message || 'Failed to delete request.', 'error');
        }
    };

    const handleUpdateQuoteStatus = async (quoteId, newStatus) => {
        try {
            const res = await apiRequest(`/api/quotations/${quoteId}/status/`, 'POST', { status: newStatus });
            addAlert(res.message || `Quotation status updated to ${newStatus}.`, 'success');
            // Refresh details
            fetchRequestDetails();
        } catch (err) {
            addAlert(err.message || 'Failed to update quote status.', 'error');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Request Details...</div>;
    }

    const { request, quotes, stats, lowest_quote } = data;

    return (
        <div className="detail-grid">
            {/* Left Column: Request Profile and Actions */}
            <div className="left-col">
                <div className="panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <span className={`badge badge-${request.status.toLowerCase()}`}>
                            {request.status}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Created {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>{request.title}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px', whiteSpace: 'pre-wrap' }}>{request.description}</p>
                    
                    <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', marginBottom: '20px' }} />
                    
                    {/* Quick stats if there are quotes */}
                    {quotes.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Proposal Stats</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ backgroundColor: 'var(--bg-surface-hover)', padding: '12px', borderRadius: 'var(--border-radius-sm)' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Lowest Bid</span>
                                    <strong style={{ fontSize: '16px', color: '#10b981' }}>${stats.min_amount}</strong>
                                </div>
                                <div style={{ backgroundColor: 'var(--bg-surface-hover)', padding: '12px', borderRadius: 'var(--border-radius-sm)' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Average Bid</span>
                                    <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>${parseFloat(stats.avg_amount).toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {request.status === 'Open' && (
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setView('submit-quote')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                <span>Submit Vendor Quote</span>
                            </button>
                        )}
                        
                        {quotes.length > 0 && (
                            <button className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={() => setView('compare')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                                <span>Compare Bids side-by-side</span>
                            </button>
                        )}
                        
                        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setView('request-edit')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            <span>Edit Request</span>
                        </button>
                        
                        <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleDelete}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            <span>Delete Request</span>
                        </button>

                        <button className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setView('requests')}>
                            &larr; Back to Requests
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: List of submissions */}
            <div className="right-col">
                <div className="panel">
                    <div className="panel-header">
                        <h3>Vendor Proposals Submitted</h3>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{quotes.length} proposals received</span>
                    </div>
                    
                    {quotes.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Vendor</th>
                                        <th>Reference</th>
                                        <th>Quotation Amount</th>
                                        <th>Submitted</th>
                                        <th>Status</th>
                                        <th className="no-print">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotes.map((quote) => (
                                        <tr key={quote.id} style={lowest_quote && quote.id === lowest_quote.id ? { backgroundColor: 'rgba(34, 197, 94, 0.03)' } : {}}>
                                            <td>
                                                <button 
                                                    className="btn-link" 
                                                    style={{ fontWeight: 600, color: 'var(--primary)' }}
                                                    onClick={() => {
                                                        setSelectedId(quote.vendor_id);
                                                        setView('vendor-details');
                                                    }}
                                                >
                                                    {quote.vendor_company}
                                                </button>
                                                {lowest_quote && quote.id === lowest_quote.id && (
                                                    <span className="highlight-tag" style={{ fontSize: '9px', padding: '2px 6px', marginLeft: '6px', borderRadius: '99px' }}>
                                                        Best Deal
                                                    </span>
                                                )}
                                            </td>
                                            <td><code>{quote.vendor_reference}</code></td>
                                            <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${quote.amount}</td>
                                            <td>{new Date(quote.submission_date).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge badge-${quote.status.toLowerCase()}`}>
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="no-print">
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    {quote.status !== 'Approved' && (
                                                        <button 
                                                            className="btn btn-secondary btn-sm" 
                                                            style={{ backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' }}
                                                            onClick={() => handleUpdateQuoteStatus(quote.id, 'Approved')}
                                                            title="Approve Proposal"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    
                                                    {quote.status !== 'Rejected' && (
                                                        <button 
                                                            className="btn btn-secondary btn-sm" 
                                                            style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}
                                                            onClick={() => handleUpdateQuoteStatus(quote.id, 'Rejected')}
                                                            title="Reject Proposal"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '12px' }}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <p style={{ fontWeight: 500, fontSize: '15px', marginBottom: '8px' }}>No Proposals Received Yet</p>
                            <p style={{ fontSize: '13px', maxWidth: '320px', margin: '0 auto 20px' }}>We are waiting for vendor submissions. You can also submit one manually on behalf of a vendor.</p>
                            {request.status === 'Open' && (
                                <button className="btn btn-primary btn-sm" onClick={() => setView('submit-quote')}>
                                    Submit Vendor Proposal
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
