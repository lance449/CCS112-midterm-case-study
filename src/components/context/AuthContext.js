import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authErrors, setAuthErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setError = (error) => {
    setAuthErrors(error);
  };

  const clearErrors = () => {
    setAuthErrors({});
  };

  return (
    <AuthContext.Provider value={{ 
      authErrors, 
      setError, 
      clearErrors,
      isSubmitting,
      setIsSubmitting
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 