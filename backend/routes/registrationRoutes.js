import express from "express";
import { uploadCSV, seedData, addStudent, addInstructor, addClassType, getAllData } from "../controllers/registrationController.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/test", (req, res) => {
  res.send("Route working!");
});

router.post("/seed", seedData);
router.get("/all", getAllData);

router.post("/students", addStudent);
router.post("/instructors", addInstructor);
router.post("/classtypes", addClassType);

router.post("/upload", upload.single("file"), uploadCSV);

export default router;

