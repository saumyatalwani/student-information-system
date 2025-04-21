import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const config = {
  headers: { 
    'Authorization': `Bearer ${localStorage.getItem("token")}`,
  }
};

export default function GradesView() {
  const { id } = useParams();
  const [grades, setGrades] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(`${BACKEND_URL}/facultyView/grades?id=${id}`,config);
      setGrades(response.data);
    };
    fetchData();
  }, []);

  if(grades==null || grades.length<1){
    return(
      <div className="pl-10">
      <Link to={"/faculty/grade/view"}>Back</Link>
      <h1 className="text-3xl font-bold">
        Uploaded Grades
      </h1>
      
      <h1>Grades Not Uploaded!</h1>
      </div>
    )
  }


  return (
    <div className="pl-10">
      <Link to={"/faculty/grade/view"}>Back</Link>
      <h1 className="text-3xl font-bold">
        Uploaded Grades
      </h1>

      <div className="my-4">
          <table className="border border-gray-400 w-[80vw] text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Roll No</th>
                <th className="border px-4 py-2">Student Name</th>
                <th className="border px-4 py-2">Marks</th>
                <th className="border px-4 py-2">Total Marks</th>
                <th className="border px-4 py-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((row, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{row.studentInfo.rollNo}</td>
                  <td className="border px-4 py-2">{row.studentInfo.firstName + " "  + row.studentInfo.lastName}</td>
                  <td className="border px-4 py-2">{row.marksObtained}</td>
                  <td className="border px-4 py-2">{row.totalMarks}</td>
                  <td className="border px-4 py-2">{row.examType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      
    </div>
  );
}
