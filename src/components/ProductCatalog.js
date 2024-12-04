import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Badge,
  Offcanvas,
  ListGroup,
  Modal,
  Dropdown
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faShoppingCart, 
  faPlus, 
  faMinus, 
  faTrash,
  faArrowRight,
  faUser,
  faSignOutAlt,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import '../styles/ProductCatalog.css';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api';
import NavigationBar from './Navbar';

// Create a CartContext
export const CartContext = React.createContext();

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    address: '',
    phone: '',
    paymentMethod: 'cod'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Extract unique categories from products
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    setCategories(uniqueCategories);
  }, [products]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/cart', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const cartItems = response.data.map(item => ({
          id: item.product.id,
          description: item.product.description,
          price: item.product.price,
          quantity: item.quantity
        }));
        setCart(cartItems);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    if (localStorage.getItem('token')) {
      fetchCartItems();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/products/search?query=${searchTerm}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = async (product) => {
    try {
      const existingItem = cart.find(item => item.id === product.id);
      const quantity = existingItem ? existingItem.quantity + 1 : 1;

      await axios.post('http://localhost:8000/api/cart', {
        product_id: product.id,
        quantity: quantity
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (existingItem) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateCartQuantity = (productId, change) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`http://localhost:8000/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    try {
      await axios.delete('http://localhost:8000/api/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  return (
    <div className="product-catalog">
      <NavigationBar 
        cartItemCount={cart.length} 
        onCartClick={() => setShowCart(true)} 
        onLogout={handleLogout}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <Container className="mt-5 pt-4">
        <div className="search-filter-container">
          <div className="filter-row">
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </Form.Select>
          </div>
        </div>

        <Row className="products-grid">
          {filteredProducts.map(product => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card className="product-card">
                <Card.Body>
                  <Card.Title className="mb-3">{product.description}</Card.Title>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="price">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</div>
                    <Badge bg={product.quantity > 0 ? 'success' : 'danger'} className="stock-badge">
                      {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
                    </Badge>
                  </div>
                  <div className="category-badge mb-3">
                    <Badge bg="primary" className="category-label">
                      {product.category}
                    </Badge>
                  </div>
                  <Button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                    disabled={product.quantity === 0}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                    {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Offcanvas show={showCart} onHide={() => setShowCart(false)} placement="end" className="cart-sidebar">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Shopping Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <ListGroup className="cart-items">
                {cart.map(item => (
                  <ListGroup.Item key={item.id} className="cart-item">
                    <div className="item-details">
                      <h6>{item.description}</h6>
                      <div className="price">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div className="quantity-controls">
                      <Button variant="light" size="sm" onClick={() => updateCartQuantity(item.id, -1)}>
                        <FontAwesomeIcon icon={faMinus} />
                      </Button>
                      <span className="quantity">{item.quantity}</span>
                      <Button variant="light" size="sm" onClick={() => updateCartQuantity(item.id, 1)}>
                        <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => removeFromCart(item.id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <div className="cart-total">
                <h5>Total: ${calculateTotal().toFixed(2)}</h5>
                <Button variant="success" onClick={() => setShowCheckout(true)}>
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Checkout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={shippingDetails.name}
                onChange={(e) => setShippingDetails({...shippingDetails, name: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Shipping Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={shippingDetails.address}
                onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                value={shippingDetails.phone}
                onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
                value={shippingDetails.paymentMethod}
                onChange={(e) => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})}
              >
                <option value="cod">Cash on Delivery</option>
              </Form.Select>
            </Form.Group>
          </Form>
          <div className="order-summary">
            <h5>Order Summary</h5>
            <ListGroup>
              {cart.map(item => (
                <ListGroup.Item key={item.id}>
                  {item.description} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <h5 className="mt-3">Total: ${calculateTotal().toFixed(2)}</h5>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckout(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCheckout}>Place Order</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductCatalog;
