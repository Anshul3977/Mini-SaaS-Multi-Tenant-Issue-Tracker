import { Router } from "express";
import { body } from "express-validator";
import { IssueController } from "../controllers";
import { authenticate, authorize } from "../middleware";
import { IssueStatus, Priority } from "@prisma/client";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Validation Chains ──────────────────────────────────

const createValidation = [
    body("title")
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Title must be 3-100 characters"),
    body("description").optional().isString(),
    body("priority")
        .optional()
        .isIn(Object.values(Priority))
        .withMessage(`Priority must be one of: ${Object.values(Priority).join(", ")}`),
    body("assigneeId").optional().isString(),
];

const updateValidation = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Title must be 3-100 characters"),
    body("description").optional().isString(),
    body("status")
        .optional()
        .isIn(Object.values(IssueStatus))
        .withMessage(`Status must be one of: ${Object.values(IssueStatus).join(", ")}`),
    body("priority")
        .optional()
        .isIn(Object.values(Priority))
        .withMessage(`Priority must be one of: ${Object.values(Priority).join(", ")}`),
    body("assigneeId").optional({ values: "null" }).isString(),
];

// ─── Routes ─────────────────────────────────────────────

router.post("/", createValidation, IssueController.create);
router.get("/", IssueController.list);
router.get("/:id", IssueController.getById);
router.put("/:id", updateValidation, IssueController.update);
router.delete("/:id", authorize("OWNER", "ADMIN"), IssueController.delete);

export default router;
