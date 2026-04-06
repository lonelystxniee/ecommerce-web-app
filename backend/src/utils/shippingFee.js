// Shipping fee adjustment utility
// Applies business rules: free-ship over threshold, discounts and max cap
const DEFAULTS = {
  FREE_SHIP_THRESHOLD: 500000, // orders >= this get free shipping
  MAX_SHIPPING_FEE: 40000, // final shipping must not exceed this
  LOW_DISCOUNT_RATE: 0.3, // apply for fees below MAX_SHIPPING_FEE
  HIGH_DISCOUNT_MIN: 0.5, // minimum discount for high fees
  HIGH_DISCOUNT_MAX: 0.6, // maximum discount for very high fees
};

function normalizeNumber(v) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n : 0;
}

module.exports = function calculateShippingFee(orderContext = {}, originalFee = 0, options = {}) {
  const cfg = {
    FREE_SHIP_THRESHOLD: Number(process.env.FREE_SHIP_THRESHOLD || DEFAULTS.FREE_SHIP_THRESHOLD),
    MAX_SHIPPING_FEE: Number(process.env.MAX_SHIPPING_FEE || DEFAULTS.MAX_SHIPPING_FEE),
    LOW_DISCOUNT_RATE: Number(process.env.LOW_DISCOUNT_RATE || DEFAULTS.LOW_DISCOUNT_RATE),
    HIGH_DISCOUNT_MIN: Number(process.env.HIGH_DISCOUNT_MIN || DEFAULTS.HIGH_DISCOUNT_MIN),
    HIGH_DISCOUNT_MAX: Number(process.env.HIGH_DISCOUNT_MAX || DEFAULTS.HIGH_DISCOUNT_MAX),
  };

  const orderTotal = normalizeNumber(orderContext.total || orderContext.orderValue || 0);
  const orig = normalizeNumber(originalFee);

  const breakdown = {
    originalFee: orig,
    shippingFee: orig,
    freeShip: false,
    discountRate: 0,
    cappedAtMax: false,
    appliedRule: null,
  };

  // Free shipping by order value
  if (orderTotal >= cfg.FREE_SHIP_THRESHOLD) {
    breakdown.shippingFee = 0;
    breakdown.freeShip = true;
    breakdown.appliedRule = 'free_by_order_value';
    return options.returnBreakdown ? breakdown : 0;
  }

  // If original fee is zero or negative, nothing to do
  if (orig <= 0) {
    breakdown.shippingFee = 0;
    breakdown.appliedRule = 'zero_or_negative_fee';
    return options.returnBreakdown ? breakdown : 0;
  }

  // For fees below max, apply a modest discount
  if (orig < cfg.MAX_SHIPPING_FEE) {
    breakdown.discountRate = cfg.LOW_DISCOUNT_RATE;
    breakdown.shippingFee = Math.round(orig * (1 - breakdown.discountRate));
    breakdown.appliedRule = 'low_fee_discount';
  } else {
    // For fees >= MAX_SHIPPING_FEE, try to pick a discount between HIGH_DISCOUNT_MIN and HIGH_DISCOUNT_MAX
    const requiredDiscount = 1 - cfg.MAX_SHIPPING_FEE / orig;
    let useDiscount = requiredDiscount;
    if (useDiscount < cfg.HIGH_DISCOUNT_MIN) useDiscount = cfg.HIGH_DISCOUNT_MIN;
    if (useDiscount > cfg.HIGH_DISCOUNT_MAX) useDiscount = cfg.HIGH_DISCOUNT_MAX;
    breakdown.discountRate = Number(useDiscount.toFixed(3));
    breakdown.shippingFee = Math.round(orig * (1 - breakdown.discountRate));
    breakdown.appliedRule = 'high_fee_discount';

    // Ensure final fee does not exceed cap
    if (breakdown.shippingFee > cfg.MAX_SHIPPING_FEE) {
      breakdown.shippingFee = cfg.MAX_SHIPPING_FEE;
      breakdown.cappedAtMax = true;
    }
  }

  // Sanity floor
  if (breakdown.shippingFee < 0) breakdown.shippingFee = 0;

  return options.returnBreakdown ? breakdown : breakdown.shippingFee;
};
