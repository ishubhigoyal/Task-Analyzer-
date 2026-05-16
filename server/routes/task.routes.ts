import { Router } from "express";
import * as taskController from "../controllers/task.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", taskController.getAll);
router.get("/:id", taskController.getOne);
router.post("/", authorize(["ADMIN"]), taskController.create);
router.put("/:id", taskController.update); // Partially restricted inside controller
router.patch("/:id/status", taskController.updateStatus);
router.delete("/:id", authorize(["ADMIN"]), taskController.remove);

// Comments
router.get("/:id/comments", taskController.getComments);
router.post("/:id/comments", taskController.addComment);

export default router;
