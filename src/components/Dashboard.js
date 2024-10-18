import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({
    barcode: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
  });

  const [editProduct, setEditProduct] = useState(null);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get('http://your-api-url/products');
      setProducts(response.data);
    };
    fetchProducts();
  }, []);

  // Handle Add Product
  const handleAddProduct = async () => {
    await axios.post('http://your-api-url/products', newProduct);
    setShowAdd(false);
    window.location.reload();
  };

  // Handle Edit Product
  const handleEditProduct = async () => {
    await axios.put(`http://your-api-url/products/${editProduct.id}`, editProduct);
    setEditProduct(null);
    window.location.reload();
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id) => {
    await axios.delete(`http://your-api-url/products/${id}`);
    window.location.reload();
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <Button onClick={() => setShowAdd(true)}>Add Product</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Description</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.barcode}</td>
              <td>{product.description}</td>
              <td>{product.price}</td>
              <td>{product.quantity}</td>
              <td>{product.category}</td>
              <td>
                <Button onClick={() => setEditProduct(product)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Product Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="barcode">
              <Form.Label>Barcode</Form.Label>
              <Form.Control
                type="text"
                value={newProduct.barcode}
                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="price">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="text"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="quantity">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddProduct}>Add Product</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Product Modal */}
      {editProduct && (
        <Modal show={true} onHide={() => setEditProduct(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="barcode">
                <Form.Label>Barcode</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.barcode}
                  onChange={(e) => setEditProduct({ ...editProduct, barcode: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="price">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="quantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={editProduct.quantity}
                  onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.category}
                  onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditProduct(null)}>Close</Button>
            <Button variant="primary" onClick={handleEditProduct}>Update Product</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;