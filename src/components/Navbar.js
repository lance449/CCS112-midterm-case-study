import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faUser, 
  faSignOutAlt, 
  faSearch,
  faUserCircle,
  faHistory,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!searchTerm) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={`search-bar ${isExpanded ? 'expanded' : ''}`}>
      <div className="search-input-container">
        <Form.Control
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="search-input"
        />
        <div className="search-icon">
          <FontAwesomeIcon icon={faSearch} />
        </div>
      </div>
    </div>
  );
};

const NavigationBar = ({ cartItemCount, onCartClick, onLogout, searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const userName = localStorage.getItem('userName') || 'User';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAccountClick = (option) => {
    switch(option) {
      case 'profile':
        navigate('/profile');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  return (
    <Navbar expand="lg" className={`main-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <Container fluid className="nav-container">
        <Navbar.Brand href="#" className="brand-text">
          <span className="shop-text">Ecommerce </span>
          <span className="cart-text">Shop</span>
        </Navbar.Brand>
        
   

        <div className="nav-right">
          <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
          
          <Nav className="nav-icons">
            <Dropdown align="end">
              <Dropdown.Toggle as={Nav.Link} className="nav-icon">
                <FontAwesomeIcon icon={faUser} className="icon-size" />
                <span className="icon-label">Account</span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="account-dropdown">
                <Dropdown.Header className="dropdown-header">Hello, {userName}!</Dropdown.Header>
                {[
                  { key: 'profile', icon: faUserCircle, text: 'My Profile' },
                  { key: 'orders', icon: faHistory, text: 'Order History' },
                  { key: 'settings', icon: faCog, text: 'Settings' }
                ].map((item) => (
                  <Dropdown.Item 
                    key={item.key}
                    onClick={() => handleAccountClick(item.key)}
                    className="dropdown-item-custom"
                  >
                    <FontAwesomeIcon icon={item.icon} className="me-2" />
                    {item.text}
                  </Dropdown.Item>
                ))}
                <Dropdown.Divider />
                <Dropdown.Item onClick={onLogout} className="dropdown-item-custom logout-item">
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Nav.Link onClick={onCartClick} className="nav-icon cart-icon">
              <div className="icon-wrapper">
                <FontAwesomeIcon icon={faShoppingCart} className="icon-size" />
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </div>
              <span className="icon-label">Cart</span>
            </Nav.Link>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
