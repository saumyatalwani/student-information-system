import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

export default function GradeUpload() {
  const { id } = useParams();
  const [course, setCourse] = useState();
  const [csvData, setCsvData] = useState([]);
  const [students, setStudents] = useState([]);
  const [examType, setExamType] = useState("Mid-Semester"); // default value
  const [totalMarks, setTotalMarks] = useState(100); // you can make this dynamic too

  useEffect(() => {
    const fetchData = async () => {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(`${BACKEND_URL}/facultyView/course?id=${id}`);
      setCourse(response.data.course);
      setStudents(response.data.students);
    };
    fetchData();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        const parsedData = parseCSV(text);
        setCsvData(parsedData);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split("\n").filter(Boolean);
    const [headerLine, ...dataLines] = lines; // skip first line (headers)
    const result = dataLines.map((line) => {
      const [rollNo, marks] = line.split(",");
      return { rollNo: rollNo.trim(), marks: marks.trim() };
    });
  
    return result;
  };

  const getStudentNameByRollNo = (rollNo) => {
    const student = students.find((student) => student.rollNo === rollNo);
    return student ? `${student.firstName} ${student.lastName}` : "Unknown";
  };

  const handleSubmit = async () => {
    const grades = csvData.map((data) => {
      const student = students.find((s) => s.rollNo === data.rollNo);
      return {
        student: student?._id || data.rollNo, // fallback to rollNo if _id not found
        classRef: course._id,
        examType: examType,
        marksObtained: Number(data.marks),
        totalMarks: Number(totalMarks),
        remarks: "",
      };
    });

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/grades/add`, {
        grades,
      });
      console.log("Grades uploaded successfully", response);
    } catch (err) {
      console.error("Error uploading grades", err);
    }
  };

  const downloadCSVTemplate = () => {
    const headers = ["rollNo", "marks"];
    const csvContent = [headers.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "grades_template.csv";
    link.click();
  };

  return (
    <div className="pl-10">
      <Link to={"/faculty"}>Back</Link>
      <h1 className="text-3xl font-bold">
        Grade Upload for {course?.subject} for {course?.batch} Batch - Division {course?.division}
      </h1>

      {/* Dropdown for Exam Type */}
      <div className="my-4">
        <label className="font-semibold mr-2">Exam Type:</label>
        <select
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="Internal">Internal</option>
          <option value="Mid-Semester">Mid-Semester</option>
          <option value="End-Semester">End-Semester</option>
        </select>
      </div>

      {/* Input for total marks */}
      <div className="my-2">
        <label className="font-semibold mr-2">Total Marks:</label>
        <input
          type="number"
          value={totalMarks}
          onChange={(e) => setTotalMarks(e.target.value)}
          className="border px-2 py-1 rounded w-24"
        />
      </div>

      {/* Button to download CSV template */}
      <button
        className="bg-indigo-600 text-white px-6 py-2 rounded mt-4 hover:bg-indigo-700"
        onClick={downloadCSVTemplate}
      >
        Download Template CSV
      </button>

      {/* File upload input */}
      <input type="file" accept=".csv" onChange={handleFileUpload} className="my-4 block" />

      {/* Preview parsed data */}
      {csvData.length > 0 && (
        <div className="my-4">
          <h2 className="text-xl font-semibold mb-2">Parsed Data Preview</h2>
          <table className="border border-gray-400 w-[80vw] text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Roll No</th>
                <th className="border px-4 py-2">Student Name</th>
                <th className="border px-4 py-2">Marks</th>
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{row.rollNo}</td>
                  <td className="border px-4 py-2">{getStudentNameByRollNo(row.rollNo)}</td>
                  <td className="border px-4 py-2">{row.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload button */}
      <button
        className="bg-indigo-600 text-white px-6 py-2 rounded mt-4 hover:bg-indigo-700"
        onClick={handleSubmit}
      >
        Upload Grades
      </button>
    </div>
  );
}
