const mongoose = require('mongoose');
const express = require('express');
const { AttendanceSession, Lecture } = require("../models/class");
const { Student } = require("../models/users")
const { grades } = require('../models/grades');

const router = express.Router();

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


module.exports=router