import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import {ChevronLeftIcon} from '@primer/octicons-react'


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Generate() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourseObj, setSelectedCourseObj] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/adminView/courses`);
        setCourses(response.data);
      } catch (err) {
        alert(`Error fetching courses: ${err.message}`);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const selected = courses.find((c) => c._id === selectedCourseId);
    setSelectedCourseObj(selected || null);
  }, [selectedCourseId, courses]);

  const formatDate = (isoDate) => {
    const [yyyy, mm, dd] = isoDate.split("-");
    return `${dd}-${mm}-${yyyy}`;
  };

  const handleAttendance = async () => {
    console.log("Clicked Generate Attendance");
  
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
  
    console.log("Start:", startDate);
    console.log("End:", endDate);
  
    try {
      const response = await axios.post(`${BACKEND_URL}/class/generate`, {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });
  
      console.log("Response:", response);
  
      if (response.status === 201) {
        alert("Attendance Generated for All Classes");
      }
    } catch (err) {
      console.error("Error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleGrades = async () => {
    if (!selectedCourseObj) {
      alert("Please select a course to generate result.");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/grades/final`, {
        classRef: selectedCourseObj._id,
        type: selectedCourseObj.type,
      });

      if (response.status === 201) {
        alert("Result Generated for Selected Course");
      } else if (response.status === 404) {
        alert(`${response.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-10">
      <Link to={"/admin/"} className="inline-flex items-center"><ChevronLeftIcon />Back</Link>
      <h2 className="text-3xl font-bold mb-6">Generate Attendance</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-[20vw] border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <label className="block mb-1 font-medium">End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-[20vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        onClick={handleAttendance}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
      >
        Generate Attendance for All Courses
      </button>

      <h2 className="text-3xl font-bold my-6">Generate Result</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Course:</label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-[30vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Select Course --</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.subject} ({course.type}) - {course.semester} Sem - Division {course.division}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleGrades}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Generate Result for Selected Course
        </button>
      </div>
    </div>
  );
}