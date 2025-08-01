import express from "express";
import {
  login,
  logout,
  register,
  adminRegister,
  registerBranchAdmin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/admin-register", adminRegister);
router.post("/register-branch-admin", registerBranchAdmin);
// In authRoutes.js
export default router;
