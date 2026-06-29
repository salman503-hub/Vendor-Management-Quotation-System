import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function QuoteForm({ requestId, setView, addAlert }) {
    const [vendors, setVendors] = useState([]);
    const [requests, setRequests] = useState([]);
    
    const [selectedRequest, setSelectedRequest] = useState(requestId || '');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [vendorReference, setVendorReference] = useState('');
    const [amount, setAmount] = useState('');
    const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const [vendorsList, requestsList] = await Promise.all([
                    apiRequest('/api/vendors/'),
                    apiRequest('/api/requests/')
                ]);
                setVendors(vendorsList);
                // Only show open requests
                setRequests(requestsList.filter(r => r.status === 'Open'));
                
                if (vendorsList.length > 0) {
                    setSelectedVendor(vendorsList[0].id);
                }
                if (requestsList.length > 0 && !requestId) {
                    const openReqs = requestsList.filter(r => r.status === 'Open');
                    if (openReqs.length > 0) {
                        setSelectedRequest(openReqs[0].id);
                    }
                }
            } catch (err) {
                addAlert('Failed to load form dropdown values.', 'error');
            } finally {
                setFetchingData(false);
            }
        };

        fetchFormData();
    }, [requestId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedRequest || !selectedVendor || !vendorReference || !amount || !submissionDate) {
            addAlert('Please fill in all fields.', 'error');
            return;
        }

        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            addAlert('Quotation amount must be a positive number greater than 0.', 'error');
            return;
        }

        setLoading(true);
        try {
            await apiRequest('/api/quotations/', 'POST', {
                request: parseInt(selectedRequest),
                vendor: parseInt(selectedVendor),
                vendor_reference: vendorReference,
                amount: amt,
                submission_date: submissionDate,
                status: 'Pending'
            });
            addAlert('Quotation proposal submitted successfully.', 'success');
            setView('request-details');
        } catch (err) {
            addAlert(err.message || 'Failed to submit proposal.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Form Details...</div>;
    }

    const requestDetails = requests.find(r => r.id === parseInt(selectedRequest));

    return (
        <div className="panel form-container">
            {requestId && requestDetails && (
                <div style={{ backgroundColor: 'var(--bg-surface-hover)', padding: '16px', borderRadius: 'var(--border-radius-sm)', borderLeft: '4px solid var(--primary)', marginBottom: '24px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Quotation Request Target</span>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)', marginTop: '4px', display: 'block' }}>{requestDetails.title}</strong>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Request Selector (hide if preselected) */}
                {!requestId && (
                    <div className="form-group">
                        <label className="form-label">Quotation Request</label>
                        <select 
                            className="form-control"
                            value={selectedRequest}
                            onChange={(e) => setSelectedRequest(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">-- Select Quotation Request --</option>
                            {requests.map(r => (
                                <option key={r.id} value={r.id}>{r.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Vendor Selector */}
                <div className="form-group">
                    <label className="form-label">Assign Vendor</label>
                    {vendors.length > 0 ? (
                        <select 
                            className="form-control"
                            value={selectedVendor}
                            onChange={(e) => setSelectedVendor(e.target.value)}
                            disabled={loading}
                        >
                            {vendors.map(v => (
                                <option key={v.id} value={v.id}>{v.company_name} ({v.name})</option>
                            ))}
                        </select>
                    ) : (
                        <p style={{ color: '#ef4444', fontSize: '13px' }}>No vendors registered. Please add a vendor first.</p>
                    )}
                </div>

                {/* Vendor Reference */}
                <div className="form-group">
                    <label className="form-label">Vendor Quotation Reference</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g., QTE-2026-001"
                        value={vendorReference}
                        onChange={(e) => setVendorReference(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {/* Amount */}
                <div className="form-group">
                    <label className="form-label">Quotation Amount ($)</label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="form-control" 
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {/* Submission Date */}
                <div className="form-group">
                    <label className="form-label">Submission Date</label>
                    <input 
                        type="date" 
                        className="form-control" 
                        value={submissionDate}
                        onChange={(e) => setSubmissionDate(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                            if (requestId) setView('request-details');
                            else setView('dashboard');
                        }}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading || vendors.length === 0}
                    >
                        {loading ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                </div>
            </form>
        </div>
    );
}
