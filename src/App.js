// App.js
import React, { useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import './components/AuthForm.css';

function AnimatedRoutes() {
  const location = useLocation();
  const nodeRef = useRef(null);

  return (
    <div className="auth-wrapper">
      <TransitionGroup component={null}>
        <CSSTransition
          key={location.pathname}
          classNames="fade"
          timeout={300}
          nodeRef={nodeRef}
        >
          <div ref={nodeRef} className="route-container">
            <Routes location={location}>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
