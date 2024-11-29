import React from 'react';
import { CSSTransition } from 'react-transition-group';

const PageTransition = ({ children, location }) => {
  return (
    <CSSTransition
      key={location.key}
      timeout={250}
      classNames="fade"
      unmountOnExit
    >
      {children}
    </CSSTransition>
  );
};

export default PageTransition; 