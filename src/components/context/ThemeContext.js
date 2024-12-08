import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    const currentPath = window.location.pathname;
    const isExcludedPage = ['/login', '/signup', '/dashboard'].some(path => 
      currentPath.startsWith(path)
    );

    if (darkMode && !isExcludedPage) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Clean up any dark mode classes on excluded pages
    if (isExcludedPage) {
      const darkElements = document.querySelectorAll('[class*="dark"]');
      darkElements.forEach(element => {
        Array.from(element.classList)
          .filter(className => className.includes('dark'))
          .forEach(className => element.classList.remove(className));
      });
    }

    return () => {
      if (isExcludedPage) {
        document.body.classList.remove('dark-mode');
      }
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