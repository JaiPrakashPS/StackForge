import Diagram from "../models/Diagram.js";
import User   from "../models/User.js";

// ── POST /api/diagrams/:id/collaborators — invite a user by email ──
export const addCollaborator = async (req, res) => {
  try {
    const { email, permission = "edit" } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    // Only the diagram owner can invite
    const diagram = await Diagram.findOne({ _id: req.params.id, user: req.user._id });
    if (!diagram) return res.status(404).json({ success: false, message: "Diagram not found or you are not the owner." });

    // Cannot invite yourself
    if (req.user.email === email.toLowerCase()) {
      return res.status(400).json({ success: false, message: "You cannot invite yourself." });
    }

    // Find the user to invite
    const invitee = await User.findOne({ email: email.toLowerCase() });
    if (!invitee) return res.status(404).json({ success: false, message: `No account found for ${email}. They must sign up first.` });

    // Already a collaborator?
    const already = diagram.collaborators.find((c) => c.user.toString() === invitee._id.toString());
    if (already) {
      // Update permission if changed
      already.permission = permission;
      await diagram.save();
      return res.status(200).json({ success: true, message: "Permission updated.", collaborators: diagram.collaborators });
    }

    diagram.collaborators.push({ user: invitee._id, email: invitee.email, permission });
    await diagram.save();

    res.status(201).json({
      success: true,
      message: `${invitee.firstName} ${invitee.lastName} added as collaborator.`,
      collaborator: { user: invitee._id, email: invitee.email, firstName: invitee.firstName, lastName: invitee.lastName, permission },
      collaborators: diagram.collaborators,
    });
  } catch (err) {
    console.error("addCollaborator error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── DELETE /api/diagrams/:id/collaborators/:userId — remove a collaborator ──
export const removeCollaborator = async (req, res) => {
  try {
    const diagram = await Diagram.findOne({ _id: req.params.id, user: req.user._id });
    if (!diagram) return res.status(404).json({ success: false, message: "Diagram not found." });

    diagram.collaborators = diagram.collaborators.filter(
      (c) => c.user.toString() !== req.params.userId
    );
    await diagram.save();

    res.status(200).json({ success: true, message: "Collaborator removed.", collaborators: diagram.collaborators });
  } catch (err) {
    console.error("removeCollaborator error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── GET /api/diagrams/:id/collaborators — list collaborators ──
export const getCollaborators = async (req, res) => {
  try {
    // Allow owner OR any collaborator to view the list
    const diagram = await Diagram.findById(req.params.id).populate("collaborators.user", "firstName lastName email");
    if (!diagram) return res.status(404).json({ success: false, message: "Diagram not found." });

    const isOwner = diagram.user.toString() === req.user._id.toString();
    const isCollab = diagram.collaborators.some((c) => c.user._id?.toString() === req.user._id.toString());
    if (!isOwner && !isCollab) return res.status(403).json({ success: false, message: "Access denied." });

    res.status(200).json({ success: true, collaborators: diagram.collaborators });
  } catch (err) {
    console.error("getCollaborators error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};