import { Routes, Route } from "react-router-dom";
import './App.css'
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute"
import StudentDashboard from "./components/student/Dashboard";
import AttendancePage from "./components/student/AttndPage";
import SubjectAttendancePage from "./components/student/subAttnd";
import StudGrades from "./components/student/grades";
import FacultyDashboard from "./components/faculty/Dashboard";
import AttendanceUpload from "./components/faculty/AttendanceUpload";
import GradesPage from "./components/faculty/GradesPage";
import GradeUpload from "./components/faculty/GradeUpload";
import GradesViewList from "./components/faculty/GradesViewList";
import GradesView from "./components/faculty/GradesView";
import AdminDashboard from "./components/admin/AdminDashboard";
import AddFaculty from "./components/admin/AddFaculty";
import AddStudent from "./components/admin/AddStudent";
import AddStudentBulk from "./components/admin/AddStudentBulk";
import AddClass from "./components/admin/AddClass";
import Generate from "./components/admin/Generate";
import Unauthorized from "./components/unauthorized";

function App() {

  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />}/>
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="" element={<StudentDashboard/>}></Route>
        <Route path="attendance" element={<AttendancePage/>}></Route>
        <Route path="attendance/:id" element={<SubjectAttendancePage/>}></Route>
        <Route path="grades/" element={<StudGrades/>}></Route>
      </Route>
      <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']} />}>
        <Route path="" element={<FacultyDashboard/>}/>
        <Route path="attendance/upload/:id" element={<AttendanceUpload/>}/>
        <Route path="grade/upload/" element={<GradesPage/>}/>
        <Route path="grade/upload/:id" element={<GradeUpload/>}/>
        <Route path="grade/view/" element={<GradesViewList/>}/>
        <Route path="grade/view/:id" element={<GradesView/>}/>
      </Route>
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['user']} />}>
        <Route path="" element={<AdminDashboard/>}/>
        <Route path="add/faculty" element={<AddFaculty/>}/>
        <Route path="add/student" element={<AddStudent/>}/>
        <Route path="add/student/bulk" element={<AddStudentBulk/>}/>
        <Route path="add/class" element={<AddClass/>}/>
        <Route path="generate" element={<Generate/>}/>
      </Route>
      <Route path="/unauthorized" element={<Unauthorized/>}></Route>
    </Routes>
    </>
  )
}

export default App
