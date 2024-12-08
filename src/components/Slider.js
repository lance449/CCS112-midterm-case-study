import React, { useState } from 'react';
import { Carousel } from 'react-bootstrap';
import './Slider.css';

const Slider = ({ products }) => {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
    } else {
      setIndex(featuredProducts.length - 1);
    }
  };

  const handleNext = () => {
    if (index < featuredProducts.length - 1) {
      setIndex(index + 1);
    } else {
      setIndex(0);
    }
  };

  // Filter products with images and take the first 3
  const featuredProducts = products
    ?.filter(product => product.image_path)
    .slice(0, 3)
    .map(product => ({
      id: product.id,
      image: `http://localhost:8000/storage/${product.image_path}`,
      title: product.name?.toUpperCase() || product.description?.toUpperCase(),
      price: parseFloat(product.price).toFixed(2),
      inStock: product.quantity > 0
    }));

  return (
    <div className="slider-container">
      {/* Background Elements */}
      <div className="background-circles">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <Carousel 
        activeIndex={index}
        onSelect={handleSelect}
        fade={true} 
        interval={6000} 
        className="custom-carousel"
        pause="hover"
        touch={true}
        indicators={false}
        controls={false}
      >
        {featuredProducts?.map((product) => (
          <Carousel.Item key={product.id}>
            <div className="carousel-image-container">
              <img
                src={product.image}
                alt={product.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x800?text=Product+Image';
                }}
              />
            </div>
            <div className="custom-caption">
              <h2 className="product-title">{product.title}</h2>
              <div className="price">${product.price}</div>
              <div className="rating">{product.rating}</div>
              <p className="product-description">{product.description}</p>
              <div className="button-wrapper">
                <button 
                  className="slider-button"
                  onClick={() => {
                    if (product.inStock) {
                      console.log('Adding to cart:', product.id);
                    }
                  }}
                >
                  BUY NOW
                </button>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Custom Navigation Buttons */}
      <button className="carousel-control-prev" onClick={handlePrev}>
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="carousel-control-next" onClick={handleNext}>
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default Slider;
