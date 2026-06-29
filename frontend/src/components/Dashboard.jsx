import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function Dashboard({ setView, setSelectedId, addAlert }) {
    const [data, setData] = useState({
        total_vendors: 0,
        active_requests: 0,
        pending_quotations: 0,
        approved_quotations: 0,
        recent_activities: [],
        latest_requests: [],
        latest_quotes: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await apiRequest('/api/dashboard/');
                setData(res);
            } catch (err) {
                addAlert('Failed to load dashboard data.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatTime = (timestampStr) => {
        const date = new Date(timestampStr);
        // Simple relative time approximation
        const diffMs = new Date() - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Dashboard...</div>;
    }

    return (
        <div>
            {/* Metrics Grid */}
            <div className="metrics-grid">
                <div className="metric-card" onClick={() => setView('vendors')}>
                    <div className="metric-icon blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div className="metric-data">
                        <h3>{data.total_vendors}</h3>
                        <p>Total Vendors</p>
                    </div>
                </div>

                <div className="metric-card" onClick={() => setView('requests')}>
                    <div className="metric-icon purple">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    </div>
                    <div className="metric-data">
                        <h3>{data.active_requests}</h3>
                        <p>Active Requests</p>
                    </div>
                </div>

                <div className="metric-card" onClick={() => setView('requests')}>
                    <div className="metric-icon amber">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div className="metric-data">
                        <h3>{data.pending_quotations}</h3>
                        <p>Pending Quotes</p>
                    </div>
                </div>

                <div className="metric-card" onClick={() => setView('requests')}>
                    <div className="metric-icon green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div className="metric-data">
                        <h3>{data.approved_quotations}</h3>
                        <p>Approved Quotes</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                <div className="left-col">
                    {/* Recent Requests */}
                    <div className="panel">
                        <div className="panel-header">
                            <h3>Recent Quotation Requests</h3>
                            <button className="btn-link" onClick={() => setView('requests')}>View All</button>
                        </div>
                        {data.latest_requests.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Status</th>
                                            <th>Submissions</th>
                                            <th className="no-print">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.latest_requests.map((req) => (
                                            <tr key={req.id}>
                                                <td style={{ fontWeight: 600 }}>{req.title}</td>
                                                <td>
                                                    <span className={`badge badge-${req.status.toLowerCase()}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td>{req.quote_count} quotes</td>
                                                <td className="no-print">
                                                    <button 
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => {
                                                            setSelectedId(req.id);
                                                            setView('request-details');
                                                        }}
                                                    >
                                                        Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
                                No quotation requests created yet.{' '}
                                <button className="btn-link" onClick={() => setView('request-add')}>Create one now</button>.
                            </p>
                        )}
                    </div>

                    {/* Recent Vendor Submissions */}
                    <div className="panel">
                        <div className="panel-header">
                            <h3>Recent Vendor Submissions</h3>
                            <button className="btn-link" onClick={() => setView('requests')}>View Requests</button>
                        </div>
                        {data.latest_quotes.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Vendor</th>
                                            <th>Quotation Request</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.latest_quotes.map((quote) => (
                                            <tr key={quote.id}>
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
                                                </td>
                                                <td>{quote.request_title}</td>
                                                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${quote.amount}</td>
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
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
                                No vendor quotations submitted yet.
                            </p>
                        )}
                    </div>
                </div>

                <div className="right-col">
                    <div className="panel">
                        <div className="panel-header">
                            <h3>Recent Activity Logs</h3>
                        </div>
                        {data.recent_activities.length > 0 ? (
                            <ul className="activity-stream">
                                {data.recent_activities.map((log) => (
                                    <li className="activity-item" key={log.id}>
                                        <div className="activity-bullet"></div>
                                        <div className="activity-content">
                                            <strong>{log.action}</strong>
                                            <span className="activity-desc">{log.details}</span>
                                            <span className="activity-time">{formatTime(log.timestamp)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
                                No logs recorded.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
