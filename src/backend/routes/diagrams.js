import express from "express";
import {
  getDiagrams, getDiagram, createDiagram, updateDiagram, deleteDiagram,
} from "../controllers/diagramController.js";
import protect from "../middleware/auth.js";
import collaborationRouter from "./collaboration.js";

const router = express.Router();
router.use(protect);

router.route("/")
  .get(getDiagrams)
  .post(createDiagram);

router.route("/:id")
  .get(getDiagram)
  .put(updateDiagram)
  .delete(deleteDiagram);

// Mount collaboration routes under /api/diagrams/:id/collaborators
router.use("/:id/collaborators", collaborationRouter);

export default router;