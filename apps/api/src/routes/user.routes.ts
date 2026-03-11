import { Router } from "express";
import { UserController } from "../controllers";
import { authenticate, tenantScope } from "../middleware";

const router = Router();

router.use(authenticate, tenantScope);

router.get("/", UserController.list);
router.get("/:id", UserController.getById);

export default router;
