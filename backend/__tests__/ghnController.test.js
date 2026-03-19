jest.mock('../src/models/Order', () => {
  const mockFindById = jest.fn();
  const mockFindByIdAndUpdate = jest.fn();
  return {
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate,
  };
});

jest.mock('../src/services/ghnService', () => ({
  createOrder: jest.fn(),
}));

const Order = require('../src/models/Order');
const ghnService = require('../src/services/ghnService');
const ghnController = require('../src/controllers/ghnController');

describe('ghnController.createGHNOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates GHN order and updates DB on success', async () => {
    const fakeOrder = {
      _id: 'order123',
      customerInfo: { fullName: 'Nguyen Van A', phone: '0123456789', address: '123 Street' },
      shipping: {
        shippingAddressStructured: {
          district: { id: 1442 },
          ward: { code: '20101' },
          detail: 'Apt 1',
        },
        shippingWeight: 500,
        shippingDimensions: { length: 10, width: 10, height: 5 },
      },
      items: [{ name: 'Prod 1', quantity: 1, price: 10000 }],
    };

    Order.findById.mockResolvedValue(fakeOrder);
    ghnService.createOrder.mockResolvedValue({ code: 200, data: { order_code: 'GHN123' } });

    const result = await ghnController.createGHNOrder('order123');

    expect(ghnService.createOrder).toHaveBeenCalled();
    expect(Order.findById).toHaveBeenCalledWith('order123');
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('order123', expect.objectContaining({ ghnOrderCode: 'GHN123' }));
    expect(result).toBe('GHN123');
  });

  test('throws when missing required recipient fields', async () => {
    const badOrder = {
      _id: 'order-no-phone',
      customerInfo: { fullName: 'No Phone' },
      shipping: {},
      items: [],
    };
    Order.findById.mockResolvedValue(badOrder);

    await expect(ghnController.createGHNOrder('order-no-phone')).rejects.toThrow(/Missing recipient/);
    expect(ghnService.createOrder).not.toHaveBeenCalled();
    expect(Order.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('throws when GHN returns non-200 or missing order_code', async () => {
    const fakeOrder = {
      _id: 'order1234',
      customerInfo: { fullName: 'Nguyen Van B', phone: '0987654321', address: 'Somewhere' },
      shipping: { shippingAddressStructured: { district: { id: 1442 }, ward: { code: '20101' } } },
      items: [],
    };
    Order.findById.mockResolvedValue(fakeOrder);
    // simulate GHN returning non-200
    ghnService.createOrder.mockResolvedValue({ code: 400, data: { message: 'Bad' } });

    await expect(ghnController.createGHNOrder('order1234')).rejects.toThrow(/GHN createOrder failed/);
    expect(Order.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
