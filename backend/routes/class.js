const express = require('express');
const {Lecture,AttendanceSession} = require('../models/class');
const { mongoose } = require('mongoose');
const router = express.Router()
const moment = require('moment-timezone');

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

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({ error: "Start date must be before end date" });
        }

        const allClasses = await Lecture.find();
        let count = 0;

        for (const classItem of allClasses) {
            const { day: days, time: times } = classItem;

            for (let i = 0; i < days.length; i++) {
                const weekday = days[i];
                const sessionDates = getDatesForWeekday(start, end, weekday); // List of Dates (JS Date objects)

                for (const dateOnly of sessionDates) {
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

                    if (!existing) {
                        const newSession = new AttendanceSession({
                            classRef: classItem._id,
                            date: dateTimeIST.toDate(), // Full IST datetime
                            time: times[i],
                            presentStudents: [],
                            absentStudents: []
                        });

                        await newSession.save();
                        count++;
                    }
                }
            }
        }

        res.status(201).json({ message: `Generated ${count} attendance sessions for semester.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate attendance sessions' });
    }
});

router.post("/add", async (req, res) => {
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