import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './ActivityForm.css';

const ActivityForm = ({ activity, customers, deals, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'call',
    subject: '',
    description: '',
    due_date: '',
    completed: false,
    customer_id: '',
    deal_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type || 'call',
        subject: activity.subject || '',
        description: activity.description || '',
        due_date: activity.due_date ? new Date(activity.due_date).toISOString().slice(0, 16) : '',
        completed: activity.completed || false,
        customer_id: activity.customer_id || '',
        deal_id: activity.deal_id || ''
      });
    }
  }, [activity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        customer_id: formData.customer_id || null,
        deal_id: formData.deal_id || null
      };
      
      if (activity) {
        await api.put(`/activities/${activity.id}`, data);
      } else {
        await api.post('/activities', data);
      }
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Error saving activity');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{activity ? 'Edit Activity' : 'Add Activity'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="note">Note</option>
            </select>
          </div>
          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="datetime-local"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Customer</label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
            >
              <option value="">Select a customer (optional)</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Deal</label>
            <select
              name="deal_id"
              value={formData.deal_id}
              onChange={handleChange}
            >
              <option value="">Select a deal (optional)</option>
              {deals.map(deal => (
                <option key={deal.id} value={deal.id}>
                  {deal.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="completed"
                checked={formData.completed}
                onChange={handleChange}
              />
              Completed
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : activity ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;


