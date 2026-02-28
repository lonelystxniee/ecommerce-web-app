const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/update-profile", verifyToken, authController.updateProfile);
router.get("/profile", verifyToken, authController.getProfile);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.patch("/lock-account", verifyToken, authController.lockAccount);
router.get("/users", authController.getAllUsers);
router.delete("/users/:id", authController.deleteUser);
router.post("/users", authController.adminCreateUser);
router.post("/google", authController.googleLogin);


module.exports = router;
