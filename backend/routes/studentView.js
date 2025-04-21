const mongoose = require('mongoose');
const express = require('express');
const { AttendanceSession,Lecture } = require("../models/class");
const { finalGrade } = require("../models/grades")

const router = express.Router();
const { authorizeRoles } = require('../middleware/verify');

router.use(authorizeRoles('student'))

router.get('/attendance', async (req, res) => {
    try {
        const { id, div } = req.query; // Use req.query for GET parameters

        // Aggregate to find attendance data and subject name
        const classes = await AttendanceSession.aggregate([
            {
                $match: {
                    $expr: { $ne: ["$createdAt", "$updatedAt"] }
                }
            },
            {
                $lookup: {
                    from: "classes",  // Lookup the "classes" collection
                    localField: "classRef",  // The field in the AttendanceSession
                    foreignField: "_id",  // The field in the "classes" collection
                    as: "classData"  // Put the result in "classData"
                }
            },
            { $unwind: "$classData" },  // Unwind the classData array
            { $match: { "classData.division": div.toString() } },
            {
                $group: {
                    _id: "$classRef",  // Group by classRef (subject)
                    subjectName: { $first: "$classData.subject" },  // Get the subject name
                    totalClasses: { $sum: 1 },  // Count total classes for each classRef
                    attendedStudents: {
                        $push: "$presentStudents"  // Collect all present students for each classRef
                    }
                }
            }
        ]);

        // Calculate attendance percentage for each subject and total attendance
        let totalClassesCount = 0;
        let attendedClassesCount = 0;

        console.log(classes)
        
        const result = classes.map(cls => {
            const attendedClasses = cls.attendedStudents.filter(students =>
                students.some(studentId => studentId.equals(id))
            );
            const attendedClsCount = attendedClasses.length;
            const attendancePercentage = (attendedClsCount / cls.totalClasses) * 100;

            // Increment total attendance counts for global statistics
            totalClassesCount += cls.totalClasses;
            attendedClassesCount += attendedClsCount;

            return {
                subject: cls._id,
                subjectName: cls.subjectName,
                totalClasses: cls.totalClasses,
                attendedClasses: attendedClsCount,
                attendancePercentage
            };
        });

        // Calculate global total attendance percentage
        const totalAttendancePercentage = (attendedClassesCount / totalClassesCount) * 100;

        // Combine subject-wise result and global result
        const payload = {
            totalClasses: totalClassesCount,
            attendedClasses: attendedClassesCount,
            totalAttendancePercentage: totalAttendancePercentage,
            subjects: result
        };

        // Return the result with both total and grouped attendance
        res.status(200).json(payload);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/attendance/subject', async (req, res) => {
    try {
        const { id, subjectRef, div } = req.query; // Use query parameters for ID, subjectRef, and division

        // Aggregate to find attendance data for the individual subject
        const classes = await AttendanceSession.aggregate([
            {
                $match: {
                    $expr: { $ne: ["$createdAt", "$updatedAt"] }
                }
            },
            {
                $lookup: {
                    from: "classes",  // Lookup the "classes" collection
                    localField: "classRef",  // The field in the AttendanceSession
                    foreignField: "_id",  // The field in the "classes" collection
                    as: "classData"  // Put the result in "classData"
                }
            },
            { $unwind: "$classData" },  // Unwind the classData array
            { $match: { 
                "classData.division": div.toString(),
                "classData._id": new mongoose.Types.ObjectId(subjectRef)  // Correctly use ObjectId
            }},
            { $sort: { "date": 1 } },  // Sort classes chronologically by the date in AttendanceSession
            {
                $group: {
                    _id: "$classRef",  // Group by classRef (subject)
                    totalClasses: { $sum: 1 },  // Count total classes for this subject
                    subjectName: { $first: "$classData.subject" },
                    classes: { $push: { 
                        date: "$date",  // Use the date from AttendanceSession
                        attended: { 
                            $in: [new mongoose.Types.ObjectId(id), "$presentStudents"]  // Check if student is present
                        }
                    }}  // List of classes attended/not attended by the student
                }
            }
        ]);

        console.log(classes);
        // Calculate the attendance percentage for the individual subject
        let totalClassesCount = 0;
        let attendedClassesCount = 0;

        const attendanceDetails = [];

        // Extract attendance details from the classes
        classes.forEach(cls => {
            cls.classes.forEach(c => {
                attendanceDetails.push({
                    date: c.date,  // Ensure the date from AttendanceSession is included
                    attended: c.attended
                });
            });

            // Calculate total and attended classes
            attendedClassesCount += attendanceDetails.filter(c => c.attended).length;
            totalClassesCount += cls.totalClasses;
        });

        const attendancePercentage = (attendedClassesCount / totalClassesCount) * 100;
        // Return the result with the structure you need
        const payload = {
            totalClasses: totalClassesCount,
            attendedClasses: attendedClassesCount,
            totalAttendancePercentage: attendancePercentage,
            subject: classes[0]?.subjectName ?? "Unknown Subject",
            attendanceDetails // Include only the date and attendance status
        };

        res.status(200).json(payload);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function calculateGrades(grades){

    var calc = []

    var totalCredits = 0
    var creditsObtained = 0

    console.log(grades);

    for ( const grade of grades ){
        var course = { 
            "totalMarks": grade.totalMarks, 
            "marksObtained" : grade.marksObtained,
            "subjectCode" : grade.classData.subjectCode,
            "subjectName": grade.classData.subject
        }
        const marksObtained = grade.marksObtained
        var gradePoint = 10
        var letter = "O"
        if (marksObtained>=80){
            gradePoint = 10
            letter="O"
        } else if(marksObtained>=70 && marksObtained<=80) {
            gradePoint = 9
            letter="A+"
        }else if(marksObtained>=60 && marksObtained<=70) {
            gradePoint = 8
            letter="A"
        }else if(marksObtained>=55 && marksObtained<=60) {
            gradePoint = 7
            letter="B+"
        }else if(marksObtained>=50 && marksObtained<=55) {
            gradePoint = 6
            letter="B"
        }else if(marksObtained>=45 && marksObtained<=40) {
            gradePoint = 5
            letter="C"
        }else if(marksObtained>=40 && marksObtained<=45) {
            gradePoint = 4
            letter="P"
        }else{
            gradePoint=null
            letter="F"
        }

        course['gradePoint']=gradePoint,
        course['grade']=letter
        totalCredits+=grade.classData.credits
        creditsObtained+=gradePoint*grade.classData.credits
        calc.push(course)
    }

    payload = {
        "creditsObtained" : creditsObtained,
        "totalCredits" : totalCredits,
        "SPI" : creditsObtained/totalCredits,
        grades: calc
    }

    return payload
}

router.get('/grades', async (req,res) => {
    try{
        const {id, sem}=req.query;
        const grades = await finalGrade.aggregate([
            {
                $match : {
                    student : new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup : {
                    from : 'classes',
                    localField : 'classRef',
                    foreignField : '_id',
                    as : 'classData'
                }
            },
            { $unwind: '$classData' },
            {
                $match: {
                  'classData.semester': sem
                }
              },
            {
                $project: {
                  marksObtained: 1,
                  totalMarks: 1,
                  student: 1,
                  classRef: 1,
                  classData: 1
                }
              }
        ])

        console.log(grades);

        const calculated = calculateGrades(grades);
        res.status(200).json(calculated);
    } catch (err){
        res.status(500).json({message : err.message})
    }
})
function mapLecturesToCalendarFormat(lectures) {
    return lectures.flatMap((lecture) => {
      return lecture.day.map((day, idx) => {
        const timeStr = lecture.time[idx];
        const hour = convertTo24Hour(timeStr);
        const duration = lecture.type === "Theory" ? 1 : 2;
  
        return {
          subject: lecture.subject,
          day: day,
          start: hour,
          end: hour + duration,
          location: lecture.type,
        };
      });
    });
  }
  
  // Helper to convert "10:00 AM" => 10, "2:00 PM" => 14
  function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
  
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  
    return hours;
  }
  

router.get('/schedule', async (req, res) => {
    try {
      const { div, semester } = req.query;
  
      if (!div || !semester) {
        return res.status(400).json({ error: "Missing division or semester in query." });
      }
  
      const classes = await Lecture.find({
        division: div.toString(),
        semester: semester,
      });
      
  
      const data = mapLecturesToCalendarFormat(classes);
      res.status(200).json(data);
    } catch (err) {
      console.error("Error fetching schedule:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  

module.exports = router;