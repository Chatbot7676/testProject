import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema({
  instructorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export default mongoose.model("Instructor", instructorSchema);

