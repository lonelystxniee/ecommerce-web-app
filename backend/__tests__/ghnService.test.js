const ghn = require('../src/services/ghnService');

test('ghnService exposes methods', () => {
  expect(typeof ghn.getProvinces).toBe('function');
  expect(typeof ghn.getDistricts).toBe('function');
  expect(typeof ghn.getWards).toBe('function');
  expect(typeof ghn.calculateFee).toBe('function');
});

const orderController = require('../src/controllers/orderController');
test('orderController exposes createShipment and getGHNInfo', () => {
  expect(typeof orderController.createShipment).toBe('function');
  expect(typeof orderController.getGHNInfo).toBe('function');
});
