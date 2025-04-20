import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

export default function AttendanceUpload() {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState([]);
  const [absent, setAbsent] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

      try {
        const response = await axios.get(`${BACKEND_URL}/facultyView/class?id=${id}`);
        const session = response.data.sessions?.[0];
        const studs = response.data.students;

        setClassData(session);
        setStudents(studs);
        setPresent(session.presentStudents || []);
        setAbsent(session.absentStudents || []);
      } catch (err) {
        console.error("Error fetching class/session data:", err);
        setMessage("Failed to fetch session data.");
      }
    };

    fetchData();
  }, [id]);

  const toggleAttendance = (studentId) => {
    if (present.includes(studentId)) {
      setPresent(present.filter((id) => id !== studentId));
      setAbsent([...absent, studentId]);
    } else if (absent.includes(studentId)) {
      setAbsent(absent.filter((id) => id !== studentId));
    } else {
      setPresent([...present, studentId]);
    }
  };

  const handleSubmit = async () => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      await axios.post(`${BACKEND_URL}/class/addAttendance`, {
        attendanceSessionId: classData._id,
        presentStudents: present,
        absentStudents: absent,
      });

      setMessage("✅ Attendance submitted successfully!");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setMessage("❌ Error submitting attendance.");
    }
  };

  if (!classData) return <div>Loading...</div>;

  const { classData: classInfo, date, time } = classData;

  const getStatus = (studentId) => {
    if (present.includes(studentId)) return "Present";
    if (absent.includes(studentId)) return "Absent";
    return "Unmarked";
  };

  return (
    <div className="pl-10">
        <Link to={"/faculty"}>Back</Link>
      <h1 className="text-3xl font-bold">
        {classInfo?.subject} ({classInfo?.subjectCode})
      </h1>
      <h2>{classInfo?.batch} Batch - Division {classInfo?.division}</h2>
      <h2>{new Date(date).toLocaleDateString()} - {time}</h2>

      <h1 className="text-2xl font-bold my-5">Students</h1>
      <div className="space-y-4">
        {students.map((student) => (
          <div key={student._id} className="p-4 rounded-md shadow-sm w-fit">
            <h1 className="font-semibold">
              {student.firstName} {student.lastName} ({student.rollNo})
            </h1>
            <p>Status: <span className="font-medium">{getStatus(student._id)}</span></p>
            <button
              className="mt-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              onClick={() => toggleAttendance(student._id)}
            >
              Toggle Status
            </button>
          </div>
        ))}
      </div>

      <button
        className="mt-10 px-6 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700"
        onClick={handleSubmit}
      >
        Submit Attendance
      </button>

      {message && <p className="mt-4 font-medium text-lg">{message}</p>}
    </div>
  );
}
