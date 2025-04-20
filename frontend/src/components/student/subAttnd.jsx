import { useState,useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getUserFromToken } from "../../utils/auth";
import axios from "axios";

export default function SubjectAttendancePage(){
    const { id } = useParams();
    const [attendanceData, setAttendanceData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
          const user = getUserFromToken(); // Read from localStorage/cookies
    
          try {
            const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
            const url = `${BACKEND_URL}/studentView/attendance/subject?div=${user.division}&id=${user._id}&subjectRef=${id}`
            const response = await axios.get(
              url
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

      console.log(attendanceData);

    return (

        <div className="pl-10">
            <Link to={'/student/attendance'}>Back</Link>
            <h1 className="text-4xl mb-5">{attendanceData.subject}</h1>
            <h1>Total Classes : {attendanceData.totalClasses}</h1>
            <h1>Attended Classes : {attendanceData.attendedClasses}</h1>
            
            <div className="mt-2">
            <h1>Classes</h1>
            {
                attendanceData.attendanceDetails.map(lec => {
                    const date = new Date(lec.date);

                    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${
                    (date.getMonth() + 1).toString().padStart(2, '0')
                    }/${date.getFullYear().toString().slice(-2)}` /*${
                    date.getHours().toString().padStart(2, '0')
                    }:${date.getMinutes().toString().padStart(2, '0')}`*/;

                    return (
                        <>
                        <p>Date : {formattedDate} {lec.attended ? "✅" : "❌"}</p> 
                        </>
                    )
                })
            }
            </div>
        </div>
    )
}