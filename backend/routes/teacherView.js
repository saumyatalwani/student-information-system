const mongoose = require('mongoose');
const express = require('express');
const { AttendanceSession, Lecture } = require("../models/class");
const { Student } = require("../models/users")
const { grades } = require('../models/grades');

const router = express.Router();
const { authorizeRoles } = require('../middleware/verify');

router.use(authorizeRoles('faculty'))

function mapClassData(classes) {
    // Helper function to convert 12-hour time to 24-hour time
    const convertTo24Hour = (time) => {
      const [hours, minutes] = time.split(":");
      const [period] = time.split(" ").slice(-1);
      let hour = parseInt(hours);
      
      if (period === "PM" && hour < 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
  
      return hour;
    };
  
    // Helper function to format date to 'YYYY-MM-DD'
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = (`0${date.getMonth() + 1}`).slice(-2);
      const day = (`0${date.getDate()}`).slice(-2);
      return `${year}-${month}-${day}`;
    };
  
    return classes.map(item => {
      const classData = item.classData;
  
      // Calculate the start and end time based on the class type
      const startHour = convertTo24Hour(classData.time[0]);
      const endHour = classData.type === "Theory" ? startHour + 1 : startHour + 2;
  
      return {
        subject: classData.subject,
        location: classData.type,
        day: classData.day[0], // Assuming taking the first day of the week from the array
        id: item._id.toString(), // Use _id as the id field
        start: startHour,
        end: endHour,
        date: formatDate(item.date), // Map the date to 'YYYY-MM-DD'
      };
    });
  }  


router.get("/schedule",async(req,res)=>{
    const {sem,id}=req.query;

    const classes = await AttendanceSession.aggregate([
        {
            $lookup: {
                from: "classes",  // Lookup the "classes" collection
                localField: "classRef",  // The field in the AttendanceSession
                foreignField: "_id",  // The field in the "classes" collection
                as: "classData"  // Put the result in "classData"
            }
        },
        { $unwind: "$classData" },
         { $match: { 
                "classData.faculty": new mongoose.Types.ObjectId(id),
                "classData.semester": sem
        }},
        { $sort: { "date": 1 } }
    ])

    const data = mapClassData(classes)
    console.log(classes)

    res.status(200).json(data);
})

router.get("/class", async (req, res) => {
  try {
    const { id } = req.query;

    const sessions = await AttendanceSession.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "classRef",
          foreignField: "_id",
          as: "classData"
        }
      },
      { $unwind: "$classData" }
    ]);

    if (sessions.length === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    const classInfo = sessions[0].classData;

    const students = await Student.find({
      division: classInfo.division
    });

    return res.json({ sessions, students });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.get('/courses', async (req,res)=>{
  try{
    const {id,sem}=req.query;
    const lecs = await Lecture.find({
      faculty : id,
      semester: sem
    })

    res.status(200).json(lecs)
  } catch(err){
    res.status(500).json({error : err.message})
  }
})

router.get('/course', async (req, res) => {
  try {
    const { id } = req.query;

    const lecs = await Lecture.findById(id); // pass id directly
    const students = await Student.find({
      division : lecs.division
    })

    if (!lecs) {
      return res.status(404).json({ error: "Lecture not found" });
    }

    res.status(200).json({course: lecs, students : students});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/grades', async (req, res) => {
  try {
    const { id } = req.query;
    const classObjectId = new mongoose.Types.ObjectId(id);

    const gradeList = await grades.aggregate([
      {
        $match: {
          classRef: classObjectId
        }
      },
      {
        $lookup: {
          from: "users",           // collection name to join with
          localField: "student",      // field in the grades collection
          foreignField: "_id",        // field in the students collection
          as: "studentInfo"           // output array field
        }
      },
      {
        $unwind: "$studentInfo"       // optional: flatten the studentInfo array
      }
    ]);
    
    if (!gradeList) {
      return res.status(404).json({ error: "Lecture not found" });
    }

    res.status(200).json(gradeList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/addAttendance", async (req,res)=> {
  try {
      const { attendanceSessionId, presentStudents, absentStudents } = req.body;

      if (!attendanceSessionId || !Array.isArray(presentStudents) || !Array.isArray(absentStudents)) {
          return res.status(400).json({ error: "Missing or invalid fields in request body" });
      }

      const session = await AttendanceSession.findById(attendanceSessionId);

      if (!session) {
          return res.status(404).json({ error: "Attendance session not found" });
      }

      session.presentStudents = presentStudents;
      session.absentStudents = absentStudents;

      await session.save();

      res.status(200).json({ message: "Attendance updated successfully", session });
  } catch (err) {
      console.error("Error in /addAttendance:", err);
      res.status(500).json({ error: "Failed to update attendance" });
  }
})

router.post('/grades/add', async (req,res)=>{
  try{
      const grds = req.body.grades; 
      
      if (!Array.isArray(grds) || grds.length === 0) {
          return res.status(400).json({ message: 'No grades provided or invalid format' });
      }

      for (let grade of grds) {
          if (!grade.student || !grade.classRef || !grade.examType || !grade.marksObtained || !grade.totalMarks) {
            return res.status(400).json({ message: 'Each grade must include student, classRef, examType, marksObtained, and totalMarks' });
          }

          if (!['Internal', 'Mid-Semester', 'End-Semester'].includes(grade.examType)) {
              return res.status(400).json({ message: `Invalid examType: ${grade.examType}. Must be one of 'Internal', 'Mid-Semester', 'End-Semester'` });
          }
      }

      const result = await grades.insertMany(grds);

      return res.status(201).json({ message: 'Grades added successfully', data: result });
  } catch(err){
      console.error('Error adding grades:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
  }
})

module.exports=router