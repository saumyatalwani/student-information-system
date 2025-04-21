import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@primer/octicons-react";
import Papa from "papaparse";

const config = {
  headers: { 
    'Authorization': `Bearer ${localStorage.getItem("token")}`,
  }
};

export default function AddStudent() {
  const [csvFile, setCsvFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  
  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parsedData.length === 0) {
      alert("No parsed data available to upload.");
      return;
    }

    const students = parsedData.map((row) => ({
      email: row.email?.trim(),
      password: row.password?.trim(),
      rollNo: row.rollNo?.trim(),
      division: row.division?.trim(),
      firstName: row.firstName?.trim() || undefined,
      lastName: row.lastName?.trim() || undefined,
    }));

    const hasMissing = students.some(
      (s) => !s.email || !s.password || !s.rollNo || !s.division
    );
    if (hasMissing) {
      alert("Some rows are missing required fields (email, password, rollNo, division).");
      return;
    }

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const res = await axios.post(`${BACKEND_URL}/admin/register/students/bulk`, students,config);

      if (res.status === 201) {
        alert(`${res.data.insertedCount} students added successfully!`);
        setCsvFile(null);
        setParsedData([]);
      } else {
        alert(res.data?.error || "Something went wrong.");
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleTemplateDownload = () => {
    const headers = [
      "email",
      "password",
      "rollNo",
      "division",
      "firstName",
      "lastName"
    ];
    const exampleRow = {
      email: "john@example.com",
      password: "pass123",
      rollNo: "A001",
      division: "A",
      firstName: "John",
      lastName: "Doe"
    };

    const csv = Papa.unparse([exampleRow], { columns: headers });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVParse = () => {
    if (!csvFile) return;
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data);
      },
      error: (err) => {
        alert("CSV parsing failed: " + err.message);
      }
    });
  };

  return (
    <div className="pl-10 pt-5">
      <Link to={"/admin/add/student"} className="inline-flex items-center"><ChevronLeftIcon />Back</Link>
      <h1 className="text-4xl font-bold mb-6">Bulk Add Students</h1>

      <button
        onClick={handleTemplateDownload}
        className="mb-4 bg-gray-200 text-sm text-black px-3 py-1 rounded hover:bg-gray-300"
      >
        Download CSV Template
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-medium">Upload CSV *</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="button"
          onClick={handleCSVParse}
          className="bg-gray-200 text-sm text-black px-3 py-2 rounded hover:bg-gray-300"
        >
          Parse CSV
        </button>

        {parsedData.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mt-4">Parsed Data Preview</h2>
            <table className="table-auto w-[80vw] mt-4 text-left">
              <thead>
                <tr>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Password</th>
                  <th className="px-3 py-2">Roll No</th>
                  <th className="px-3 py-2">Division</th>
                  <th className="px-3 py-2">First Name</th>
                  <th className="px-3 py-2">Last Name</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2">{row.email}</td>
                    <td className="px-3 py-2">{row.password}</td>
                    <td className="px-3 py-2">{row.rollNo}</td>
                    <td className="px-3 py-2">{row.division}</td>
                    <td className="px-3 py-2">{row.firstName}</td>
                    <td className="px-3 py-2">{row.lastName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition mt-4"
        >
          Upload
        </button>
      </form>
    </div>
  );
}