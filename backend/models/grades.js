const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    classRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    examType: {
        type: String,
        required: true,
        enum: ['Internal', 'Mid-Semester', 'End-Semester']
    },
    marksObtained: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    remarks: {
        type: String
    }
}, { timestamps: true });

const finalGrades = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    classRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    marksObtained: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
}, { timestamps: true });

const grades = mongoose.model('Grade', gradeSchema);
const finalGrade = mongoose.model('FinalGrade',finalGrades)

module.exports = { grades, finalGrade }