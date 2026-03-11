import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthService } from "../services";

export class AuthController {
    static async register(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: "Validation failed", data: errors.array() });
            return;
        }

        const { name, email, password, tenantName } = req.body;
        const result = await AuthService.register({ name, email, password, tenantName });

        res.status(201).json({
            success: true,
            message: "Organisation created successfully",
            data: result,
        });
    }

    static async join(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: "Validation failed", data: errors.array() });
            return;
        }

        const { name, email, password, tenantSlug } = req.body;
        const result = await AuthService.join({ name, email, password, tenantSlug });

        res.status(201).json({
            success: true,
            message: "Joined organisation successfully",
            data: result,
        });
    }

    static async login(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: "Validation failed", data: errors.array() });
            return;
        }

        const { email, password } = req.body;
        const result = await AuthService.login({ email, password });

        res.json({
            success: true,
            message: "Login successful",
            data: result,
        });
    }

    static async me(req: Request, res: Response) {
        res.json({
            success: true,
            message: "Authenticated user",
            data: { user: req.user },
        });
    }
}
