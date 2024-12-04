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
import { toast } from 'react-hot-toast';
import './Cart.css';
import { debounce } from 'lodash';

// Create a CartContext
export const CartContext = React.createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    paymentMode: '',
    contactNumber: ''
  });

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
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const formattedCart = response.data.map(item => ({
          id: item.id,
          product: item.product,
          quantity: parseInt(item.quantity || 1),
          price: parseFloat(item.product?.price || 0)
        }));
        setCart(formattedCart);
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
      const token = localStorage.getItem('token');
      const existingItem = cart.find(item => item.id === product.id);
      const quantity = existingItem ? existingItem.quantity + 1 : 1;

      await axios.post(`${API_URL}/api/cart`, {
        product_id: product.id,
        quantity: quantity
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
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
    return cart.reduce((total, item) => {
      const price = parseFloat(item.product?.price || item.price || 0);
      const quantity = parseInt(item.quantity || 0);
      return total + (price * quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/checkout`,
        {},  // Empty body since we're using cart data from the backend
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      // Clear local cart state
      setCart([]);
      
      // Show success message
      toast.success('Order placed successfully!');
      
      // Close the cart modal
      setShowCart(false);

      // Refresh product list to show updated quantities
      fetchProducts();

    } catch (error) {
      console.error('Checkout error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error processing checkout');
      }
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

  // Add this helper function to safely handle number calculations
  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  // Update the cart display section
  const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const price = parseFloat(item.product?.price || item.price || 0);
    const quantity = parseInt(item.quantity || 0);
    const total = price * quantity;

    const handleQuantityChange = (newQuantity) => {
      if (newQuantity >= 0) {  // Prevent negative quantities
        onUpdateQuantity(item, newQuantity);
      }
    };

    return (
      <div className="cart-item">
        <div className="item-details">
          <span>{item.product?.description || item.description}</span>
          <div className="quantity-controls">
            <button 
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="quantity-btn"
            >
              -
            </button>
            <span className="quantity-display">{quantity}</span>
            <button 
              onClick={() => handleQuantityChange(quantity + 1)}
              className="quantity-btn"
            >
              +
            </button>
          </div>
          <span className="item-total">${formatPrice(total)}</span>
          <button className="remove-btn" onClick={() => onRemove(item)}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    );
  };

  // Update the shopping cart modal content
  const renderCartContent = () => {
    if (cart.length === 0) {
      return <p>Your cart is empty</p>;
    }

    return (
      <>
        {cart.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={updateCartItemQuantityOptimistic}
            onRemove={removeFromCart}
          />
        ))}
        <div className="cart-total">
          <strong>Total: ${formatPrice(calculateTotal())}</strong>
        </div>
        <Button 
          variant="success" 
          onClick={() => setShowCheckoutModal(true)}
          className="checkout-btn"
        >
          Proceed to Checkout
        </Button>
      </>
    );
  };

  // Add fetchCartItems function definition before it's used
  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      // Ensure cart items have the correct structure
      const formattedCart = response.data.map(item => ({
        id: item.id,
        product: item.product,
        quantity: parseInt(item.quantity || 1),
        price: parseFloat(item.product?.price || 0)
      }));
      setCart(formattedCart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Update the debouncedUpdateCart function
  const debouncedUpdateCart = debounce(async (item, quantity, token) => {
    try {
      if (quantity === 0) {
        await axios.delete(`${API_URL}/api/cart/${item.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      } else {
        await axios.post(`${API_URL}/api/cart`, {
          product_id: item.product?.id || item.product_id,
          quantity: quantity
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }, 500);

  // Update the updateCartItemQuantityOptimistic function
  const updateCartItemQuantityOptimistic = async (item, newQuantity) => {
    try {
      // Optimistically update the UI first
      setCart(prevCart => 
        prevCart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        )
      );

      const token = localStorage.getItem('token');
      
      // Call the debounced update with the full item object
      await debouncedUpdateCart(item, newQuantity, token);
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      // Revert the optimistic update on error
      toast.error('Failed to update quantity');
      fetchCartItems(); // Refresh cart to get correct state
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
  };

  const handleModalCheckout = async () => {
    // Validate customer info
    if (!customerInfo.name || !customerInfo.address || !customerInfo.paymentMode || !customerInfo.contactNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    // Proceed with checkout logic
    await handleCheckout();

    // Close modal and clear form
    setShowCheckoutModal(false);
    setCustomerInfo({
      name: '',
      address: '',
      paymentMode: '',
      contactNumber: ''
    });

    toast.success('Order placed successfully!');
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
          {renderCartContent()}
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

      <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Checkout Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                name="name"
                value={customerInfo.name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your address"
                name="address"
                value={customerInfo.address}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formPaymentMode">
              <Form.Label>Mode of Payment</Form.Label>
              <Form.Control
                as="select"
                name="paymentMode"
                value={customerInfo.paymentMode}
                onChange={handleInputChange}
              >
                <option value="">Select payment mode</option>
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formContactNumber">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your contact number"
                name="contactNumber"
                value={customerInfo.contactNumber}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalCheckout}>
            Confirm Order
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductCatalog;
