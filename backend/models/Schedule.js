import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  registrationId: { type: String, unique: true },
  studentId: { type: String, required: true },
  instructorId: { type: String, required: true },
  classTypeId: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g., "14:30"
  duration: { type: Number, default: process.env.CLASS_DURATION || 45 },
  status: { type: String, default: "scheduled" },
});

export default mongoose.model("Schedule", scheduleSchema);

