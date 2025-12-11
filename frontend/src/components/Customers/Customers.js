import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CustomerForm from './CustomerForm';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="customers">
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Add Customer
        </button>
      </div>

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={handleFormClose}
        />
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Industry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.company || '-'}</td>
                  <td>{customer.industry || '-'}</td>
                  <td>
                    <span className={`status-badge status-${customer.status}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(customer)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(customer.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No customers found. Add your first customer!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;


