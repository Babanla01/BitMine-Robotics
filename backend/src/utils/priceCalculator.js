/**
 * Price Calculator Utility
 * Handles tax calculations, delivery fees, and price validation
 */

// Delivery fee configuration (in Naira)
const DELIVERY_FEE_CONFIG = {
  low: 5000,    // Lagos, Ogun, Osun, Oyo
  high: 10000   // All other states
};

const LOW_DELIVERY_STATES = ['Lagos', 'Ogun', 'Osun', 'Oyo'];

/**
 * Get delivery fee based on state
 * @param {string} state - Nigerian state
 * @returns {number} Delivery fee in Naira
 */
export function getDeliveryFee(state) {
  if (!state) return DELIVERY_FEE_CONFIG.high;
  return LOW_DELIVERY_STATES.includes(state) 
    ? DELIVERY_FEE_CONFIG.low 
    : DELIVERY_FEE_CONFIG.high;
}

/**
 * Calculate tax (5% of subtotal)
 * @param {number} subtotal - Subtotal amount
 * @returns {number} Tax amount
 */
export function calculateTax(subtotal) {
  return parseFloat((subtotal * 0.05).toFixed(2));
}

/**
 * Calculate total with tax and delivery
 * @param {number} subtotal - Subtotal before tax and delivery
 * @param {string} state - Delivery state
 * @returns {object} { subtotal, tax, deliveryFee, total }
 */
export function calculateTotalPrice(subtotal, state) {
  const tax = calculateTax(subtotal);
  const deliveryFee = getDeliveryFee(state);
  const total = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

  return {
    subtotal: parseFloat(subtotal),
    tax,
    deliveryFee,
    total
  };
}

/**
 * Validate and recalculate prices from items
 * @param {array} items - Array of cart items with { product_id, quantity, price_sent }
 * @param {array} productsFromDB - Products fetched from database
 * @returns {object} { isValid, calculatedSubtotal, message }
 */
export function validateAndRecalculatePrices(items, productsFromDB) {
  let calculatedSubtotal = 0;
  const errs = [];

  for (const item of items) {
    const dbProduct = productsFromDB.find(p => p.id === item.product_id);
    
    if (!dbProduct) {
      errs.push(`Product ID ${item.product_id} not found in database`);
      continue;
    }

    const expectedPrice = parseFloat(dbProduct.price);
    const sentPrice = parseFloat(item.price);

    // Check if prices match (allow small floating point differences)
    if (Math.abs(expectedPrice - sentPrice) > 0.01) {
      errs.push(
        `Product ${dbProduct.name}: Expected ₦${expectedPrice}, but ₦${sentPrice} was sent. Possible price tampering detected.`
      );
    }

    calculatedSubtotal += expectedPrice * item.quantity;
  }

  if (errs.length > 0) {
    return {
      isValid: false,
      calculatedSubtotal: 0,
      message: errs.join(' | ')
    };
  }

  return {
    isValid: true,
    calculatedSubtotal: parseFloat(calculatedSubtotal.toFixed(2)),
    message: 'Prices validated successfully'
  };
}
