const Category = require("../models/category");
const XLSX = require("xlsx");
const activityController = require("./activityController");

// Tạo category mới
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Tên category là bắt buộc" });
        }

        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: "Category đã tồn tại" });
        }

        const category = await Category.create({ name, description });

        // Ghi log
        if (req.user) {
            await activityController.createLog(req.user.id, "Tạo danh mục", `Đã tạo danh mục: ${name}`, req);
        }

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });
    } catch (error) {
        console.log("lỗi ở đây");
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Nhập category từ Excel
exports.importCategories = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Vui lòng tải lên một tệp Excel." });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const errors = [];
        let insertedCount = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2;
            const name = row.name || row.Name || row["Tên danh mục"];
            const description = row.description || row.Description || row["Mô tả"];

            if (!name) {
                errors.push({ row: rowNumber, message: "Tên danh mục không được để trống." });
                continue;
            }

            const existing = await Category.findOne({ name: name.trim() });
            if (existing) {
                errors.push({ row: rowNumber, message: `Danh mục '${name}' đã tồn tại.` });
                continue;
            }

            try {
                await Category.create({ name: name.trim(), description: description || "" });
                insertedCount++;
            } catch (err) {
                errors.push({ row: rowNumber, message: `Lỗi khi lưu: ${err.message}` });
            }
        }

        // Ghi log nhập thành công
        if (insertedCount > 0 && req.user) {
            await activityController.createLog(req.user.id, "Nhập Excel danh mục", `Đã nhập thành công ${insertedCount} danh mục từ Excel`, req);
        }

        res.status(200).json({
            success: true,
            totalRows: rows.length,
            insertedCount,
            failedCount: errors.length,
            errors
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy tất cả categories (có search và sort)
exports.getAllCategories = async (req, res) => {
    try {
        const { q, sort } = req.query;
        let query = {};

        // Search logic
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ];
        }

        // Sort logic
        let sortOption = { createdAt: -1 }; // Mặc định mới nhất
        if (sort === "name_asc") sortOption = { name: 1 };
        else if (sort === "name_desc") sortOption = { name: -1 };
        else if (sort === "oldest") sortOption = { createdAt: 1 };

        const categories = await Category.find(query).sort(sortOption);
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Cập nhật category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Ghi log
        if (req.user) {
            await activityController.createLog(req.user.id, "Cập nhật danh mục", `Đã cập nhật danh mục: ${category.name}`, req);
        }

        res.json({
            success: true,
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Xóa category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Kiểm tra xem category có tồn tại không
        const categoryToDelete = await Category.findById(id);
        if (!categoryToDelete) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // 2. Tìm hoặc tạo danh mục mặc định "Khác"
        let defaultCategory = await Category.findOne({ name: "Khác" });
        if (!defaultCategory) {
            defaultCategory = await Category.create({
                name: "Khác",
                description: "Danh mục mặc định cho các sản phẩm chưa phân loại"
            });
        }

        // Không cho phép xóa danh mục "Khác" nếu nó là danh mục mặc định chứa fallback
        if (categoryToDelete._id.toString() === defaultCategory._id.toString()) {
            return res.status(400).json({ success: false, message: "Không thể xóa danh mục mặc định 'Khác'" });
        }

        // 3. Tìm các sản phẩm đang có categoryID chứa ID của danh mục sắp xóa
        const Product = require("../models/Product"); // Import tạm thời để tránh circular dependency error cục bộ nếu có

        // Nếu một sản phẩm CHỈ CÓ 1 danh mục và đó là danh mục bị xóa -> Gán sang "Khác"
        await Product.updateMany(
            { categoryID: { $size: 1, $in: [id] } },
            { $set: { categoryID: [defaultCategory._id] } }
        );

        // Nếu một sản phẩm có NHIỀU danh mục -> Chỉ cần pull (xóa) ID danh mục bị xóa ra khỏi mảng
        await Product.updateMany(
            { categoryID: id },
            { $pull: { categoryID: id } }
        );

        // 4. Tiến hành xóa category
        await Category.findByIdAndDelete(id);

        // Ghi log
        if (req.user) {
            await activityController.createLog(req.user.id, "Xóa danh mục", `Đã xóa danh mục: ${categoryToDelete.name} và chuyển các sản phẩm mồ côi sang danh mục Khác`, req);
        }

        res.json({ success: true, message: "Category deleted successfully and products reassigned" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
