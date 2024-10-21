// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Login from './components/Login';
import SignUp from './components/SignUp';
import './components/AuthForm.css';


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <TransitionGroup className="auth-container">
      <CSSTransition key={location.pathname} classNames="fade" timeout={300}>
        <Routes location={location}>
          <Route path="/" element={<RouteWrapper><Login /></RouteWrapper>} />
          <Route path="/login" element={<RouteWrapper><Login /></RouteWrapper>} />
          <Route path="/signup" element={<RouteWrapper><SignUp /></RouteWrapper>} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

function RouteWrapper({ children }) {
  return (
    <div className="route-container">
      {children}
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
