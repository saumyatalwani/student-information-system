import { Link } from "react-router-dom";
import AttendancePieChart from "./pie";
import { useState,useEffect } from "react";
import { getUserFromToken } from "../../utils/auth";
import axios from "axios";

export default function Sidebar() {

  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = getUserFromToken(); // Read from localStorage/cookies

      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.get(
          `${BACKEND_URL}/studentView/attendance?div=${user.division}&id=${user._id}`
        );
        setAttendanceData(response.data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchData();
  }, []);

  if (!attendanceData) {
    return <div className="pl-10 text-lg">Loading attendance...</div>;
  }
  
  return (
    <div className="bg-indigo-900 text-white w-[25vw] h-[70vh] p-5 rounded-3xl m-5 shadow-2xl">
      <h1 className="text-xl font-bold mb-10">Your Dashboard</h1>
      <div className="mb-6 space-y-2">
        <h1>Attendance - {attendanceData.totalAttendancePercentage.toFixed(2)}%</h1>
        <AttendancePieChart data={attendanceData}/>
        <Link to={'/student/attendance'}>View Detailed</Link>
      </div>

      <Link to={'/student/grades'} className="text-lg font-bold my-10">View Grades</Link>
    </div>
  );
}