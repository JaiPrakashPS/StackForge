import mongoose from "mongoose";

const collaboratorSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email:      { type: String, required: true },
  permission: { type: String, enum: ["edit", "view"], default: "edit" },
  addedAt:    { type: Date, default: Date.now },
});

const diagramSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name:        { type: String, required: true, trim: true, maxlength: 100, default: "Untitled Architecture" },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    thumbnail:   { type: String, default: "" },
    nodes:       { type: Array, default: [] },
    edges:       { type: Array, default: [] },
    pencilLines: { type: Array, default: [] },
    componentCount: { type: Number, default: 0 },
    estimatedCost:  { type: Number, default: 0 },
    collaborators:  { type: [collaboratorSchema], default: [] },
  },
  { timestamps: true }
);

diagramSchema.pre("save", function (next) {
  const cloudNodes = this.nodes.filter((n) => n.type === "cloud");
  this.componentCount = cloudNodes.length;
  this.estimatedCost  = cloudNodes.reduce((sum, n) => sum + (n.data?.cost || 0), 0);
  next();
});

export default mongoose.model("Diagram", diagramSchema);