import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '@primer/octicons-react';

const config = {
  headers: { 
    'Authorization': `Bearer ${localStorage.getItem("token")}`,
  }
};

export default function AddClass() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        
        const response = await axios.get(`${BACKEND_URL}/admin/faculties`,config);
        setFacultyList(response.data);
      } catch (error) {
        console.error("Failed to fetch faculty list:", error);
        alert("Error loading faculty list.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const classData = {
      subject: formData.get('subject'),
      subjectCode: formData.get('subjectCode'),
      batch: formData.get('batch'),
      division: formData.get('division'),
      semester: formData.get('semester'),
      credits: formData.get('credits'),
      time: formData.get('time'),
      faculty: formData.get('faculty'),
      day: formData.get('day'),
      type: formData.get('type'),
    };

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.post(`${BACKEND_URL}/admin/addClass`, classData,config);

      if (response.status === 201) {
        alert("Class Added Successfully!");
        event.target.reset(); // Clear form after successful submit
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="pl-10 pt-5">
      <Link to={"/admin"} className="inline-flex items-center">
        <ChevronLeftIcon /> Back
      </Link>
      <h2 className="text-4xl font-bold mb-6">Add New Class</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="subject" className="block mb-1 font-medium">Subject:</label>
          <input
            id="subject"
            type="text"
            name="subject"
            required
            className="w-[30vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="subjectCode" className="block mb-1 font-medium">Subject Code:</label>
          <input
            id="subjectCode"
            type="text"
            name="subjectCode"
            required
            className="w-[30vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="batch" className="block mb-1 font-medium">Batch:</label>
          <input
            id="batch"
            type="number"
            name="batch"
            required
            className="w-[30vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="division" className="block mb-1 font-medium">Division:</label>
          <input
            id="division"
            type="number"
            name="division"
            required
            className="w-[30vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="semester" className="block mb-1 font-medium">Semester:</label>
          <input
            id="semester"
            type="text"
            name="semester"
            required
            className="w-[30vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="credits" className="block mb-1 font-medium">Credits:</label>
          <input
            id="credits"
            type="number"
            name="credits"
            required
            className="w-[30vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="time" className="block mb-1 font-medium">Class Time:</label>
          <input
            id="time"
            type="text"
            name="time"
            required
            placeholder="e.g. 10:00 AM - 11:00 AM"
            className="w-[30vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="faculty" className="block mb-1 font-medium">Faculty:</label>
          {loading ? (
            <p>Loading faculties...</p>
          ) : (
            <select
              name="faculty"
              id="faculty"
              required
              className="w-[30vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Faculty</option>
              {facultyList.map((f) => (
                <option key={f._id} value={f._id}>
                  {`${f.prefix} ${f.firstName} ${f.lastName}`}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label htmlFor="day" className="block mb-1 font-medium">Day:</label>
          <input
            id="day"
            type="text"
            name="day"
            required
            placeholder="e.g. Monday"
            className="w-[30vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="type" className="block mb-1 font-medium">Type:</label>
          <select
            name="type"
            id="type"
            required
            className="w-[30vw] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Type</option>
            <option value="Theory">Theory</option>
            <option value="Lab">Lab</option>
          </select>
        </div>

        <button
          type="submit"
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Add Class
        </button>
      </form>
    </div>
  );
}