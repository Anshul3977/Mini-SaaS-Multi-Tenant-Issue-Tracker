import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers";
import { authenticate } from "../middleware";

const router = Router();

// ─── Validation Chains ──────────────────────────────────

const registerValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("tenantName").trim().notEmpty().withMessage("Organisation name is required"),
];

const joinValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("tenantSlug")
        .trim()
        .notEmpty()
        .withMessage("Organisation slug is required")
        .matches(/^[a-z0-9-]+$/)
        .withMessage("Slug must be lowercase alphanumeric with hyphens"),
];

const loginValidation = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

// ─── Routes ─────────────────────────────────────────────

router.post("/register", registerValidation, AuthController.register);
router.post("/register/join", joinValidation, AuthController.join);
router.post("/login", loginValidation, AuthController.login);
router.get("/me", authenticate, AuthController.me);

export default router;
