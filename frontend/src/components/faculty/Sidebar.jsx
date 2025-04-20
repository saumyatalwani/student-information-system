import { Link } from "react-router-dom";

export default function Sidebar() {

  
  return (
    <div className="bg-indigo-900 text-white w-[25vw] h-[70vh] p-5 rounded-3xl m-5 shadow-2xl">
      <h1 className="text-xl font-bold mb-10">Your Dashboard</h1>
      <div className="flex flex-col">
      <Link to={'/faculty/grade/upload'} className="text-lg my-2 pl-4">Upload Grades</Link>
      <Link to={'/faculty/grade/view'} className="text-lg my-2 pl-4">View Grades</Link>
      </div>
    </div>
  );
}