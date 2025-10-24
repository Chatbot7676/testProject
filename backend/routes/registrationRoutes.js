import express from "express";
import { uploadCSV, seedData, addStudent, addInstructor, addClassType, getAllData } from "../controllers/registrationController.js";
import multer from "multer";

const router = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" }); // temp folder

// Test route to verify routes are working
router.get("/test", (req, res) => {
  res.send("Route working!");
});

// Seed database with sample data
router.post("/seed", seedData);

// Get all data (students, instructors, class types, schedules)
router.get("/all", getAllData);

// Add individual records
router.post("/students", addStudent);
router.post("/instructors", addInstructor);
router.post("/classtypes", addClassType);

// Route: POST /api/registrations/upload
router.post("/upload", upload.single("file"), uploadCSV);

export default router;

