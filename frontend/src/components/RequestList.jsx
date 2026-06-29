import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function RequestList({ setView, setSelectedId, addAlert }) {
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await apiRequest('/api/requests/');
                setRequests(res);
            } catch (err) {
                addAlert('Failed to load quotation requests.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    // Filter requests in real time
    const filteredRequests = requests.filter(req => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = req.title.toLowerCase().includes(query) || req.description.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Quotation Requests...</div>;
    }

    return (
        <div>
            {/* Search and Filter Panel */}
            <div className="action-header">
                <div className="search-box">
                    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search requests by title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="filters-group">
                    <select 
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                    </select>
                    
                    <button className="btn btn-primary" onClick={() => setView('request-add')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>Create Request</span>
                    </button>
                </div>
            </div>

            {/* Requests Cards Grid */}
            {filteredRequests.length > 0 ? (
                <div className="cards-grid">
                    {filteredRequests.map((req) => (
                        <div className="card" key={req.id}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
                                    <h3 className="card-title" style={{ marginBottom: 0 }}>{req.title}</h3>
                                    <span className={`badge badge-${req.status.toLowerCase()}`}>
                                        {req.status}
                                    </span>
                                </div>
                                
                                <p className="card-body" style={{ fontSize: '13.5px', lineHeight: 1.5, color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '16px' }}>
                                    {req.description}
                                </p>
                            </div>
                            
                            <div className="card-footer" style={{ paddingTop: '12px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    <strong>{req.quote_count}</strong> bids submitted
                                </span>
                                <button 
                                    className="btn btn-secondary btn-sm" 
                                    style={{ fontSize: '12px', padding: '6px 12px' }}
                                    onClick={() => {
                                        setSelectedId(req.id);
                                        setView('request-details');
                                    }}
                                >
                                    View Quotes &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="panel" style={{ textAlign: 'center', padding: '48px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '16px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    <h3 style={{ marginBottom: '8px' }}>No Requests Found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create requests to solicit proposal responses from vendors.</p>
                    <button className="btn btn-primary" onClick={() => setView('request-add')}>Create Your First Request</button>
                </div>
            )}
        </div>
    );
}
