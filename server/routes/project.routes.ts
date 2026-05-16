import { Router } from "express";
import * as projectController from "../controllers/project.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", projectController.getAll);
router.get("/:id", projectController.getOne);
router.post("/", authorize(["ADMIN"]), projectController.create);
router.put("/:id", authorize(["ADMIN"]), projectController.update);
router.delete("/:id", authorize(["ADMIN"]), projectController.remove);

// Project Members
router.get("/:id/members", projectController.getMembers);
router.post("/:id/members", authorize(["ADMIN"]), projectController.addMember);
router.delete("/:id/members/:memberId", authorize(["ADMIN"]), projectController.removeMember);

export default router;
