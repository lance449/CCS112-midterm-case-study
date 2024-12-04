import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container, Badge, Card } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import './Orders.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
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

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'warning',
      'processing': 'info',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center mt-5">Loading orders...</div>;
  }

  if (error) {
    return (
      <Card className="text-center mt-5">
        <Card.Body>
          <Card.Text className="text-danger">{error}</Card.Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Container className="order-history-container">
      <h2 className="text-center mb-4">Order History</h2>
      {orders.length === 0 ? (
        <div className="text-center">No orders found</div>
      ) : (
        <Table responsive striped bordered hover>
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
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{formatDate(order.created_at)}</td>
                <td>${parseFloat(order.total).toFixed(2)}</td>
                <td>{getStatusBadge(order.status)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Orders; 