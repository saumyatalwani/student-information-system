import { useEffect, useState } from "react";
import { getUserFromToken } from "../../utils/auth";
import axios from "axios";
import { Link } from "react-router-dom";

const config = {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem("token")}`,
    }
  };

export default function GradesViewList(){

    const user = getUserFromToken();
    const [courses,setCoures]=useState([]);
    const [sem, setSem] = useState(`${new Date().getMonth() <= 7 ? "Even" : "Odd"}-${new Date().getFullYear()}`);

    useEffect(()=>{
        const fetchData= async()=>{
            const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
            const response = await axios.get(`${BACKEND_URL}/facultyView/courses?id=${user._id}&sem=${sem}`,config)
            setCoures(response.data)
        }
        fetchData();
    },[])

    return(
        <div className="pl-10">
        <Link to={"/faculty"}>Back</Link>
        <h1 className="text-3xl font-bold">Grades View</h1>
            {
                courses.map(course =>{
                    return (
                        <Link to={`/faculty/grade/view/${course._id}`} key={course.subjectCode}>
                        <div className="flex items-center justify-center flex-col bg-indigo-900 text-white p-5 w-fit rounded-3xl m-5 shadow-lg">
                            <h1>{course.subject} ({course.subjectCode})</h1>
                            <h1>{course.batch} Batch - Division {course.division}</h1>
                        </div>
                        </Link>
                    )
                })
            }
        </div>
    )

}