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
import './styles/ProductCatalog.css';
import './styles/CheckoutModal.css';
import './Cart.css';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api';
import NavigationBar from './Navbar';
import { toast } from 'react-hot-toast';
import './Cart.css';
import { debounce } from 'lodash';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';
import { formatPrice, calculateItemTotal, calculateCartTotal } from '../utils/priceFormatter';
import { Spinner, PageSpinner, ButtonSpinner } from '../Spinner';
import { notifySuccess, notifyError, notifyInfo, notifyWarning } from '../utils/notifications';

// Create a CartContext
export const CartContext = React.createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Add these toast style constants at the top of the file
const TOAST_STYLES = {
  success: {
    style: {
      background: '#10B981',
      color: '#ffffff',
      padding: '16px',
      borderRadius: '8px',
      minWidth: '300px',
      marginTop: '80px'
    },
    duration: 2000,
    position: 'top-center'
  },
  error: {
    style: {
      background: '#EF4444',
      color: '#ffffff',
      padding: '16px',
      borderRadius: '8px',
      minWidth: '300px',
      marginTop: '80px'
    },
    duration: 3000,
    position: 'top-center'
  },
  info: {
    style: {
      background: '#333',
      color: '#fff',
      padding: '12px',
      borderRadius: '8px',
      marginTop: '80px'
    },
    duration: 1500,
    position: 'top-center'
  }
};

const MemoizedCartDisplay = React.memo(({ 
  showCart, 
  setShowCart, 
  cart, 
  handleQuantityChange, 
  isUpdatingCart,
  setShowCheckoutModal,
  calculateTotal,
  handleIncrement,
  handleDecrement,
  handleRemoveItem 
}) => (
  <Offcanvas 
    show={showCart} 
    onHide={() => setShowCart(false)} 
    placement="end"
    className="cart-sidebar"
  >
    <Offcanvas.Header closeButton className="cart-header">
      <Offcanvas.Title>
        <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
        Shopping Cart ({cart.length} items)
      </Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body className="cart-body">
      {cart.length === 0 ? (
        <div className="empty-cart">
          <FontAwesomeIcon icon={faShoppingCart} size="3x" className="mb-3" />
          <p>Your cart is empty</p>
          <Button variant="primary" onClick={() => setShowCart(false)}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="item-image">
                  <img src={item.product.image || 'https://via.placeholder.com/100'} alt={item.product.description} />
                </div>
                <div className="item-details">
                  <h6 className="item-title">{item.product.description}</h6>
                  <div className="item-price">${formatPrice(item.product.price)}</div>
                  <div className="quantity-controls">
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => handleDecrement(item)}
                      disabled={isUpdatingCart}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </Button>
                    <span className="quantity">{item.quantity}</span>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => handleIncrement(item)}
                      disabled={isUpdatingCart}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                    <Button
                      variant="link"
                      className="remove-button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isUpdatingCart}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-footer">
            <div className="cart-total">
              <strong>Total:</strong> ${calculateCartTotal(cart)}
            </div>
            <Button 
              variant="primary" 
              className="checkout-button"
              onClick={() => setShowCheckoutModal(true)}
            >
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </Offcanvas.Body>
  </Offcanvas>
));

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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [updatingQuantity, setUpdatingQuantity] = useState({});
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [loading, setLoading] = useState(false);

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
        console.log('Fetching cart with URL:', `${API_URL}/api/cart`); // Debug log
        
        const response = await axios.get(`${API_URL}/api/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        setCart(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
        // Log the full URL that was attempted
        console.error('Attempted URL:', error.config?.url);
        console.error('Failed to load cart items');
      }
    };

    if (localStorage.getItem('token')) {
      fetchCartItems();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      // Ensure we're setting an array
      const productsData = Array.isArray(response.data.data) ? response.data.data : [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
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

  // Add this helper function
  const getFilteredProducts = () => {
    if (!Array.isArray(products)) return [];
    
    return products.filter(product => {
      const matchesSearch = product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === '' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  // Replace your existing filtered products logic with this:
  const filteredProducts = getFilteredProducts();

  const handleAddToCart = async (product) => {
    try {
      const response = await axios.post(`${API_URL}/api/cart`, {
        product_id: product.id,
        quantity: 1,
        is_new: true
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        await fetchCartItems(); // Refresh cart items
        toast.success('Item added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleQuantityChange = async (item, newQuantity) => {
    try {
      const quantity = parseInt(newQuantity);
      
      if (isNaN(quantity) || quantity < 1) {
        notifyWarning('Please enter a valid quantity');
        return;
      }

      // Update local cart state immediately without notification
      setCart(prevCart => 
        prevCart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: quantity }
            : cartItem
        )
      );

      // Make API call silently without notification
      const response = await axios.put(`${API_URL}/api/cart/${item.id}`, {
        quantity: quantity
      });

      if (!response.data || !response.data.cart_item) {
        await fetchCartItems();
        throw new Error('Invalid server response');
      }

    } catch (error) {
      console.error('Update error:', error);
      notifyError('Failed to update quantity');
      await fetchCartItems();
    }
  };

  const handleIncrement = async (item) => {
    try {
      setIsUpdatingCart(true);
      const newQuantity = item.quantity + 1;
      handleQuantityChange(item, newQuantity);
    } catch (error) {
      notifyError('Failed to update quantity');
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const handleDecrement = async (item) => {
    try {
      setIsUpdatingCart(true);
      if (item.quantity > 1) {
        const newQuantity = item.quantity - 1;
        handleQuantityChange(item, newQuantity);
      }
    } catch (error) {
      notifyError('Failed to update quantity');
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const addToCart = async (product) => {
    try {
      setIsUpdatingCart(true);
      const response = await axios.post(`${API_URL}/api/cart`, {
        product_id: product.id,
        quantity: 1,
        is_new: true
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.data) {
        await fetchCartItems();
        notifySuccess(`${product.description} added to cart`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      notifyError(`Failed to add item: ${error.message}`);
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/cart/${productId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = typeof item.product.price === 'string' 
        ? parseFloat(item.product.price) 
        : (item.product.price || 0);
      return total + (price * item.quantity);
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
    // Convert price to number and handle any potential invalid values
    const numPrice = Number(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
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
              className="quantity-btn" 
              onClick={() => handleDecrement(item)}
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item, e.target.value)}
              className="quantity-input"
              style={{ width: '60px', textAlign: 'center' }}
            />
            <button 
              className="quantity-btn" 
              onClick={() => handleIncrement(item)}
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
            onUpdateQuantity={handleQuantityChange}
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

  // Update the fetchCartItems function to be more efficient
  const fetchCartItems = async () => {
    try {
      console.log('Fetching cart items...');
      const response = await axios.get(`${API_URL}/api/cart`);
      console.log('Cart items received:', response.data);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to fetch cart items');
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

  // Add these helper functions
  const validateCartQuantity = (quantity, stockAvailable) => {
    const validQuantity = Math.min(Math.max(1, quantity), stockAvailable);
    return validQuantity;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModalCheckout = async () => {
    try {
      setLoading(true);
      const loadingToastId = notifyInfo('Processing your order...', { duration: null });

      const token = localStorage.getItem('token');
      
      if (!customerInfo.name || !customerInfo.address || !customerInfo.paymentMode || !customerInfo.contactNumber) {
        notifyWarning('Please fill in all required fields');
        toast.dismiss(loadingToastId);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/orders`,
        {
          customer_name: customerInfo.name,
          shipping_address: customerInfo.address,
          payment_method: customerInfo.paymentMode,
          contact_number: customerInfo.contactNumber,
          items: cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          }))
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.dismiss(loadingToastId);
        
        notifySuccess('Order placed successfully!', {
          duration: 5000,
        });

        setShowCheckoutModal(false);
        setCart([]);
        setCustomerInfo({
          name: '',
          address: '',
          paymentMode: '',
          contactNumber: ''
        });
        await fetchProducts();

        setTimeout(() => {
          notifyInfo('Check your order history for updates!', {
            duration: 4000,
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      notifyError(
        error.response?.data?.message || 'Failed to process checkout. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCartItems = () => (
    cart.map((item) => (
      <ListGroup.Item key={item.id} className="cart-item">
        <div className="item-details">
          <div>
            <h6>{item.product.description}</h6>
            <p className="mb-0">Price: ${parseFloat(item.product.price).toFixed(2)}</p>
          </div>
          <div className="quantity-controls">
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => {
                const newValue = e.target.value;
                // Update immediately for responsive UI
                handleQuantityChange(item, newValue);
              }}
              className="quantity-input"
              style={{ width: '60px', textAlign: 'center' }}
            />
          </div>
          <div className="item-total">
            ${(item.quantity * parseFloat(item.product.price)).toFixed(2)}
          </div>
        </div>
      </ListGroup.Item>
    ))
  );

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      // Update the endpoint to use the correct path
      const response = await axios.put(`${API_URL}/api/cart/${cartItemId}`, {
        quantity: newQuantity
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      await fetchCartItems();
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  // Add this function to handle item removal
  const handleRemoveItem = async (itemId) => {
    try {
      setIsUpdatingCart(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${API_URL}/api/cart/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.status === 200 || response.status === 204) {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
        notifySuccess('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      notifyError('Failed to remove item from cart');
    } finally {
      setIsUpdatingCart(false);
    }
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <ErrorBoundary>
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
                <Card className="product-card h-100">
                  <div className="product-image-container">
                    <img 
                      src={product.image || 'https://via.placeholder.com/200'} 
                      alt={product.description}
                      className="product-image"
                    />
                    {product.quantity <= 5 && product.quantity > 0 && (
                      <Badge bg="warning" className="stock-warning">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="product-title text-truncate">
                      {product.description}
                    </Card.Title>
                    <div className="product-details">
                      <div className="price-tag">${formatPrice(product.price)}</div>
                      <Badge bg={product.quantity > 0 ? 'success' : 'danger'} className="stock-badge">
                        {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of Stock'}
                      </Badge>
                    </div>
                    <Button 
                      className="mt-auto add-to-cart-btn"
                      variant={product.quantity === 0 ? 'secondary' : 'primary'}
                      onClick={() => addToCart(product)}
                      disabled={product.quantity === 0 || isUpdatingCart}
                    >
                      {isUpdatingCart ? (
                        <ButtonSpinner />
                      ) : (
                        <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                      )}
                      {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>

        <MemoizedCartDisplay 
          showCart={showCart}
          setShowCart={setShowCart}
          cart={cart}
          handleQuantityChange={handleQuantityChange}
          isUpdatingCart={isUpdatingCart}
          setShowCheckoutModal={setShowCheckoutModal}
          calculateTotal={calculateTotal}
          handleIncrement={handleIncrement}
          handleDecrement={handleDecrement}
          handleRemoveItem={handleRemoveItem}
        />

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
                    {item.product.description} x {item.quantity} = ${formatPrice(item.product.price * item.quantity)}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <h5 className="mt-3">Total: ${formatPrice(calculateTotal())}</h5>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCheckout(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCheckout}>Place Order</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)}>
          <Modal.Header closeButton className="checkout-modal-header">
            <Modal.Title>Checkout Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label className="form-label">
                  Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  required
                  className="form-control-dark"
                />
              </Form.Group>

              <Form.Group controlId="formAddress" className="mb-3">
                <Form.Label className="form-label">
                  Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your address"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  required
                  className="form-control-dark"
                />
              </Form.Group>

              <Form.Group controlId="formPaymentMode" className="mb-3">
                <Form.Label className="form-label">
                  Mode of Payment <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="paymentMode"
                  value={customerInfo.paymentMode}
                  onChange={handleInputChange}
                  required
                  className="form-control-dark"
                >
                  <option value="">Select payment mode</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="formContactNumber" className="mb-3">
                <Form.Label className="form-label">
                  Contact Number <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your contact number"
                  name="contactNumber"
                  value={customerInfo.contactNumber}
                  onChange={handleInputChange}
                  required
                  className="form-control-dark"
                />
              </Form.Group>
            </Form>
            
            <div className="order-summary mt-4">
              <h5>Order Summary</h5>
              <ListGroup>
                {cart.map(item => (
                  <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="item-name">{item.product.description}</span>
                      <span className="text-muted ms-2">x {item.quantity}</span>
                    </div>
                    <span className="item-price">
                      ${formatPrice(item.product.price * item.quantity)}
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <div className="total mt-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Total:</h6>
                <h6 className="mb-0">${formatPrice(calculateTotal())}</h6>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleModalCheckout}>
              {loading ? <ButtonSpinner /> : 'Confirm Order'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default ProductCatalog;