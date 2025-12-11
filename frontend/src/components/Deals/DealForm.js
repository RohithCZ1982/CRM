import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './DealForm.css';

const DealForm = ({ deal, customers, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    stage: 'prospecting',
    probability: 0,
    expected_close_date: '',
    customer_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        value: deal.value || '',
        stage: deal.stage || 'prospecting',
        probability: deal.probability || 0,
        expected_close_date: deal.expected_close_date ? deal.expected_close_date.split('T')[0] : '',
        customer_id: deal.customer_id || ''
      });
    }
  }, [deal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability)
      };
      
      if (deal) {
        await api.put(`/deals/${deal.id}`, data);
      } else {
        await api.post('/deals', data);
      }
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Error saving deal');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{deal ? 'Edit Deal' : 'Add Deal'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Value ($) *</label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Stage</label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
            >
              <option value="prospecting">Prospecting</option>
              <option value="qualification">Qualification</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
            </select>
          </div>
          <div className="form-group">
            <label>Probability (%)</label>
            <input
              type="number"
              name="probability"
              value={formData.probability}
              onChange={handleChange}
              min="0"
              max="100"
            />
          </div>
          <div className="form-group">
            <label>Expected Close Date</label>
            <input
              type="date"
              name="expected_close_date"
              value={formData.expected_close_date}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Customer *</label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : deal ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealForm;


