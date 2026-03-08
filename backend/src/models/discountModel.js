// Discount Model
const discountModel = {
    tableName: 'discounts',

    schema: {
        id: 'UUID',
        code: 'STRING',           // e.g., "SUMMER2024"
        description: 'TEXT',      // e.g., "Get 20% off on all summer items"
        discountPercent: 'FLOAT',
        validFrom: 'DATETIME',
        validUntil: 'DATETIME',
        isActive: 'BOOLEAN',

        // Banner specific fields
        isBannerActive: 'BOOLEAN',
        bannerText: 'STRING',     // Short text for the top banner
        bannerColor: 'STRING',    // e.g., "linear-gradient(90deg, #FAD961 0%, #F76B1C 100%)"
        priority: 'INTEGER',      // To determine which banner to show if multiple are active

        createdAt: 'DATETIME',
        updatedAt: 'DATETIME'
    }
};

module.exports = discountModel;
