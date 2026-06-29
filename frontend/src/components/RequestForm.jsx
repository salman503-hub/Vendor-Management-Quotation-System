import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function RequestForm({ requestId, setView, addAlert }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Open');
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (requestId) {
            const fetchRequest = async () => {
                setFetching(true);
                try {
                    const res = await apiRequest(`/api/requests/${requestId}/`);
                    const request = res.request;
                    setTitle(request.title);
                    setDescription(request.description);
                    setStatus(request.status);
                } catch (err) {
                    addAlert('Failed to load request details for editing.', 'error');
                    setView('requests');
                } finally {
                    setFetching(false);
                }
            };
            fetchRequest();
        }
    }, [requestId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title || !description) {
            addAlert('Please fill in all fields.', 'error');
            return;
        }

        setLoading(true);
        const payload = { title, description, status };
        
        try {
            if (requestId) {
                await apiRequest(`/api/requests/${requestId}/`, 'PUT', payload);
                addAlert(`Quotation request updated successfully.`, 'success');
                setView('request-details');
            } else {
                await apiRequest('/api/requests/', 'POST', payload);
                addAlert(`Quotation request created successfully.`, 'success');
                setView('requests');
            }
        } catch (err) {
            addAlert(err.message || 'Failed to save request.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Request Data...</div>;
    }

    return (
        <div className="panel form-container">
            <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 700 }}>
                {requestId ? 'Edit Quotation Request' : 'Create Quotation Request'}
            </h3>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Quotation Title</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g., Supply of Office Laptops"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea 
                        className="form-control" 
                        rows="4" 
                        placeholder="Describe request details, requirements, or quantity..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {requestId && (
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select 
                            className="form-control"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={loading}
                        >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                )}

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                            if (requestId) setView('request-details');
                            else setView('requests');
                        }}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Request'}
                    </button>
                </div>
            </form>
        </div>
    );
}
