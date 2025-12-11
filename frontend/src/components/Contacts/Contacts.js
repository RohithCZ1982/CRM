import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ContactForm from './ContactForm';
import './Contacts.css';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  useEffect(() => {
    fetchContacts();
    fetchCustomers();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
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
    setEditingContact(null);
    setShowForm(true);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/contacts/${id}`);
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Error deleting contact');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingContact(null);
    fetchContacts();
  };

  if (loading) {
    return <div className="loading">Loading contacts...</div>;
  }

  return (
    <div className="contacts">
      <div className="page-header">
        <h1>Contacts</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Add Contact
        </button>
      </div>

      {showForm && (
        <ContactForm
          contact={editingContact}
          customers={customers}
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
              <th>Position</th>
              <th>Customer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.first_name} {contact.last_name}</td>
                  <td>{contact.email || '-'}</td>
                  <td>{contact.phone || '-'}</td>
                  <td>{contact.position || '-'}</td>
                  <td>{getCustomerName(contact.customer_id)}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(contact)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(contact.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No contacts found. Add your first contact!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contacts;


