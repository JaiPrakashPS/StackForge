import Diagram from "../models/Diagram.js";

// ── GET /api/diagrams — list owned + shared diagrams ─────────────────────────
export const getDiagrams = async (req, res) => {
  try {
    const uid = req.user._id;

    // Find diagrams the user owns OR is a collaborator on
    const diagrams = await Diagram.find({
      $or: [
        { user: uid },
        { "collaborators.user": uid },
      ],
    })
      .select("_id name description componentCount estimatedCost createdAt updatedAt user collaborators")
      .populate("user", "firstName lastName email")
      .sort({ updatedAt: -1 });

    // Tag each diagram so the UI can show "Shared with me" vs "Mine"
    const tagged = diagrams.map((d) => ({
      _id:            d._id,
      name:           d.name,
      description:    d.description,
      componentCount: d.componentCount,
      estimatedCost:  d.estimatedCost,
      createdAt:      d.createdAt,
      updatedAt:      d.updatedAt,
      isOwner:        d.user._id.toString() === uid.toString(),
      ownerName:      `${d.user.firstName} ${d.user.lastName}`,
      collaboratorCount: d.collaborators.length,
    }));

    res.status(200).json({ success: true, count: tagged.length, diagrams: tagged });
  } catch (err) {
    console.error("getDiagrams error:", err);
    res.status(500).json({ success: false, message: "Could not fetch diagrams." });
  }
};

// ── GET /api/diagrams/:id — get single diagram (owner OR collaborator) ────────
export const getDiagram = async (req, res) => {
  try {
    const uid = req.user._id;
    const diagram = await Diagram.findOne({
      _id: req.params.id,
      $or: [
        { user: uid },
        { "collaborators.user": uid },
      ],
    });

    if (!diagram) {
      return res.status(404).json({ success: false, message: "Diagram not found or access denied." });
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

// ── PUT /api/diagrams/:id — update (owner OR collaborator with edit permission)
export const updateDiagram = async (req, res) => {
  try {
    const uid = req.user._id;
    const { name, description, nodes, edges, pencilLines } = req.body;

    const diagram = await Diagram.findOne({
      _id: req.params.id,
      $or: [
        { user: uid },
        { "collaborators": { $elemMatch: { user: uid, permission: "edit" } } },
      ],
    });

    if (!diagram) {
      return res.status(404).json({ success: false, message: "Diagram not found or you don't have edit permission." });
    }

    if (name        !== undefined) diagram.name        = name;
    if (description !== undefined) diagram.description = description;
    if (nodes       !== undefined) diagram.nodes       = nodes;
    if (edges       !== undefined) diagram.edges       = edges;
    if (pencilLines !== undefined) diagram.pencilLines = pencilLines;

    await diagram.save();
    res.status(200).json({ success: true, diagram });
  } catch (err) {
    console.error("updateDiagram error:", err);
    res.status(500).json({ success: false, message: "Could not update diagram." });
  }
};

// ── DELETE /api/diagrams/:id — only owner can delete ─────────────────────────
export const deleteDiagram = async (req, res) => {
  try {
    const diagram = await Diagram.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!diagram) {
      return res.status(404).json({ success: false, message: "Diagram not found or only the owner can delete." });
    }
    res.status(200).json({ success: true, message: "Diagram deleted." });
  } catch (err) {
    console.error("deleteDiagram error:", err);
    res.status(500).json({ success: false, message: "Could not delete diagram." });
  }
};