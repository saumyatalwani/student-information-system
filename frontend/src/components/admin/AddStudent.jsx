import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@primer/octicons-react";

export default function AddStudent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rollNo: "",
    division: "",
    firstName: "",
    lastName: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, rollNo, division } = formData;

    if (!email || !password || !rollNo || !division) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const res = await axios.post(`${BACKEND_URL}/auth/register/student`, formData);

      if (res.status === 201) {
        alert("Student added successfully!");
        setFormData({
          email: "",
          password: "",
          rollNo: "",
          division: "",
          firstName: "",
          lastName: ""
        });
      } else {
        alert(res.data?.error || "Something went wrong.");
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="pl-10 pt-5 pr-10">
      <Link to={"/admin"} className="inline-flex items-center"><ChevronLeftIcon />Back</Link>
      
      <div className="flex items-center">
        <h1 className="text-4xl font-bold mb-6">Add Student</h1>
        <Link to={"/admin/add/student/bulk"} className="ml-auto inline-flex items-center bg-indigo-600 text-white rounded p-3">Add Bulk</Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-medium">Email *</label>
          <input
            type="email"
            name="email"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Password *</label>
          <input
            type="password"
            name="password"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Roll Number *</label>
          <input
            type="text"
            name="rollNo"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.rollNo}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Division *</label>
          <input
            type="number"
            name="division"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.division}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">First Name</label>
          <input
            type="text"
            name="firstName"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Last Name</label>
          <input
            type="text"
            name="lastName"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
