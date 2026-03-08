// Discount Controller
const discountModel = require('../models/discountModel');

const discountController = {
    // Get the currently active banner/promotion
    getActiveBanner: async (req, res) => {
        try {
            // In a real DB, you would do: 
            // SELECT * FROM discounts WHERE isBannerActive = true AND isActive = true 
            // ORDER BY priority DESC LIMIT 1

            // Mocking the response for now
            const activeBanner = {
                code: 'WELCOME2024',
                bannerText: '🎉 Welcome to our shop! Use code **WELCOME2024** for 10% off your first order.',
                bannerColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                isBannerActive: true
            };

            res.status(200).json(activeBanner);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Create a new discount (Admin only)
    createDiscount: async (req, res) => {
        try {
            const discountData = req.body;
            // Logic to save to DB would go here
            res.status(201).json({ message: 'Discount created successfully', data: discountData });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = discountController;
