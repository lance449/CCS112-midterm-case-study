import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status.toLowerCase()]}>{status}</Badge>;
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <Container className="orders-container mt-5 pt-4">
      <Card className="orders-card">
        <Card.Header as="h4" className="text-center">Order History</Card.Header>
        <Card.Body>
          {orders.length === 0 ? (
            <p className="text-center">No orders found</p>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>{order.items.length} items</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Orders; 