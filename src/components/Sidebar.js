import React from 'react';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faSignOutAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ onLogout, onCreateAdmin }) => {
  return (
    <div className="sidebar bg-dark text-white">
      <div className="sidebar-header p-3">
        <h5 className="mb-0">Admin Dashboard</h5>
      </div>
      <Nav className="flex-column">
        <Nav.Link className="text-white">
          <FontAwesomeIcon icon={faBox} className="me-2" />
          Products
        </Nav.Link>
        <Nav.Link className="text-white" onClick={onCreateAdmin}>
          <FontAwesomeIcon icon={faUserPlus} className="me-2" />
          Add Admin
        </Nav.Link>
        <Nav.Link className="text-white" onClick={onLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          Logout
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
