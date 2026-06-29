import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function CompareMatrix({ requestId, setView, setSelectedId, addAlert }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchComparisonData = async () => {
        try {
            const res = await apiRequest(`/api/requests/${requestId}/compare/`);
            setData(res);
        } catch (err) {
            addAlert('Failed to load comparison data.', 'error');
            setView('request-details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComparisonData();
    }, [requestId]);

    const handleUpdateQuoteStatus = async (quoteId, newStatus) => {
        try {
            const res = await apiRequest(`/api/quotations/${quoteId}/status/`, 'POST', { status: newStatus });
            addAlert(res.message || `Quotation status updated to ${newStatus}.`, 'success');
            // Refresh matrix
            fetchComparisonData();
        } catch (err) {
            addAlert(err.message || 'Failed to update quote status.', 'error');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Comparison Matrix...</div>;
    }

    const { request, quotes, stats, lowest_quote } = data;

    return (
        <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Comparison Sheet for</span>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{request.title}</h3>
                </div>
                <div style={{ display: 'flex', gap: '12px' }} className="no-print">
                    <button className="btn btn-secondary" onClick={handlePrint}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        <span>Export / Print Report</span>
                    </button>
                    <button className="btn btn-primary" onClick={() => setView('request-details')}>
                        Back to Details
                    </button>
                </div>
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '32px' }}>{request.description}</p>
            
            {/* Stats Cards */}
            <div className="compare-summary-cards" style={{ marginBottom: '32px' }}>
                <div style={{ backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '20px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Bids</span>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{stats.total_quotes}</p>
                </div>
                <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 'var(--border-radius-md)', padding: '20px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#15803d', textTransform: 'uppercase', fontWeight: 600 }}>Most Cost-Effective (Min)</span>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                        {stats.min_amount ? `$${stats.min_amount}` : '$-'}
                    </p>
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '20px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Average Bid</span>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                        {stats.avg_amount ? `$${parseFloat(stats.avg_amount).toFixed(2)}` : '$-'}
                    </p>
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '20px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Highest Bid (Max)</span>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                        {stats.max_amount ? `$${stats.max_amount}` : '$-'}
                    </p>
                </div>
            </div>

            {/* Comparison Matrix Table */}
            {quotes.length > 0 ? (
                <div className="compare-matrix-wrapper">
                    <table className="compare-matrix">
                        <thead>
                            <tr>
                                <th style={{ width: '70px' }}>Rank</th>
                                <th>Vendor Company</th>
                                <th>Contact Person</th>
                                <th>Quote Reference</th>
                                <th>Quotation Amount</th>
                                <th>Submission Date</th>
                                <th>Status</th>
                                <th className="no-print">Quick Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map((quote, idx) => {
                                const isLowest = lowest_quote && quote.id === lowest_quote.id;
                                return (
                                    <tr key={quote.id} className={isLowest ? 'best-deal' : ''}>
                                        <td style={{ fontWeight: 700 }}>
                                            {isLowest ? (
                                                <span style={{ color: '#10b981' }}>#1</span>
                                            ) : (
                                                `#${idx + 1}`
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-link" 
                                                style={{ fontWeight: 700, color: 'var(--primary)' }}
                                                onClick={() => {
                                                    setSelectedId(quote.vendor_id);
                                                    setView('vendor-details');
                                                }}
                                            >
                                                {quote.vendor_company}
                                            </button>
                                            {isLowest && (
                                                <span className="highlight-tag" style={{ marginLeft: '8px' }}>
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                                    <span>Most Cost-Effective</span>
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{quote.vendor_name}</td>
                                        <td><code>{quote.vendor_reference}</code></td>
                                        <td style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>${quote.amount}</td>
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
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                
                                                {quote.status !== 'Rejected' && (
                                                    <button 
                                                        className="btn btn-secondary btn-sm" 
                                                        style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}
                                                        onClick={() => handleUpdateQuoteStatus(quote.id, 'Rejected')}
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
                    No quotes submitted for this request. Cannot build comparison matrix.
                </p>
            )}
        </div>
    );
}
