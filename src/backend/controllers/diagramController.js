import Diagram from "../models/Diagram.js";

// ── GET /api/diagrams — list all diagrams for logged-in user ──────────────────
export const getDiagrams = async (req, res) => {
  try {
    const diagrams = await Diagram.find({ user: req.user._id })
      .select("_id name description componentCount estimatedCost createdAt updatedAt")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: diagrams.length, diagrams });
  } catch (err) {
    console.error("getDiagrams error:", err);
    res.status(500).json({ success: false, message: "Could not fetch diagrams." });
  }
};

// ── GET /api/diagrams/:id — get single diagram ────────────────────────────────
export const getDiagram = async (req, res) => {
  try {
    const diagram = await Diagram.findOne({ _id: req.params.id, user: req.user._id });
    if (!diagram) {
      return res.status(404).json({ success: false, message: "Diagram not found." });
    }
    res.status(200).json({ success: true, diagram });
  } catch (err) {
    console.error("getDiagram error:", err);
    res.status(500).json({ success: false, message: "Could not fetch diagram." });
  }
};

// ── POST /api/diagrams — create new diagram ───────────────────────────────────
export const createDiagram = async (req, res) => {
  try {
    const { name, description, nodes, edges, pencilLines } = req.body;

    const diagram = await Diagram.create({
      user:        req.user._id,
      name:        name || "Untitled Architecture",
      description: description || "",
      nodes:       nodes || [],
      edges:       edges || [],
      pencilLines: pencilLines || [],
    });

    res.status(201).json({ success: true, diagram });
  } catch (err) {
    console.error("createDiagram error:", err);
    res.status(500).json({ success: false, message: "Could not create diagram." });
  }
};

// ── PUT /api/diagrams/:id — update (save) existing diagram ────────────────────
export const updateDiagram = async (req, res) => {
  try {
    const { name, description, nodes, edges, pencilLines } = req.body;

    // Ensure the diagram belongs to this user
    let diagram = await Diagram.findOne({ _id: req.params.id, user: req.user._id });
    if (!diagram) {
      return res.status(404).json({ success: false, message: "Diagram not found." });
    }

    if (name        !== undefined) diagram.name        = name;
    if (description !== undefined) diagram.description = description;
    if (nodes       !== undefined) diagram.nodes       = nodes;
    if (edges       !== undefined) diagram.edges       = edges;
    if (pencilLines !== undefined) diagram.pencilLines = pencilLines;

    await diagram.save(); // triggers pre-save hook to recompute stats

    res.status(200).json({ success: true, diagram });
  } catch (err) {
    console.error("updateDiagram error:", err);
    res.status(500).json({ success: false, message: "Could not update diagram." });
  }
};

// ── DELETE /api/diagrams/:id — delete diagram ─────────────────────────────────
export const deleteDiagram = async (req, res) => {
  try {
    const diagram = await Diagram.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!diagram) {
      return res.status(404).json({ success: false, message: "Diagram not found." });
    }
    res.status(200).json({ success: true, message: "Diagram deleted." });
  } catch (err) {
    console.error("deleteDiagram error:", err);
    res.status(500).json({ success: false, message: "Could not delete diagram." });
  }
};