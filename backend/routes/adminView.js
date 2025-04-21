const mongoose = require('mongoose');
const express = require('express');
const {Faculty,Student} = require('../models/users')
const {Lecture,AttendanceSession} = require('../models/class')
const { authorizeRoles } = require('../middleware/verify');
const moment = require('moment-timezone');
const bcrypt = require('bcrypt')

const router = express.Router();

router.use(authorizeRoles('user'));

router.get('/faculties',async(req,res)=>{
    try{
        const facs = await Faculty.find();

        res.status(200).json(facs);
    } catch(err){
        res.status(500).json({error : err.message})
    }
})

router.get('/courses',async(req,res)=>{
    try{
        const facs = await Lecture.find();
        console.log(facs);

        res.status(200).json(facs);
    } catch(err){
        res.status(500).json({error : err.message})
    }
})

router.post("/addClass", async (req, res) => {
    try {
        let { subject, subjectCode, faculty, division, day, time, batch, semester, type, credits } = req.body;

        // Split comma-separated day/time into arrays and trim whitespace
        const daysArray = day.split(',').map(d => d.trim());
        const timesArray = time.split(',').map(t => t.trim());

        if (daysArray.length !== timesArray.length) {
            return res.status(400).json({ error: "Number of days and times must match." });
        }

        const cls = new Lecture({
            subject,
            subjectCode,
            faculty: new mongoose.Types.ObjectId(faculty),
            division,
            day: daysArray,
            time: timesArray,
            batch,
            semester,
            type,
            credits
        });

        await cls.save();

        res.status(201).json({ message: "Lecture Added Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/register/faculty',async (req,res) => {
    try{
        const {email, password, firstName, lastName, prefix}=req.body
        const hashPassword = await bcrypt.hash(password,10);
        const faculty = new Faculty({
            email : email,
            password: hashPassword,
            ...(prefix && { prefix }),
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        })
        await faculty.save();
        res.status(201).json({message: "Faculty Created Successfully!"})
    } catch (err){
        console.log(err); //remove this at the end
        if(err.code == 11000){
            res.status(400).json({ error : 'Mail Already Exists'})
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
})


router.post('/register/student',async (req,res) => {
    try{
        const {email, password, rollNo, division, firstName, lastName}=req.body
        const hashPassword = await bcrypt.hash(password,10);
        const stud = new Student({
            email : email,
            password: hashPassword,
            rollNo : rollNo,
            division: division,
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        })
        await stud.save();
        res.status(201).json({message: "Student Created Successfully!"})
    } catch (err){
        console.log(err); //remove this at the end
        if(err.code == 11000){
            res.status(400).json({ error : 'Mail Already Exists'})
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
})

router.post('/register/students/bulk', async (req, res) => {
    try {
        const students = req.body; // expecting an array

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ error: 'Invalid input. Expected an array of students.' });
        }

        const hashedStudentsPromises = students.map(async ({ email, password, rollNo, division, firstName, lastName }) => {
            const hashPassword = await bcrypt.hash(password, 10);
            return {
                email,
                password: hashPassword,
                rollNo,
                division,
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
            };
        });

        const hashedStudents = await Promise.all(hashedStudentsPromises);

        const result = await Student.insertMany(hashedStudents, { ordered: false });

        res.status(201).json({
            message: `${result.length} students registered successfully.`,
            insertedCount: result.length
        });
    } catch (err) {
        console.log(err); // Remove in production

        if (err.code === 11000 || err.writeErrors) {
            const duplicates = err.writeErrors?.filter(e => e.code === 11000).length || 0;
            return res.status(400).json({
                error: `Some students could not be registered due to duplicate emails or roll numbers.`,
                duplicateCount: duplicates
            });
        }

        res.status(500).json({ error: 'Bulk student registration failed.' });
    }
});

const calculateFinalGrade = (grades, courseType) => {
    let totalMarks = 0;
    let marksObtained = 0;
  
    if (courseType === 'Theory') {
      // Theory course calculation
      const internalMarks = grades.internal * 25;
      const midSemesterMarks = grades.midSemester * 25; // Convert mid-semester marks to 25
      const endSemesterMarks = grades.endSemester * 50; // End-Semester marks are out of 100
  
      totalMarks = 25 + 25 + 50;
      marksObtained = internalMarks + midSemesterMarks + endSemesterMarks;
    } else if (courseType === 'Practical') {
      // Other courses calculation
      const internalMarks = grades.internal * 50; // Convert internal marks to 50
      const endSemesterMarks = grades.endSemester * 50; // Convert end-semester marks to 50
  
      totalMarks = 50 + 50;
      marksObtained = internalMarks + endSemesterMarks;
    }
  
    return { marksObtained, totalMarks };
};

router.post('/grades/final', async(req,res)=>{
        try {
          const { classRef, courseType } = req.body;
          const allGrades = await grades.find({ classRef });
      
          if (allGrades.length === 0) {
            return res.status(404).json({ message: 'No grades found for this class' });
          }

          const gradesByStudent = {};
          allGrades.forEach(grade => {
            const studentId = grade.student.toString();
            if (!gradesByStudent[studentId]) {
              gradesByStudent[studentId] = {};
            }
            gradesByStudent[studentId][grade.examType] = grade.marksObtained/grade.totalMarks;
          });
      
          const finalGradesToInsert = [];

          for (const studentId in gradesByStudent) {
            const exams = gradesByStudent[studentId];
      
            if (
              (courseType === 'Theory' && (!exams.Internal || !exams['Mid-Semester'] || !exams['End-Semester'])) ||
              (courseType === 'Practical' && (!exams.Internal || !exams['End-Semester']))
            ) {
              console.log(`Skipping student ${studentId} due to missing grades`);
              continue;
            }
            
            const { marksObtained, totalMarks } = calculateFinalGrade(
              {
                internal: exams.Internal,
                midSemester: exams['Mid-Semester'],
                endSemester: exams['End-Semester']
              },
              courseType
            );
      
            finalGradesToInsert.push({
              student: studentId,
              classRef,
              marksObtained,
              totalMarks
            });
          }


          await finalGrade.insertMany(finalGradesToInsert);
      
          res.status(201).json({
            message: 'Final grades calculated and saved successfully for the class',
            insertedCount: finalGradesToInsert.length
          });
} catch(err) {
    console.error('Error creating final grades:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
}})

function getDatesForWeekday(startDate, endDate, weekday) {
    const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(weekday);
    const dates = [];
    const current = new Date(startDate);

    while (current.getDay() !== dayIndex) {
        current.setDate(current.getDate() + 1);
    }

    while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 7);
    }

    return dates;
}

router.post('/sessions/generate', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({ error: "Start date must be before end date" });
        }

        const allClasses = await Lecture.find();
        let count = 0;

        // Loop through each class
        for (const classItem of allClasses) {
            const { day: days, time: times } = classItem;

            // Process each day and corresponding time in parallel
            for (let i = 0; i < days.length; i++) {
                const weekday = days[i];
                const sessionDates = getDatesForWeekday(start, end, weekday); // List of Dates (JS Date objects)

                const tasks = sessionDates.map(async (dateOnly) => {
                    const [hour, minute] = times[i].split(':').map(Number);

                    // Create a moment in IST timezone
                    const dateTimeIST = moment.tz(dateOnly, 'Asia/Kolkata')
                        .hour(hour)
                        .minute(minute)
                        .second(0)
                        .millisecond(0);

                    const existing = await AttendanceSession.findOne({
                        classRef: classItem._id,
                        date: {
                            $gte: dateTimeIST.clone().startOf('day').toDate(),
                            $lt: dateTimeIST.clone().endOf('day').toDate()
                        },
                        time: times[i]
                    });

                    // If no existing session, create a new one
                    if (!existing) {
                        const newSession = new AttendanceSession({
                            classRef: classItem._id,
                            date: dateTimeIST.toDate(), // Full IST datetime
                            time: times[i],
                            presentStudents: [],
                            absentStudents: []
                        });

                        await newSession.save();
                        return 1; // Session created
                    }

                    return 0; // No session created (already exists)
                });

                // Execute all session creation tasks for the current day
                const results = await Promise.all(tasks);
                count += results.reduce((acc, val) => acc + val, 0); // Count the number of sessions created
            }
        }

        // Return a success response with the count of created sessions
        res.status(201).json({ message: `Generated ${count} attendance sessions for semester.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate attendance sessions' });
    }
});

module.exports=router