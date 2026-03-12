import mongoose from "mongoose";

const diagramSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Diagram name is required"],
      trim: true,
      maxlength: 100,
      default: "Untitled Architecture",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    thumbnail: {
      type: String, // base64 or URL — optional
      default: "",
    },
    // Full ReactFlow state
    nodes: {
      type: Array,
      default: [],
    },
    edges: {
      type: Array,
      default: [],
    },
    // Freehand pencil strokes
    pencilLines: {
      type: Array,
      default: [],
    },
    // Computed stats stored at save time
    componentCount: {
      type: Number,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-compute stats before saving
diagramSchema.pre("save", function (next) {
  const cloudNodes = this.nodes.filter((n) => n.type === "cloud");
  this.componentCount = cloudNodes.length;
  this.estimatedCost  = cloudNodes.reduce((sum, n) => sum + (n.data?.cost || 0), 0);
  next();
});

export default mongoose.model("Diagram", diagramSchema);