import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@primer/octicons-react";

export default function AddFaculty() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    prefix: "",
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
  
    if (!formData.email || !formData.password) {
      alert("Email and password are required.");
      return;
    }
  
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const res = await axios.post(`${BACKEND_URL}/auth/register/faculty`, formData);

      console.log(res);
  
      if (res.status === 201) {
        alert("Faculty added successfully!");
        setFormData({
          email: "",
          password: "",
          prefix: "",
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
    <div className="pl-10 pt-5">
        <Link to={"/admin"} className="inline-flex items-center"><ChevronLeftIcon/>Back</Link>
      <h1 className="text-4xl font-bold mb-6">Add Faculty</h1>
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
            <label className="block mb-1 font-medium">Prefix</label>
            <select
                name="prefix"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.prefix}
                onChange={handleChange}
            >
                <option value="">Select a prefix</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
            </select>
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
