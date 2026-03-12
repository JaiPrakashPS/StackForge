import express from "express";
import {
  getDiagrams,
  getDiagram,
  createDiagram,
  updateDiagram,
  deleteDiagram,
} from "../controllers/diagramController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// All diagram routes require authentication
router.use(protect);

router.route("/")
  .get(getDiagrams)       // GET  /api/diagrams
  .post(createDiagram);   // POST /api/diagrams

router.route("/:id")
  .get(getDiagram)        // GET    /api/diagrams/:id
  .put(updateDiagram)     // PUT    /api/diagrams/:id
  .delete(deleteDiagram); // DELETE /api/diagrams/:id

export default router;