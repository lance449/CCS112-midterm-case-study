import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Form, Modal, Card, Navbar, Nav, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faEdit, faTrash, faTimes, faSignOutAlt, faBox, faChartLine } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api';

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
  const [searchTerm, setSearchTerm] = useState('');

  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const [productToDelete, setProductToDelete] = useState(null);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Add Product
  const handleAddProduct = async () => {
    setAddErrors({});
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/products', newProduct);
      setProducts([...products, response.data]);
      setShowAdd(false);
      setNewProduct({
        barcode: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
      });
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setAddErrors(error.response.data.errors);
      } else {
        setAddErrors({ general: 'An error occurred while adding the product.' });
      }
    }
  };

  // Handle Edit Product
  const handleEditProduct = async () => {
    setEditErrors({});
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/products/${editProduct.id}`, editProduct);
      if (response.status === 200) {
        setEditProduct(null);
        fetchProducts();
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setEditErrors(error.response.data.errors);
      } else {
        setEditErrors({ general: 'An error occurred while updating the product.' });
      }
    }
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/products/${productToDelete.id}`);
      fetchProducts();
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      // Optionally, you can set an error state here to display to the user
    }
  };

  const handleSearch = async (searchTerm) => {
    try {
      if (searchTerm.trim() === '') {
        // If the search term is empty, fetch all products
        const response = await axios.get('http://127.0.0.1:8000/api/products');
        setProducts(response.data);
      } else {
        const response = await axios.get(`http://127.0.0.1:8000/api/products/search?query=${searchTerm}`);
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      // Optionally, you can set an error state here to display to the user
    }
  };

  const debouncedSearch = debounce((term) => {
    handleSearch(term);
  }, 300);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard bg-light min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#home">
            <FontAwesomeIcon icon={faBox} className="me-2" />
            E-Commerce Product Management
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              <Button variant="outline-light" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Search Item
                </h5>
                <Form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                  <Form.Control
                    type="text"
                    placeholder="Search by item name or category"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      debouncedSearch(e.target.value);
                    }}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchTerm);
                      }
                    }}
                  />
                  <Button variant="primary" className="ms-2" onClick={() => handleSearch(searchTerm)}>
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add a product
                </h5>
                <Button variant="success" onClick={() => setShowAdd(true)}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Product
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">
              <FontAwesomeIcon icon={faChartLine} className="me-2" />
              Product Inventory
            </h5>
            <Table responsive striped bordered hover>
              <thead className="bg-light">
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
                    <td>${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.category}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => setEditProduct(product)}>
                        <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteProduct(product)}>
                        <FontAwesomeIcon icon={faTrash} className="me-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* Add Product Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {addErrors.general && <Alert variant="danger">{addErrors.general}</Alert>}
            <Form.Group controlId="barcode">
              <Form.Label>Barcode</Form.Label>
              <Form.Control
                type="text"
                value={newProduct.barcode}
                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                isInvalid={!!addErrors.barcode}
              />
              <Form.Control.Feedback type="invalid">{addErrors.barcode}</Form.Control.Feedback>
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
              {editErrors.general && <Alert variant="danger">{editErrors.general}</Alert>}
              <Form.Group controlId="barcode">
                <Form.Label>Barcode</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.barcode}
                  onChange={(e) => setEditProduct({ ...editProduct, barcode: e.target.value })}
                  isInvalid={!!editErrors.barcode}
                />
                <Form.Control.Feedback type="invalid">{editErrors.barcode}</Form.Control.Feedback>
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <Modal show={true} onHide={() => setProductToDelete(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete the product "{productToDelete.description}"?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setProductToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
