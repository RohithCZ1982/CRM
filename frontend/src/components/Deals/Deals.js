import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DealForm from './DealForm';
import './Deals.css';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  useEffect(() => {
    fetchDeals();
    fetchCustomers();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await api.get('/deals');
      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown';
  };

  const handleCreate = () => {
    setEditingDeal(null);
    setShowForm(true);
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await api.delete(`/deals/${id}`);
        fetchDeals();
      } catch (error) {
        console.error('Error deleting deal:', error);
        alert('Error deleting deal');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDeal(null);
    fetchDeals();
  };

  if (loading) {
    return <div className="loading">Loading deals...</div>;
  }

  return (
    <div className="deals">
      <div className="page-header">
        <h1>Deals</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Add Deal
        </button>
      </div>

      {showForm && (
        <DealForm
          deal={editingDeal}
          customers={customers}
          onClose={handleFormClose}
        />
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Value</th>
              <th>Stage</th>
              <th>Probability</th>
              <th>Expected Close</th>
              <th>Customer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.length > 0 ? (
              deals.map((deal) => (
                <tr key={deal.id}>
                  <td>{deal.title}</td>
                  <td>${deal.value.toLocaleString()}</td>
                  <td>
                    <span className={`stage-badge stage-${deal.stage.toLowerCase().replace(' ', '-')}`}>
                      {deal.stage}
                    </span>
                  </td>
                  <td>{deal.probability}%</td>
                  <td>{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}</td>
                  <td>{getCustomerName(deal.customer_id)}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(deal)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(deal.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No deals found. Add your first deal!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Deals;


