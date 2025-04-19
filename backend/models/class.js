const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    subjectCode: {
        type: String,
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    batch : {
        type: Number,
        required: true  
    },
    credits : {
        type : Number,
        required : true
    },
    semester : {
        type : String,
        required : true
    },
    division: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true, // e.g., "10:00 AM"
    },
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    type : {
        type : String,
        required : true,
        enum : ['Lab','Theory']
    }
});

const attendanceSessionSchema = new mongoose.Schema({
    classRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    presentStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    absentStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
}, { timestamps: true });

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
const Lecture = mongoose.model('Class', classSchema);

module.exports = {AttendanceSession, Lecture}