import express from "express";
import { addCollaborator, removeCollaborator, getCollaborators } from "../controllers/collaborationController.js";
import protect from "../middleware/auth.js";

const router = express.Router({ mergeParams: true }); // mergeParams gives access to :id from parent

router.use(protect);

router.route("/")
  .get(getCollaborators)      // GET    /api/diagrams/:id/collaborators
  .post(addCollaborator);     // POST   /api/diagrams/:id/collaborators

router.route("/:userId")
  .delete(removeCollaborator); // DELETE /api/diagrams/:id/collaborators/:userId

export default router;