import express from 'express'
import {body} from "express-validator"
import {register, login, getProfile, updateProfile, changePassword} from "../controllers/authController.js"
import protect from "../middleware/auth.js"

const router = express.Router()

// Validation Middleware
const registerValidation = [
  body("username").trim().isLength({min: 3}).withMessage("Username must be at least 3 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({min: 8}).withMessage("Password must be at least 8 characters")
]

const loginValidation = [
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password must be at least 8 characters")
]

/* Public routes */
router.post("/register", registerValidation, register)
router.post("/login", loginValidation, login)


/* Protected Routes */
router.get("/profile", protect, getProfile)
router.put("/profile", protect, updateProfile)
router.post("/change-password", protect, changePassword)

export default router