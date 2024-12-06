import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    if (!darkMode) {
      document.body.classList.remove('dark-mode');
      const darkElements = document.querySelectorAll('.dark-mode');
      darkElements.forEach(element => {
        element.classList.remove('dark-mode');
      });
    } else {
      const isAuthPage = window.location.pathname.includes('/login') || 
                        window.location.pathname.includes('/signup');
      if (!isAuthPage) {
        document.body.classList.add('dark-mode');
      }
    }

    return () => {
      document.body.classList.remove('dark-mode');
      const darkElements = document.querySelectorAll('.dark-mode');
      darkElements.forEach(element => {
        element.classList.remove('dark-mode');
      });
    };
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 