import mongoose from "mongoose";

const classTypeSchema = new mongoose.Schema({
  classTypeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export default mongoose.model("ClassType", classTypeSchema);

