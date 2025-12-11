import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ActivityForm from './ActivityForm';
import './Activities.css';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  useEffect(() => {
    fetchActivities();
    fetchCustomers();
    fetchDeals();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
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

  const fetchDeals = async () => {
    try {
      const response = await api.get('/deals');
      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const getCustomerName = (customerId) => {
    if (!customerId) return '-';
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown';
  };

  const getDealTitle = (dealId) => {
    if (!dealId) return '-';
    const deal = deals.find(d => d.id === dealId);
    return deal ? deal.title : 'Unknown';
  };

  const handleCreate = () => {
    setEditingActivity(null);
    setShowForm(true);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await api.delete(`/activities/${id}`);
        fetchActivities();
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Error deleting activity');
      }
    }
  };

  const handleToggleComplete = async (activity) => {
    try {
      await api.put(`/activities/${activity.id}`, {
        ...activity,
        completed: !activity.completed
      });
      fetchActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingActivity(null);
    fetchActivities();
  };

  if (loading) {
    return <div className="loading">Loading activities...</div>;
  }

  return (
    <div className="activities">
      <div className="page-header">
        <h1>Activities</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Add Activity
        </button>
      </div>

      {showForm && (
        <ActivityForm
          activity={editingActivity}
          customers={customers}
          deals={deals}
          onClose={handleFormClose}
        />
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Subject</th>
              <th>Description</th>
              <th>Due Date</th>
              <th>Customer</th>
              <th>Deal</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.length > 0 ? (
              activities.map((activity) => (
                <tr key={activity.id} className={activity.completed ? 'completed' : ''}>
                  <td>
                    <span className={`type-badge type-${activity.type}`}>
                      {activity.type}
                    </span>
                  </td>
                  <td>{activity.subject}</td>
                  <td className="description-cell">{activity.description || '-'}</td>
                  <td>{activity.due_date ? new Date(activity.due_date).toLocaleString() : '-'}</td>
                  <td>{getCustomerName(activity.customer_id)}</td>
                  <td>{getDealTitle(activity.deal_id)}</td>
                  <td>
                    <button
                      className={`status-toggle ${activity.completed ? 'completed' : 'pending'}`}
                      onClick={() => handleToggleComplete(activity)}
                    >
                      {activity.completed ? '✓ Completed' : '○ Pending'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(activity)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(activity.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No activities found. Add your first activity!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Activities;


