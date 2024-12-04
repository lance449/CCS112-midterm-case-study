import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container, Badge, Card, Spinner, Button } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStore } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from './context/ThemeContext';
import './Orders.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User not authenticated');
        return;
      }

      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      setOrders(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load order history');
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (order) => {
    const total = order.items?.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.quantity));
    }, 0) || 0;
    
    return `$${total.toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    return <Badge className={`badge-${status.toLowerCase()}`}>{status}</Badge>;
  };

  const handleBackToShop = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="loading-container animate-fade-in">
        <Spinner animation="border" className="loading-spinner" />
        <div className="loading-text">Loading your order history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <div className="error-card animate-fade-in">
          <h4>Oops! Something went wrong</h4>
          <p>{error}</p>
          <Button className="back-to-shop" onClick={handleBackToShop}>
            <FontAwesomeIcon icon={faStore} className="button-icon" />
            Back to Shop
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className={`order-history-container ${darkMode ? 'dark-mode' : ''}`}>
      <Container className="animate-fade-in">
        <div className={`order-card ${darkMode ? 'dark-mode' : ''}`}>
          <div className="header-container">
            <Button className={`back-to-shop ${darkMode ? 'dark-mode' : ''}`} onClick={handleBackToShop}>
              <FontAwesomeIcon icon={faArrowLeft} className="button-icon" />
              Back to Shop
            </Button>
            <h1 className="page-title">Order History</h1>
          </div>
          
          {orders.length === 0 ? (
            <div className={`empty-orders ${darkMode ? 'dark-mode' : ''}`}>
              <h3>No Orders Yet</h3>
              <p>Your order history will appear here once you make a purchase.</p>
              <Button className={`back-to-shop mt-3 ${darkMode ? 'dark-mode' : ''}`} onClick={handleBackToShop}>
                <FontAwesomeIcon icon={faStore} className="button-icon" />
                Start Shopping
              </Button>
            </div>
          ) : (
            <Table responsive hover className={darkMode ? 'dark-mode' : ''}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="animate-fade-in">
                    <td>
                      <span className={`order-id ${darkMode ? 'dark-mode' : ''}`}>#{order.id}</span>
                    </td>
                    <td>
                      <span className="order-date">{formatDate(order.created_at)}</span>
                    </td>
                    <td>
                      <span className={`order-total ${darkMode ? 'dark-mode' : ''}`}>{formatPrice(order)}</span>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Orders; 