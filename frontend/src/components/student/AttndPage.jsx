import { useEffect, useState } from "react";
import AttendancePieChart from "./pie";
import axios from "axios";
import { getUserFromToken } from "../../utils/auth";
import { Link } from "react-router-dom";

const config = {
  headers: { 
    'Authorization': `Bearer ${localStorage.getItem("token")}`,
  }
};


export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = getUserFromToken(); // Read from localStorage/cookies

      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.get(
          `${BACKEND_URL}/studentView/attendance?div=${user.division}&id=${user._id}`
        ,config);
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

  console.log(attendanceData)

  return (
    <div className="pl-10">
      <Link to={'/student'}>Back</Link>
      <h1 className="text-4xl font-bold">Attendance</h1>
      <div className="flex justify-center flex-col items-center">
        <AttendancePieChart data={attendanceData} />
        <p className="text-lg">
        {attendanceData?.totalAttendancePercentage != null
          ? `${attendanceData.totalAttendancePercentage.toFixed(2)}% - ${attendanceData.attendedClasses}/${attendanceData.totalClasses} Classes`
          : 'No Data'}
        </p>

      </div>
      <h1 className="text-xl font-semibold">Classes</h1>
      <div className="flex items-center justify-center flex-wrap">
        {
            /**/
            attendanceData.subjects.map(subject => {
                return (
                  <Link to={`/student/attendance/${subject.subject}`} key={subject.subject}>
                    <div className="bg-indigo-900 text-white p-5 w-fit rounded-3xl m-5 shadow-lg">
                        <h1 className="text-2xl font-bold">{subject.subjectName}</h1>
                        <p className="mt-5">{subject.attendancePercentage.toFixed(2)}% -{" "}
                        {subject.attendedClasses}/{subject.totalClasses} Classes</p>
                    </div>
                    </Link>
                )
            })
        }
      </div>
    </div>
  );
}