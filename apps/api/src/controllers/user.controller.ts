import { Request, Response } from "express";
import { UserService } from "../services";

export class UserController {
    static async list(req: Request, res: Response) {
        const users = await UserService.listByTenant(req.user!.tenantId);
        res.json(users);
    }

    static async getById(req: Request, res: Response) {
        const user = await UserService.findById(req.params.id as string, req.user!.tenantId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json(user);
    }
}
