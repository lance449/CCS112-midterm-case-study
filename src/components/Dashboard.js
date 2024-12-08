import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Table, Button, Form, Modal, Card, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faEdit, faTrash, faChartLine, faUserPlus, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api';
import Sidebar from './Sidebar';
import './Dashboard.css';
import zxcvbn from 'zxcvbn';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({
    barcode: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    image: null
  });

  const [editProduct, setEditProduct] = useState(null);

  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const [productToDelete, setProductToDelete] = useState(null);

  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [adminErrors, setAdminErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [isSearching, setIsSearching] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const navigate = useNavigate();

  // Notification helpers
  const notifySuccess = (message) => toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  const notifyError = (message) => toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  const notifyWarning = (message) => toast.warning(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  const fetchProducts = async () => {
    setLoading(true);
    setLoadingMessage('Loading products...');
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/products');
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingMessage('');
      }, 300);
    }
  };

  const handleSearch = async (query) => {
    setIsSearching(true);
    setLoadingMessage('Searching products...');
    try {
      if (!query || query.trim() === '') {
        await fetchProducts();
        return;
      }

      const response = await axios.get(`http://127.0.0.1:8000/api/products/search?query=${query}`);
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    } finally {
      setTimeout(() => {
        setIsSearching(false);
        setLoadingMessage('');
      }, 300);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      handleSearch(query);
    }, 300),
    []
  );

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add these validation utility functions
  const validateProductData = (data) => {
    const errors = {};
    
    // Barcode validation
    if (!data.barcode || data.barcode.trim() === '') {
      errors.barcode = 'Barcode is required';
    }

    // Description validation
    if (!data.description || data.description.trim() === '') {
      errors.description = 'Description is required';
    }

    // Price validation
    if (!data.price) {
      errors.price = 'Price is required';
    } else if (isNaN(data.price) || parseFloat(data.price) < 0) {
      errors.price = 'Price must be a valid positive number';
    }

    // Quantity validation
    if (!data.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(data.quantity) || parseInt(data.quantity) < 0) {
      errors.quantity = 'Quantity must be a valid positive number';
    }

    // Category validation
    if (!data.category || data.category.trim() === '') {
      errors.category = 'Category is required';
    }

    return errors;
  };

  const validateAdminData = (data) => {
    const errors = {};
    
    // Name validation
    if (!data.name || data.name.trim() === '') {
      errors.name = 'Name is required';
    }
    
    // Email validation
    if (!data.email || data.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    // Password confirmation validation
    if (!data.password_confirmation) {
      errors.password_confirmation = 'Please confirm password';
    } else if (data.password !== data.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }
    
    return errors;
  };

  // Update the handleAddProduct function
  const handleAddProduct = async () => {
    const validationErrors = validateProductData(newProduct);
    if (Object.keys(validationErrors).length > 0) {
      setAddErrors(validationErrors);
      notifyWarning('Please fill in all required fields correctly.');
      return;
    }

    // Add file size validation
    if (newProduct.image && newProduct.image.size > 5 * 1024 * 1024) {
      setAddErrors({ image: 'File size exceeds 5MB limit' });
      notifyWarning('Please select an image under 5MB.');
      return;
    }

    setAddErrors({});
    try {
      const formData = new FormData();
      formData.append('barcode', newProduct.barcode);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('quantity', newProduct.quantity);
      formData.append('category', newProduct.category);
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }

      const response = await axios.post('http://127.0.0.1:8000/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProducts([...products, response.data]);
      setShowAdd(false);
      setNewProduct({
        barcode: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
        image: null
      });
      notifySuccess('Product added successfully! 🎉');
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setAddErrors(error.response.data.errors);
        notifyError('Failed to add product. Please check the form.');
      } else {
        setAddErrors({ general: 'An error occurred while adding the product.' });
        notifyError('An error occurred while adding the product.');
      }
    }
  };

  // Update the handleEditProduct function
  const handleEditProduct = async () => {
    if (!editProduct) return;

    const validationErrors = validateProductData(editProduct);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    // Add file size validation for edit
    if (editProduct.newImage && editProduct.newImage.size > 5 * 1024 * 1024) {
      setEditErrors({ image: 'File size exceeds 5MB limit' });
      notifyWarning('Please select an image under 5MB.');
      return;
    }

    setEditErrors({});
    try {
      const formData = new FormData();
      formData.append('barcode', editProduct.barcode);
      formData.append('description', editProduct.description);
      formData.append('price', editProduct.price);
      formData.append('quantity', editProduct.quantity);
      formData.append('category', editProduct.category);
      if (editProduct.newImage) {
        formData.append('image', editProduct.newImage);
      }
      formData.append('_method', 'PUT');

      const response = await axios.post(`http://127.0.0.1:8000/api/products/${editProduct.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProducts(products.map(p => p.id === editProduct.id ? response.data : p));
      setEditProduct(null);
      notifySuccess('Product updated successfully! 🎉');
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setEditErrors(error.response.data.errors);
        notifyError('Failed to update product. Please check the form.');
      } else {
        setEditErrors({ general: 'An error occurred while updating the product.' });
        notifyError('An error occurred while updating the product.');
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
      notifySuccess('Product deleted successfully! 🗑️');
    } catch (error) {
      console.error('Error deleting product:', error);
      notifyError('Failed to delete product. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Update the handleCreateAdmin function
  const handleCreateAdmin = async () => {
    const validationErrors = validateAdminData(newAdmin);
    if (Object.keys(validationErrors).length > 0) {
      setAdminErrors(validationErrors);
      notifyWarning('Please fill in all required fields correctly.');
      return;
    }
    
    setAdminErrors({});
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        notifyError('Not authenticated. Please log in again.');
        return;
      }

      const response = await axios.post(
        'http://127.0.0.1:8000/api/admin/users', 
        {
          name: newAdmin.name,
          email: newAdmin.email,
          password: newAdmin.password,
          password_confirmation: newAdmin.password_confirmation,
          role: 'admin'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.status === 201) {
        notifySuccess('Admin account created successfully! 👤');
        setNewAdmin({
          name: '',
          email: '',
          password: '',
          password_confirmation: ''
        });
        setShowCreateAdmin(false);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          notifyError('Not authenticated. Please log in again.');
        } else if (error.response.status === 403) {
          notifyError('You do not have permission to create admin users.');
        } else if (error.response.status === 422) {
          setAdminErrors(error.response.data.errors);
          notifyError('Validation failed. Please check the form.');
        } else {
          notifyError('Failed to create admin account. Please try again.');
        }
      } else {
        notifyError('Network error. Please check your connection.');
      }
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewAdmin(prev => ({ ...prev, password: value }));
    if (value) {
      const result = zxcvbn(value);
      setPasswordStrength(result);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleCloseCreateAdmin = () => {
    setShowCreateAdmin(false);
    setNewAdmin({
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    });
    setPasswordStrength(null);
    setAdminErrors({});
  };

  return (
    <div className="dashboard-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Sidebar 
        onLogout={handleLogout} 
        onCreateAdmin={() => setShowCreateAdmin(true)}
      />
      
      <div className="main-content">
        <div className="dashboard-header">
          <h4>Product Management Dashboard</h4>
        </div>

        <Container fluid>
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
                      onChange={handleSearchInputChange}
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
                    <th>Image</th>
                    <th>Barcode</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="wait">
                    {loading || isSearching ? (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td colSpan="6" className="text-center py-4">
                          <div className="d-flex justify-content-center align-items-center">
                            <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                            <span>{loadingMessage}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ) : products && products.length > 0 ? (
                      products.map((product) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td>
                            <img 
                              src={product.image_path ? `http://localhost:8000/storage/${product.image_path}` : 'https://via.placeholder.com/50'} 
                              alt={product.description}
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/50';
                              }}
                            />
                          </td>
                          <td>{product.barcode}</td>
                          <td>{product.description}</td>
                          <td>${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</td>
                          <td>{product.quantity}</td>
                          <td>{product.category}</td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => setEditProduct(product)}
                            >
                              <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              <FontAwesomeIcon icon={faTrash} className="me-1" /> Delete
                            </Button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td colSpan="6" className="text-center py-4">
                          {searchTerm ? (
                            <div className="text-muted">
                              <FontAwesomeIcon icon={faSearch} className="me-2" />
                              No products found matching "{searchTerm}"
                            </div>
                          ) : (
                            <div className="text-muted">
                              No products available
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
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
              
              <Form.Group className="admin-form-group">
                <h6 className="form-heading mb-2">Barcode</h6>
                <Form.Control
                  type="text"
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                  isInvalid={!!addErrors.barcode}
                  placeholder="Enter product barcode"
                />
                <Form.Control.Feedback type="invalid">{addErrors.barcode}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="admin-form-group">
                <h6 className="form-heading mb-2">Description</h6>
                <Form.Control
                  type="text"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter product description"
                />
              </Form.Group>

              <Form.Group className="admin-form-group">
                <h6 className="form-heading mb-2">Price</h6>
                <Form.Control
                  type="text"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Enter product price"
                />
              </Form.Group>

              <Form.Group className="admin-form-group">
                <h6 className="form-heading mb-2">Quantity</h6>
                <Form.Control
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  placeholder="Enter product quantity"
                />
              </Form.Group>

              <Form.Group className="admin-form-group">
                <h6 className="form-heading mb-2">Category</h6>
                <Form.Control
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="Enter product category"
                />
              </Form.Group>

              <Form.Group className="admin-form-group">
                <h6 className="form-heading mb-2">Product Image</h6>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        notifyWarning('File size exceeds 5MB limit');
                        e.target.value = '';
                        return;
                      }
                      setNewProduct({ ...newProduct, image: file });
                    }
                  }}
                />
                <small className="text-muted">Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF</small>
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
                
                <Form.Group className="admin-form-group">
                  <h6 className="form-heading mb-2">Barcode</h6>
                  <Form.Control
                    type="text"
                    value={editProduct.barcode}
                    onChange={(e) => setEditProduct({ ...editProduct, barcode: e.target.value })}
                    isInvalid={!!editErrors.barcode}
                  />
                  <Form.Control.Feedback type="invalid">{editErrors.barcode}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="admin-form-group">
                  <h6 className="form-heading mb-2">Description</h6>
                  <Form.Control
                    type="text"
                    value={editProduct.description}
                    onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="admin-form-group">
                  <h6 className="form-heading mb-2">Price</h6>
                  <Form.Control
                    type="text"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="admin-form-group">
                  <h6 className="form-heading mb-2">Quantity</h6>
                  <Form.Control
                    type="number"
                    value={editProduct.quantity}
                    onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="admin-form-group">
                  <h6 className="form-heading mb-2">Category</h6>
                  <Form.Control
                    type="text"
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="admin-form-group">
                  <h6 className="form-heading mb-2">Product Image</h6>
                  {editProduct.image_path && (
                    <div className="mb-2">
                      <img 
                        src={`http://localhost:8000/storage/${editProduct.image_path}`}
                        alt="Current product" 
                        style={{ 
                          width: '100px', 
                          height: '100px', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100';
                        }}
                      />
                    </div>
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          notifyWarning('File size exceeds 5MB limit');
                          e.target.value = '';
                          return;
                        }
                        setEditProduct({ ...editProduct, newImage: file });
                      }
                    }}
                  />
                  <small className="text-muted">Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF</small>
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

        {/* Create Admin Modal */}
        <Modal show={showCreateAdmin} onHide={handleCloseCreateAdmin}>
          <Modal.Header closeButton className="admin-modal-header">
            <Modal.Title className="admin-modal-title">
              <FontAwesomeIcon icon={faUserPlus} className="me-2" />
              Create Admin Account
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {adminErrors.general && <Alert variant="danger">{adminErrors.general}</Alert>}
              
              <Form.Group className="admin-form-group">
                <h6 className="form-heading mb-2">Full Name</h6>
                <Form.Control
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  isInvalid={!!adminErrors.name}
                  placeholder="Enter admin's full name"
                />
                <Form.Control.Feedback type="invalid">{adminErrors.name}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="admin-form-group">
                <h6 className="form-heading mb-2">Email Address</h6>
                <Form.Control
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  isInvalid={!!adminErrors.email}
                  placeholder="Enter admin's email"
                />
                <Form.Control.Feedback type="invalid">{adminErrors.email}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="admin-form-group">
                <h6 className="form-heading mb-2">Password</h6>
                <div className="password-input-wrapper">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={newAdmin.password}
                    onChange={handlePasswordChange}
                    isInvalid={!!adminErrors.password}
                    className="password-field"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </button>
                </div>
                <Form.Control.Feedback type="invalid">{adminErrors.password}</Form.Control.Feedback>
                {newAdmin.password !== '' && (
                  <div className="password-strength">
                    <span className="password-strength-text">Password Strength: </span>
                    <span className={`strength-${passwordStrength ? Math.min(passwordStrength.score, 3) : 'none'}`}>
                      {passwordStrength ? 
                        ['Very Weak', 'Weak', 'Good', 'Strong'][Math.min(passwordStrength.score, 3)] : 
                        'None'
                      }
                    </span>
                  </div>
                )}
              </Form.Group>

              <Form.Group className="admin-form-group">
                <h6 className="form-heading mb-2">Confirm Password</h6>
                <div className="password-input-wrapper">
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    value={newAdmin.password_confirmation}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password_confirmation: e.target.value })}
                    isInvalid={!!adminErrors.password_confirmation}
                    className="password-field"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="password-toggle-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                  </button>
                </div>
                <Form.Control.Feedback type="invalid">{adminErrors.password_confirmation}</Form.Control.Feedback>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCreateAdmin}>Cancel</Button>
            <Button variant="success" onClick={handleCreateAdmin}>Create Admin</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
