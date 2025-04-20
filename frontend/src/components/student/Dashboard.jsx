import Sidebar from "./Sidebar";
import Calendar from "./timetable"
import { getUserFromToken } from "../../utils/auth";

export default function StudentDashboard(){

    const user = getUserFromToken();
    const name = user.firstName + " " + user.lastName || "User";

    return (
        <div className="pl-10 pt-5">
        <h1 className="text-6xl font-bold mb-5">Welcome, {name} 👋🏻</h1>
        <div className="flex">
           <Sidebar/>
           <Calendar/>
        </div>
        </div>
    )
}