import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container, Badge } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import './OrderHistory.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error fetching orders:', error);
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
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Shipping Address</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{formatDate(order.created_at)}</td>
                <td>
                  <ul className="order-items-list">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.product.description} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>${order.total.toFixed(2)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{order.shipping_address}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OrderHistory; 