const express = require('express');
const {Lecture,AttendanceSession} = require('../models/class');
const { mongoose } = require('mongoose');
const router = express.Router()

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

router.post('/generate', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        const start = new Date(startDate, format);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({ error: "Start date must be before end date" });
        }

        const allClasses = await Lecture.find();

        let count = 0;

        for (const classItem of allClasses) {
            const sessionDates = getDatesForWeekday(start, end, classItem.day);

            for (const date of sessionDates) {
                const existing = await AttendanceSession.findOne({
                    classRef: classItem._id,
                    date: {
                        $gte: new Date(date.setHours(0, 0, 0, 0)),
                        $lt: new Date(date.setHours(23, 59, 59, 999))
                    }
                });

                if (!existing) {
                    const newSession = new AttendanceSession({
                        classRef: classItem._id,
                        date: new Date(date),
                        presentStudents: [],
                        absentStudents: []
                    });

                    await newSession.save();
                    count++;
                }
            }
        }

        res.status(201).json({ message: `Generated ${count} attendance sessions for semester.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate attendance sessions' });
    }
});

router.post("/add", async(req,res)=>{
    try{
        const { subject, subjectCode, faculty, division, day, time,batch,semester} = req.body
        const cls = new Lecture({
            subject,
            subjectCode,
            faculty : new mongoose.Types.ObjectId(faculty),
            division,
            day,
            time,
            batch,
            semester
        })

        await cls.save();

        res.status(201).json({message : "Lecture Added Successfully!"})
    } catch(err){
        res.status(500).json({error : err.message})
    }
})

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

module.exports = router