// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ProductCatalog from './components/ProductCatalog';
import ProtectedRoute from './components/ProtectedRoute';
import './components/AuthForm.css';
import './components/PageTransitions.css';

function AppContent() {
  const location = useLocation();

  return (
    <div className="transition-wrapper">
      <TransitionGroup>
        <CSSTransition
          key={location.key}
          timeout={300}
          classNames="page-transition"
          unmountOnExit
        >
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ProductCatalog />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
