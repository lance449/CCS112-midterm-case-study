import React, { useState } from 'react';
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

const NavigationBar = ({ cartItemCount, onCartClick, onLogout, searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const userName = localStorage.getItem('userName') || 'User';

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    // Add your category filtering logic here
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
    <Navbar bg="white" expand="lg" className="shadow-sm fixed-top main-navbar">
      <Container fluid>
        <Navbar.Brand href="#" className="brand-text">
          <span className="text-success">Shop</span>cart
        </Navbar.Brand>
        
        <div className="nav-categories d-none d-lg-flex">
          <Nav.Link 
            href="#" 
            active={selectedCategory === 'all'}
            onClick={() => handleCategoryClick('all')}
          >
            All Products
          </Nav.Link>
          <Nav.Link 
            href="#" 
            active={selectedCategory === 'deals'}
            onClick={() => handleCategoryClick('deals')}
          >
            Deals
          </Nav.Link>
          <Nav.Link 
            href="#" 
            active={selectedCategory === 'new'}
            onClick={() => handleCategoryClick('new')}
          >
            What's New
          </Nav.Link>
          <Nav.Link 
            href="#" 
            active={selectedCategory === 'delivery'}
            onClick={() => handleCategoryClick('delivery')}
          >
            Delivery
          </Nav.Link>
        </div>

        <InputGroup className="search-bar">
          <Form.Control
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <InputGroup.Text>
            <FontAwesomeIcon icon={faSearch} />
          </InputGroup.Text>
        </InputGroup>

        <Nav className="nav-icons">
          <Dropdown align="end">
            <Dropdown.Toggle as={Nav.Link} className="nav-icon">
              <FontAwesomeIcon icon={faUser} />
              <span className="icon-label">Account</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="account-dropdown">
              <Dropdown.Header>Hello, {userName}!</Dropdown.Header>
              <Dropdown.Item onClick={() => handleAccountClick('profile')}>
                <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                My Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleAccountClick('orders')}>
                <FontAwesomeIcon icon={faHistory} className="me-2" />
                Order History
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleAccountClick('settings')}>
                <FontAwesomeIcon icon={faCog} className="me-2" />
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={onLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Nav.Link onClick={onCartClick} className="nav-icon">
            <FontAwesomeIcon icon={faShoppingCart} />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
            <span className="icon-label">Cart</span>
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
