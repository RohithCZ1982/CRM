import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="error">Error loading dashboard</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Customers</h3>
            <p className="stat-value">{stats.total_customers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Active Customers</h3>
            <p className="stat-value">{stats.active_customers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-info">
            <h3>Total Deals</h3>
            <p className="stat-value">{stats.total_deals}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Deal Value</h3>
            <p className="stat-value">${stats.total_deal_value.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="deals-by-stage">
        <h2>Deals by Stage</h2>
        <div className="stage-list">
          {stats.deals_by_stage.length > 0 ? (
            stats.deals_by_stage.map((stage, index) => (
              <div key={index} className="stage-item">
                <div className="stage-header">
                  <span className="stage-name">{stage.stage}</span>
                  <span className="stage-count">{stage.count} deals</span>
                </div>
                <div className="stage-value">${stage.value.toLocaleString()}</div>
              </div>
            ))
          ) : (
            <p className="no-data">No deals yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


