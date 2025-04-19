const express = require('express');
const { grades,finalGrade } = require('../models/grades')

const router = express.Router()

router.post('/add', async (req,res)=>{
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

router.post('/final', async(req,res)=>{
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

module.exports = router