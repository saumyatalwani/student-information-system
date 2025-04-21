import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getUserFromToken } from "../../utils/auth";

export default function Grades() {
  const user = getUserFromToken();
  const startYear = 2000 + parseInt(user.rollNo.substring(0, 2)); // e.g., 2022
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed (0 = Jan)
  const [semesters, setSemesters] = useState([]);
  const [sem, setSem] = useState("");

  const [gradesData, setGradesData] = useState({
    SPI: 0,
    creditsObtained: 0,
    totalCredits: 0,
    grades: []
  });

  // This useEffect now runs only once after the initial mount
  useEffect(() => {
    const semList = [];
    let year = startYear;
    let type = "Odd";

    while (year < currentYear || (year === currentYear && (type === "Odd" || currentMonth <= 6))) {
      semList.push(`${type}-${year}`);
      if (type === "Odd") {
        type = "Even";
      } else {
        type = "Odd";
        year += 1;
      }
    }

    // Check if semesters are already set to avoid unnecessary state update
    if (semesters.length === 0) {
      setSemesters(semList);
      setSem(semList[semList.length - 1]); // Set the latest semester as default
      console.log("Available Semesters:", semList); // Debugging log
    }
  }, []); // Empty dependency array ensures this runs only on mount

  // Fetch grades when `sem` changes
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const config = {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
          }
        };
        
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        const url = `${BACKEND_URL}/studentView/grades?id=${user._id}&sem=${sem}`;
        const res = await axios.get(url,config);
        setGradesData(res.data);
      } catch (err) {
        console.error("Failed to fetch grades:", err);
      }
    };

    if (sem) fetchGrades();
  }, [sem]);

  const handleSemesterChange = (e) => {
    const selectedSem = e.target.value;
    setSem(selectedSem);
    console.log("Selected Semester:", selectedSem); // Debugging log
  };

  return (
    <div className="pl-10">
      <Link to={"/student"}>Back</Link>
      <h1 className="text-4xl font-bold">Grades</h1>

      {/* 🔽 Semester Dropdown */}
      <div className="mt-4">
        <label htmlFor="semSelect" className="font-semibold mr-2">Select Semester:</label>
        <select
          id="semSelect"
          value={sem}
          onChange={handleSemesterChange} // Updated function name
          className="border p-2 rounded"
        >
          {semesters.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center items-center flex-col mt-6">
        <h1>SPI :</h1>
        <h1 className="text-9xl">{gradesData.SPI}</h1>
        <h1>{gradesData.creditsObtained} / {gradesData.totalCredits * 10} Credits</h1>
      </div>

      <h1 className="mt-10 text-xl font-semibold">Courses</h1>
      <div className="flex items-center justify-center mt-10 flex-wrap">
        {gradesData.grades.map((grade) => (
          <div
            key={grade.subjectCode}
            className="flex items-center justify-center flex-col bg-indigo-900 text-white p-5 w-fit rounded-3xl m-5 shadow-lg"
          >
            <h1 className="text-4xl">{grade.marksObtained}</h1>
            <h1>{grade.subjectName} ({grade.subjectCode})</h1>
            <h1>{grade.grade} Grade - {grade.gradePoint}/10</h1>
          </div>
        ))}
      </div>
    </div>
  );
}