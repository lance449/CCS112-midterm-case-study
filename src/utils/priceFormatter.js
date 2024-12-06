export const formatPrice = (price) => {
  // Handle null or undefined
  if (price === null || price === undefined) return '0.00';
  
  // Handle string values
  if (typeof price === 'string') {
    const cleanPrice = price.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleanPrice || 0).toFixed(2);
  }
  
  // Handle number values
  if (typeof price === 'number') {
    return price.toFixed(2);
  }
  
  // Default fallback
  return '0.00';
};

export const calculateItemTotal = (price, quantity) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : (price || 0);
  const numQuantity = parseInt(quantity || 0);
  return (numPrice * numQuantity).toFixed(2);
};

export const calculateCartTotal = (items) => {
  if (!Array.isArray(items)) return '0.00';
  
  const total = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 0;
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return sum + (numPrice * quantity);
  }, 0);
  
  return total.toFixed(2);
}; 