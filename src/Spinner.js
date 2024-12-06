import React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';
import './Spinner.css';

export const Spinner = ({ variant = 'primary', size = 'md', text = 'Loading...' }) => {
  return (
    <div className="spinner-wrapper">
      <BootstrapSpinner
        animation="border"
        variant={variant}
        className={`spinner-${size}`}
      />
      {text && <div className="spinner-text">{text}</div>}
    </div>
  );
};

export const PageSpinner = () => {
  return (
    <div className="page-spinner-wrapper">
      <Spinner size="lg" text="Loading content..." />
    </div>
  );
};

export const ButtonSpinner = () => {
  return <BootstrapSpinner animation="border" size="sm" className="button-spinner" />;
};
