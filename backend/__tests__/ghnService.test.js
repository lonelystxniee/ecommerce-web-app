const ghn = require('../src/services/ghnService');

test('ghnService exposes methods', () => {
  expect(typeof ghn.getProvinces).toBe('function');
  expect(typeof ghn.getDistricts).toBe('function');
  expect(typeof ghn.getWards).toBe('function');
  expect(typeof ghn.calculateFee).toBe('function');
});
