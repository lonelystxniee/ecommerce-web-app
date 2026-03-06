const XLSX = require("xlsx");
const path = require("path");

const data = [
    { "name": "Ô mai Sấu", "description": "Tổng hợp các loại ô mai làm từ quả sấu tươi" },
    { "name": "Ô mai Mơ", "description": "Các dòng ô mai mơ chua ngọt, mơ gừng truyền thống" },
    { "name": "Ô mai Mận", "description": "Mận xào gừng, mận cơm dẻo" },
    { "name": "Bánh Kẹo", "description": "Bánh kẹo đặc sản các vùng miền" },
    { "name": "Trà & Đồ uống", "description": "Các loại trà thảo mộc, trà mạn cao cấp" }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Categories");

const filePath = path.join(__dirname, "..", "category_sample.xlsx");
XLSX.writeFile(wb, filePath);

console.log(`Successfully created sample file at: ${filePath}`);
