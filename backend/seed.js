import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./models/Student.js";
import Instructor from "./models/Instructor.js";
import ClassType from "./models/ClassType.js";

dotenv.config();

// Sample seed data
const studentsData = [
  { studentId: "S001", name: "Alice Johnson" },
  { studentId: "S002", name: "Bob Smith" },
  { studentId: "S003", name: "Charlie Brown" },
  { studentId: "S004", name: "Diana Prince" },
  { studentId: "S005", name: "Ethan Hunt" },
];

const instructorsData = [
  { instructorId: "I001", name: "Prof. Sarah Williams" },
  { instructorId: "I002", name: "Prof. Michael Chen" },
  { instructorId: "I003", name: "Prof. Emily Rodriguez" },
  { instructorId: "I004", name: "Prof. David Kim" },
];

const classTypesData = [
  { classTypeId: "C001", name: "Mathematics" },
  { classTypeId: "C002", name: "Science" },
  { classTypeId: "C003", name: "English" },
  { classTypeId: "C004", name: "History" },
  { classTypeId: "C005", name: "Art" },
];

const seedDatabase = async () => {
  try {
    // Check if any data already exists
    const studentCount = await Student.countDocuments();
    const instructorCount = await Instructor.countDocuments();
    const classTypeCount = await ClassType.countDocuments();

    if (studentCount === 0 && instructorCount === 0 && classTypeCount === 0) {
      console.log("🌱 Seeding database...");

      // Insert all seed data
      await Student.insertMany(studentsData);
      console.log(`✅ Seeded ${studentsData.length} students`);

      await Instructor.insertMany(instructorsData);
      console.log(`✅ Seeded ${instructorsData.length} instructors`);

      await ClassType.insertMany(classTypesData);
      console.log(`✅ Seeded ${classTypesData.length} class types`);

      console.log("✅ Database seeding complete!");
    } else {
      console.log("⚠️  Database already contains data, skipping seeding...");
    }
  } catch (err) {
    console.error("❌ Error seeding database:", err.message);
  }
};

export default seedDatabase;

