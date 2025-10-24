import fs from "fs";
import csv from "csv-parser";
import Schedule from "../models/Schedule.js";
import Student from "../models/Student.js";
import Instructor from "../models/Instructor.js";
import ClassType from "../models/ClassType.js";

export const seedData = async (req, res) => {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Drop old collections to remove old indexes
    try {
      await Student.collection.drop();
      console.log("✅ Dropped students collection");
    } catch (err) {
      if (err.code === 26) {
        console.log("ℹ️  Students collection doesn't exist, creating new one");
      }
    }

    try {
      await Instructor.collection.drop();
      console.log("✅ Dropped instructors collection");
    } catch (err) {
      if (err.code === 26) {
        console.log("ℹ️  Instructors collection doesn't exist, creating new one");
      }
    }

    try {
      await ClassType.collection.drop();
      console.log("✅ Dropped classtypes collection");
    } catch (err) {
      if (err.code === 26) {
        console.log("ℹ️  ClassTypes collection doesn't exist, creating new one");
      }
    }

    try {
      await Schedule.collection.drop();
      console.log("✅ Dropped schedules collection");
    } catch (err) {
      if (err.code === 26) {
        console.log("ℹ️  Schedules collection doesn't exist, creating new one");
      }
    }

    const students = await Student.insertMany([
      { studentId: "123", name: "John Doe" },
      { studentId: "124", name: "Jane Smith" },
      { studentId: "125", name: "Bob Johnson" },
      { studentId: "S001", name: "Alice Williams" },
      { studentId: "S002", name: "Charlie Brown" },
    ]);
    console.log(`✅ Created ${students.length} students`);

    const instructors = await Instructor.insertMany([
      { instructorId: "111", name: "Professor Smith" },
      { instructorId: "101", name: "Dr. Johnson" },
      { instructorId: "102", name: "Ms. Davis" },
      { instructorId: "I001", name: "Mr. Anderson" },
      { instructorId: "I002", name: "Mrs. Wilson" },
    ]);
    console.log(`✅ Created ${instructors.length} instructors`);

    const classTypes = await ClassType.insertMany([
      { classTypeId: "1", name: "Yoga Basics" },
      { classTypeId: "2", name: "Advanced Pilates" },
      { classTypeId: "3", name: "Cardio Kickboxing" },
      { classTypeId: "C001", name: "Meditation" },
      { classTypeId: "C002", name: "Spin Class" },
    ]);
    console.log(`✅ Created ${classTypes.length} class types`);

    console.log("🎉 Database seeding completed successfully!");

    res.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        students: students.length,
        instructors: instructors.length,
        classTypes: classTypes.length,
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllData = async (req, res) => {
  try {
    const students = await Student.find();
    const instructors = await Instructor.find();
    const classTypes = await ClassType.find();
    const schedules = await Schedule.find();

    res.json({
      success: true,
      data: {
        students,
        instructors,
        classTypes,
        schedules,
      },
      counts: {
        students: students.length,
        instructors: instructors.length,
        classTypes: classTypes.length,
        schedules: schedules.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addStudent = async (req, res) => {
  try {
    const { studentId, name } = req.body;
    const student = await Student.create({ studentId, name });
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addInstructor = async (req, res) => {
  try {
    const { instructorId, name } = req.body;
    const instructor = await Instructor.create({ instructorId, name });
    res.status(201).json({ success: true, data: instructor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addClassType = async (req, res) => {
  try {
    const { classTypeId, name } = req.body;
    const classType = await ClassType.create({ classTypeId, name });
    res.status(201).json({ success: true, data: classType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const parseDateTime = (dateStr, timeStr) => {
  try {
    // Handle formats like "10/8/2024 13:00" or separate date and time
    if (dateStr.includes(' ') && !timeStr) {
      const [datePart, timePart] = dateStr.split(' ');
      dateStr = datePart;
      timeStr = timePart;
    }
    
    const date = new Date(dateStr);
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    return date;
  } catch (err) {
    return new Date();
  }
};

const calculateEndTime = (startDateTime, duration) => {
  const endTime = new Date(startDateTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  return endTime;
};

const timeSlotsOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const uploadCSV = async (req, res) => {
  console.log("🚀 CSV Upload Hit");
  console.log("📁 File received:", req.file);
  console.log("📋 Body:", req.body);
  
  try {
    if (!req.file) {
      console.log("❌ No file in request");
      return res.status(400).json({ message: "No CSV file uploaded" });
    }

    const results = [];
    const filePath = req.file.path;

    const firstLine = fs.readFileSync(filePath, 'utf-8').split('\n')[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    
    console.log(`📊 Detected delimiter: ${delimiter === '\t' ? 'TAB' : 'COMMA'}`);

    const CLASS_DURATION = parseInt(process.env.CLASS_DURATION) || 45;
    const MAX_STUDENT_CLASSES = parseInt(process.env.MAX_STUDENT_CLASSES) || 3;
    const MAX_INSTRUCTOR_CLASSES = parseInt(process.env.MAX_INSTRUCTOR_CLASSES) || 5;
    const MAX_CLASS_TYPE_CLASSES = parseInt(process.env.MAX_CLASS_TYPE_CLASSES) || 10;

    console.log(`⚙️  Configuration: Duration=${CLASS_DURATION}min, MaxStudent=${MAX_STUDENT_CLASSES}, MaxInstructor=${MAX_INSTRUCTOR_CLASSES}, MaxClassType=${MAX_CLASS_TYPE_CLASSES}`);

    fs.createReadStream(filePath)
      .pipe(csv({ separator: delimiter }))
      .on("data", (data) => {
        console.log("📄 Raw row data:", data);
        results.push(data);
      })
      .on("end", async () => {
        console.log(`✅ Parsed ${results.length} rows from CSV`);
        console.log("📋 All parsed rows:", results);
        
        const responses = [];

        for (const row of results) {
          const cleanValue = (val) => {
            if (!val) return "";
            const cleaned = String(val).trim();
            return cleaned.toLowerCase() === "null" ? "" : cleaned;
          };

          // Handle both header formats: "Action" or "action", "Registration ID" or "registrationId"
          const action = cleanValue(row["Action"] || row["action"]).toLowerCase();
          const registrationId = cleanValue(row["Registration ID"] || row["registrationId"]);
          const studentId = cleanValue(row["Student ID"] || row["studentId"]);
          const instructorId = cleanValue(row["Instructor ID"] || row["instructorId"]);
          const classTypeId = cleanValue(row["Class ID"] || row["classTypeId"] || row["classId"]);
          const startTimeStr = cleanValue(row["Class Start Time"] || row["startTime"]);
          const dateStr = cleanValue(row["date"] || row["Date"]) || startTimeStr;

          console.log(`\n🔍 Processing row - Action: "${action}", StudentID: "${studentId}", InstructorID: "${instructorId}"`);

          try {
            if (action === "new") {
              const classStartDateTime = parseDateTime(dateStr, startTimeStr);
              const classEndDateTime = calculateEndTime(classStartDateTime, CLASS_DURATION);
              
              console.log(`📅 Class time: ${classStartDateTime.toISOString()} to ${classEndDateTime.toISOString()}`);

              const instructorExists = await Instructor.findOne({ instructorId });
              if (!instructorExists) {
                console.log(`❌ Invalid instructor: ${instructorId}`);
                responses.push({
                  status: "error",
                  message: `Invalid instructorId: ${instructorId}`,
                });
                continue;
              }

              const classTypeExists = await ClassType.findOne({ classTypeId });
              if (!classTypeExists) {
                console.log(`❌ Invalid class type: ${classTypeId}`);
                responses.push({
                  status: "error",
                  message: `Invalid classTypeId: ${classTypeId}`,
                });
                continue;
              }

              let studentExists = await Student.findOne({ studentId });
              if (!studentExists) {
                console.log(`ℹ️  Student ${studentId} not found, creating new student`);
                studentExists = await Student.create({
                  studentId,
                  name: `Student ${studentId}` // Default name
                });
                console.log(`✅ Auto-created student: ${studentId}`);
              }

              const dayStart = getStartOfDay(classStartDateTime);
              const dayEnd = getEndOfDay(classStartDateTime);
              
              const instructorSchedules = await Schedule.find({
                instructorId,
                date: { $gte: dayStart, $lte: dayEnd },
                status: { $ne: "deleted" }
              });

              let hasError = false;
              for (const existingSchedule of instructorSchedules) {
                const existingStart = parseDateTime(existingSchedule.date.toISOString(), existingSchedule.startTime);
                const existingEnd = calculateEndTime(existingStart, existingSchedule.duration || CLASS_DURATION);
                
                if (timeSlotsOverlap(classStartDateTime, classEndDateTime, existingStart, existingEnd)) {
                  console.log(`❌ Instructor time conflict`);
                  responses.push({
                    status: "error",
                    message: `Instructor ${instructorId} already has a class scheduled at this time (${existingSchedule.startTime})`,
                  });
                  hasError = true;
                  break;
                }
              }

              if (hasError) {
                continue;
              }

              if (instructorSchedules.length >= MAX_INSTRUCTOR_CLASSES) {
                console.log(`❌ Instructor max classes exceeded`);
                responses.push({
                  status: "error",
                  message: `Instructor ${instructorId} has reached maximum ${MAX_INSTRUCTOR_CLASSES} classes per day`,
                });
                continue;
              }

              const studentSchedules = await Schedule.find({
                studentId,
                date: { $gte: dayStart, $lte: dayEnd },
                status: { $ne: "deleted" }
              });

              for (const existingSchedule of studentSchedules) {
                const existingStart = parseDateTime(existingSchedule.date.toISOString(), existingSchedule.startTime);
                const existingEnd = calculateEndTime(existingStart, existingSchedule.duration || CLASS_DURATION);
                
                if (timeSlotsOverlap(classStartDateTime, classEndDateTime, existingStart, existingEnd)) {
                  console.log(`❌ Student time conflict`);
                  responses.push({
                    status: "error",
                    message: `Student ${studentId} already has a class scheduled at this time (${existingSchedule.startTime})`,
                  });
                  hasError = true;
                  break;
                }
              }

              if (hasError) {
                continue;
              }

              if (studentSchedules.length >= MAX_STUDENT_CLASSES) {
                console.log(`❌ Student max classes exceeded`);
                responses.push({
                  status: "error",
                  message: `Student ${studentId} has reached maximum ${MAX_STUDENT_CLASSES} classes per day`,
                });
                continue;
              }

              const classTypeSchedules = await Schedule.find({
                classTypeId,
                date: { $gte: dayStart, $lte: dayEnd },
                status: { $ne: "deleted" }
              });

              if (classTypeSchedules.length >= MAX_CLASS_TYPE_CLASSES) {
                console.log(`❌ Class type max classes exceeded`);
                responses.push({
                  status: "error",
                  message: `Class type ${classTypeId} has reached maximum ${MAX_CLASS_TYPE_CLASSES} classes per day`,
                });
                continue;
              }

              const newSchedule = new Schedule({
                studentId,
                instructorId,
                classTypeId,
                date: classStartDateTime,
                startTime: startTimeStr,
                duration: CLASS_DURATION,
                registrationId: `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                status: "scheduled"
              });
              await newSchedule.save();

              console.log(`✅ Created new schedule: ${newSchedule.registrationId}`);
              responses.push({
                status: "success",
                message: "New schedule created",
                registrationId: newSchedule.registrationId,
              });
            }

            else if (action === "update") {
              const schedule = await Schedule.findOne({ registrationId });
              if (!schedule) {
                console.log(`❌ Schedule not found for update: ${registrationId}`);
                responses.push({ status: "error", message: `No schedule found with ID ${registrationId}` });
                continue;
              }

              let hasConflict = false;
              if (startTimeStr || dateStr) {
                const newDateTime = parseDateTime(dateStr || schedule.date.toISOString(), startTimeStr || schedule.startTime);
                const newEndTime = calculateEndTime(newDateTime, schedule.duration || CLASS_DURATION);
                
                const dayStart = getStartOfDay(newDateTime);
                const dayEnd = getEndOfDay(newDateTime);

                const checkInstructorId = instructorId || schedule.instructorId;
                const instructorSchedules = await Schedule.find({
                  instructorId: checkInstructorId,
                  date: { $gte: dayStart, $lte: dayEnd },
                  registrationId: { $ne: registrationId },
                  status: { $ne: "deleted" }
                });

                for (const existingSchedule of instructorSchedules) {
                  const existingStart = parseDateTime(existingSchedule.date.toISOString(), existingSchedule.startTime);
                  const existingEnd = calculateEndTime(existingStart, existingSchedule.duration || CLASS_DURATION);
                  
                  if (timeSlotsOverlap(newDateTime, newEndTime, existingStart, existingEnd)) {
                    responses.push({
                      status: "error",
                      message: `Instructor ${checkInstructorId} has a conflicting class at ${existingSchedule.startTime}`,
                    });
                    hasConflict = true;
                    break;
                  }
                }

                if (!hasConflict) {
                  const checkStudentId = studentId || schedule.studentId;
                  const studentSchedules = await Schedule.find({
                    studentId: checkStudentId,
                    date: { $gte: dayStart, $lte: dayEnd },
                    registrationId: { $ne: registrationId },
                    status: { $ne: "deleted" }
                  });

                  for (const existingSchedule of studentSchedules) {
                    const existingStart = parseDateTime(existingSchedule.date.toISOString(), existingSchedule.startTime);
                    const existingEnd = calculateEndTime(existingStart, existingSchedule.duration || CLASS_DURATION);
                    
                    if (timeSlotsOverlap(newDateTime, newEndTime, existingStart, existingEnd)) {
                      responses.push({
                        status: "error",
                        message: `Student ${checkStudentId} has a conflicting class at ${existingSchedule.startTime}`,
                      });
                      hasConflict = true;
                      break;
                    }
                  }
                }

                if (!hasConflict) {
                  schedule.date = newDateTime;
                  schedule.startTime = startTimeStr || schedule.startTime;
                }
              }

              if (hasConflict) {
                continue;
              }

              if (instructorId) {
                const instructorExists = await Instructor.findOne({ instructorId });
                if (!instructorExists) {
                  responses.push({
                    status: "error",
                    message: `Invalid instructorId: ${instructorId}`,
                  });
                  continue;
                }
                schedule.instructorId = instructorId;
              }

              if (classTypeId) {
                const classTypeExists = await ClassType.findOne({ classTypeId });
                if (!classTypeExists) {
                  responses.push({
                    status: "error",
                    message: `Invalid classTypeId: ${classTypeId}`,
                  });
                  continue;
                }
                schedule.classTypeId = classTypeId;
              }

              if (studentId) {
                schedule.studentId = studentId;
              }

              await schedule.save();

              console.log(`✅ Updated schedule: ${registrationId}`);
              responses.push({
                status: "success",
                message: `Schedule updated (${registrationId})`,
              });
            }

            else if (action === "delete") {
              const schedule = await Schedule.findOne({ registrationId });
              if (!schedule) {
                console.log(`❌ Schedule not found for deletion: ${registrationId}`);
                responses.push({ status: "error", message: `No schedule found with ID ${registrationId}` });
              } else {
                schedule.status = "deleted";
                await schedule.save();
                
                console.log(`✅ Deleted schedule: ${registrationId}`);
                responses.push({
                  status: "success",
                  message: `Schedule deleted (${registrationId})`,
                });
              }
            }

            else {
              console.log(`❌ Unknown action: "${action}"`);
              responses.push({
                status: "error",
                message: `Unknown or empty action '${action}'. Expected: new, update, or delete`,
              });
            }
          } catch (err) {
            console.error(`❌ Error processing row:`, err);
            responses.push({ status: "error", message: err.message });
          }
        }

        console.log(`\n📊 Processing complete. Total responses: ${responses.length}`);
        
        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.json({ 
          totalRows: results.length,
          results: responses,
          summary: {
            success: responses.filter(r => r.status === "success").length,
            errors: responses.filter(r => r.status === "error").length
          }
        });
      })
      .on("error", (error) => {
        console.error("❌ CSV parsing error:", error);
        fs.unlinkSync(filePath);
        res.status(500).json({ message: "Error parsing CSV file", error: error.message });
      });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

