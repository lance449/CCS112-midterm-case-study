import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Form, Modal, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { debounce } from 'lodash';

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

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get('http://127.0.0.1:8000/api/products');
      setProducts(response.data);
    };
    fetchProducts();
  }, []);

  // Handle Add Product
  const handleAddProduct = async () => {
    if (
      !newProduct.barcode ||
      !newProduct.description ||
      !newProduct.price ||
      !newProduct.quantity ||
      !newProduct.category
    ) {
      alert('Please fill out all fields before adding a product.');
      return;
    }

    const existingProduct = products.find(
      (product) => product.barcode === newProduct.barcode
    );

    if (existingProduct) {
      alert('A product with this barcode already exists.');
      return;
    }

    const productToAdd = {
      ...newProduct,
      price: parseFloat(newProduct.price) || 0
    };

    console.log('Adding product:', productToAdd);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/products', productToAdd);
      console.log('Product added:', response.data);
      setProducts([...products, response.data]);
      setShowAdd(false);
      setNewProduct({ barcode: '', description: '', price: '', quantity: '', category: '' });
    } catch (error) {
      console.error('Error adding product:', error.response ? error.response.data : error.message);
    }
  };

  // Handle Edit Product
  const handleEditProduct = async () => {
    await axios.put(`http://127.0.0.1:8000/api/products/${editProduct.id}`, editProduct);
    setEditProduct(null);
    window.location.reload();
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id) => {
    await axios.delete(`http://127.0.0.1:8000/api/products/${id}`);
    window.location.reload();
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

  return (
    <Container fluid className="dashboard py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary">Product Dashboard</h1>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Search Item</h5>
              <Form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                <div className="position-relative flex-grow-1 mr-2">
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
                  {searchTerm && (
                    <Button
                      variant="link"
                      className="position-absolute"
                      style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                      onClick={() => {
                        setSearchTerm('');
                        handleSearch('');
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                  )}
                </div>
                <Button variant="outline-primary" onClick={() => handleSearch(searchTerm)}>
                  <FontAwesomeIcon icon={faSearch} /> Search
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Add a product</h5>
              <Button variant="success" onClick={() => setShowAdd(true)}>
                <FontAwesomeIcon icon={faPlus} /> Add Product
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Body>
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
                        <Button variant="outline-primary" size="sm" className="mr-2" onClick={() => setEditProduct(product)}>
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
    </Container>
  );
};

export default Dashboard;
