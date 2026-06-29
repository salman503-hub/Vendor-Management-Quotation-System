import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function VendorForm({ vendorId, setView, addAlert }) {
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [businessAddress, setBusinessAddress] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (vendorId) {
            const fetchVendor = async () => {
                setFetching(true);
                try {
                    const res = await apiRequest(`/api/vendors/${vendorId}/`);
                    const vendor = res.vendor;
                    setName(vendor.name);
                    setCompanyName(vendor.company_name);
                    setEmail(vendor.email);
                    setContactNumber(vendor.contact_number);
                    setBusinessAddress(vendor.business_address);
                } catch (err) {
                    addAlert('Failed to load vendor details for editing.', 'error');
                    setView('vendors');
                } finally {
                    setFetching(false);
                }
            };
            fetchVendor();
        }
    }, [vendorId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name || !companyName || !email || !contactNumber || !businessAddress) {
            addAlert('Please fill in all fields.', 'error');
            return;
        }

        // Quick phone validation matching backend
        const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
        if (!phoneRegex.test(contactNumber)) {
            addAlert('Please enter a valid contact number (7-20 digits, optionally starting with +).', 'error');
            return;
        }

        setLoading(true);
        const payload = { name, company_name: companyName, email, contact_number: contactNumber, business_address: businessAddress };
        
        try {
            if (vendorId) {
                await apiRequest(`/api/vendors/${vendorId}/`, 'PUT', payload);
                addAlert(`Vendor "${companyName}" updated successfully.`, 'success');
                setView('vendor-details');
            } else {
                await apiRequest('/api/vendors/', 'POST', payload);
                addAlert(`Vendor "${companyName}" created successfully.`, 'success');
                setView('vendors');
            }
        } catch (err) {
            addAlert(err.message || 'Failed to save vendor record.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Vendor Data...</div>;
    }

    return (
        <div className="panel form-container">
            <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 700 }}>
                {vendorId ? 'Edit Vendor Details' : 'Add New Vendor'}
            </h3>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Contact Person Name</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter contact person name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter company name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g., +1234567890"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Business Address</label>
                    <textarea 
                        className="form-control" 
                        rows="3" 
                        placeholder="Enter complete address"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                            if (vendorId) setView('vendor-details');
                            else setView('vendors');
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
                        {loading ? 'Saving...' : 'Save Vendor'}
                    </button>
                </div>
            </form>
        </div>
    );
}
