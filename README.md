# School Information System

This project provides a unified codebase for managing critical aspects of school operations, including student attendance, grades, timetables, and administrative workflows. By consolidating frontend, backend, and shared utilities into a single repository, it ensures consistency, maintainability, and seamless collaboration across modules.

The system empowers educators, students, and administrators with features such as real-time attendance tracking, grade management, and secure access to academic records. With role-based authentication, data integrity and privacy are always safeguarded.

Built with modern web technologies, the monorepo demonstrates best practices in modular architecture, API-driven design, and cross-service integration. Whether you’re exploring scalable monorepo structures, working with full-stack applications, or learning how to manage complex school data systems, this repository serves as a comprehensive resource for practical insights and real-world implementation.

**Tech Stack:** React, Express, MongoDB, Tailwind CSS

## Index

1. [Requirements](#requirements)
2. [Environment Variables](#environment-variables)
  - [Frontend](#frontend)
  - [Backend](#backend)
3. [Installation of Dependencies](#installation-of-dependencies)
4. [Authentication API Routes](#authentication-api-routes)
  - [POST /register/user](#post-registeruser)
  - [POST /login](#post-login)
5. [Authenticated API Routes](#authenticated-api-routes)
  - [Student Routes](#student-routes)
    - [GET /attendance](#get-attendance)
    - [GET /attendance/subject](#get-attendancesubject)
    - [GET /grades](#get-grades)
    - [GET /schedule](#get-schedule)
  - [Faculty Routes](#faculty-routes)
    - [GET /faculty/schedule](#get-facultyschedule)
    - [POST /faculty/addAttendance](#post-facultyaddattendance)
    - [POST /faculty/grades/add](#post-facultygradesadd)
  - [Admin Routes](#admin-routes)
    - [POST /admin/register/faculty](#post-adminregisterfaculty)
    - [POST /admin/register/student](#post-adminregisterstudent)

---

## Requirements

- Node.js for backend  
- React for frontend  

---

## Environment Variables

### Frontend
```bash
VITE_BACKEND_URL=''
```

### Backend
```bash
SECRET_KEY=
MONGO_URI=
```

---

## Installation of Dependencies

```bash
cd backend/ && npm i
cd ../frontend && npm i
```

---

##  Authentication API Routes

#### **POST** `/register/user`

Registers a new user in the system.  
The password is securely hashed before being stored in the database.

Request Body (JSON) : 
```json
{
  "email": "student@example.com",
  "password": "strongPassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

- `email` *(string, required)* → Unique email of the user.  
- `password` *(string, required)* → Plain-text password (will be hashed).  
- `firstName` *(string, optional)* → User’s first name.  
- `lastName` *(string, optional)* → User’s last name.  

Responses

| Status Code | Type    | Description              | Response Example |
|-------------|---------|--------------------------|------------------|
| **201 Created** | ✅ Success | User created successfully | `{ "message": "User Created Successfully!" }` |
| **400 Bad Request** | ❌ Error | Email already exists | `{ "error": "Mail Already Exists" }` |
| **500 Internal Server Error** | ❌ Error | General failure | `{ "error": "Registration failed" }` |

---

#### **POST** `/login`

Authenticates a user with email and password, then returns a **JWT token** for future requests.

Request Body (JSON)
```json
{
  "email": "student@example.com",
  "password": "strongPassword123"
}
```

- `email` *(string, required)* → Registered email.  
- `password` *(string, required)* → User’s password.  

Responses

| Status Code | Type    | Description         | Response Example |
|-------------|---------|---------------------|------------------|
| **200 OK** | ✅ Success | Login successful (returns JWT token) | `{ "token": "<jwt_token_here>" }` |
| **401 Unauthorized** | ❌ Error | User not found | `{ "error": "User Not Found!" }` |
| **401 Unauthorized** | ❌ Error | Incorrect password | `{ "error": "Incorrect Password" }` |
| **500 Internal Server Error** | ❌ Error | General failure | `{ "error": "Something went wrong" }` |

---

## Authenticated API Routes

- All Authenticated Routes require a **Bearer Token** in the request header.

### Student Routes

#### **GET** `/attendance`

Fetches attendance summary for a student across all subjects.

Query Parameters
- `id` *(string, required)* → Student ID  
- `div` *(string, required)* → Division

Responses

| Status Code | Type    | Description              | Response Example |
|-------------|---------|--------------------------|------------------|
| **200 OK** | ✅ Success | Attendance summary | `{ "totalClasses": 42, "attendedClasses": 35, "totalAttendancePercentage": 83.3, "subjects": [ { "subject": "64f...", "subjectName": "Mathematics", "totalClasses": 14, "attendedClasses": 12, "attendancePercentage": 85.7 } ] }` |
| **500 Internal Server Error** | ❌ Error | Server error | `{ "error": "Error message" }` |

---

#### **GET** `/attendance/subject`

Fetches detailed attendance for a specific subject.

 Query Parameters
- `id` *(string, required)* → Student ID  
- `subjectRef` *(string, required)* → Subject/Class reference ID  
- `div` *(string, required)* → Division

Responses

| Status Code | Type    | Description              | Response Example |
|-------------|---------|--------------------------|------------------|
| **200 OK** | ✅ Success | Subject-wise attendance | `{ "totalClasses": 12, "attendedClasses": 10, "totalAttendancePercentage": 83.3, "subject": "Mathematics", "attendanceDetails": [ { "date": "2025-01-15T00:00:00.000Z", "attended": true } ] }` |
| **500 Internal Server Error** | ❌ Error | Server error | `{ "error": "Error message" }` |

---

#### **GET** `/grades`

Fetches semester grades and calculates SPI (Semester Performance Index).

Query Parameters
- `id` *(string, required)* → Student ID  
- `sem` *(string, required)* → Semester number

Responses

| Status Code | Type    | Description              | Response Example |
|-------------|---------|--------------------------|------------------|
| **200 OK** | ✅ Success | Grades with SPI | `{ "creditsObtained": 54, "totalCredits": 60, "SPI": 9.0, "grades": [ { "subjectCode": "MTH101", "subjectName": "Mathematics", "marksObtained": 78, "totalMarks": 100, "gradePoint": 9, "grade": "A+" } ] }` |
| **500 Internal Server Error** | ❌ Error | Server error | `{ "message": "Error message" }` |

---

#### **GET** `/schedule`

Fetches the student’s lecture schedule in calendar format.

 Query Parameters
- `div` *(string, required)* → Division  
- `semester` *(string, required)* → Semester number

Responses

| Status Code | Type    | Description              | Response Example |
|-------------|---------|--------------------------|------------------|
| **200 OK** | ✅ Success | Schedule | `[ { "subject": "Mathematics", "day": "Monday", "start": 10, "end": 11, "location": "Theory" } ]` |
| **400 Bad Request** | ❌ Error | Missing query params | `{ "error": "Missing division or semester in query." }` |
| **500 Internal Server Error** | ❌ Error | Server error | `{ "error": "Server error" }` |

---

### Faculty Routes

#### **GET** `/faculty/schedule`

Fetch faculty lecture schedule in calendar format.

 Query Parameters
- `sem` *(string, required)* → Semester number  
- `id` *(string, required)* → Faculty ID  

Responses

| Status Code | Type    | Description | Response Example |
|-------------|---------|-------------|------------------|
| **200** | ✅ Success | Schedule | `[{"subject": "Computer Science", "day": "Monday", "start": 10, "end": 11, "location": "Theory"}]` |
| **500** | ❌ Error | Server error | `{"error": "Server error"}` |

---

#### **POST** `/faculty/addAttendance`

Update attendance for a class session.

Responses

| Status Code | Type    | Description | Response Example |
|-------------|---------|-------------|------------------|
| **200** | ✅ Success | Attendance updated | `{"message": "Attendance updated successfully", "session": {"_id": "123"}}` |
| **400** | ❌ Error | Invalid request body | `{"error": "Missing or invalid fields in request body"}` |
| **500** | ❌ Error | Server error | `{"error": "Failed to update attendance"}` |

---

#### **POST** `/faculty/grades/add`

Add grades for multiple students.

Responses

| Status Code | Type    | Description | Response Example |
|-------------|---------|-------------|------------------|
| **201** | ✅ Success | Grades added | `{"message": "Grades added successfully", "data": []}` |
| **400** | ❌ Error | Validation error | `{"message": "No grades provided or invalid format"}` |
| **500** | ❌ Error | Server error | `{"message": "Server error", "error": "err.message"}` |

---

### Admin Routes

#### **POST** `/admin/register/faculty`

Register a new faculty user.

 Query Parameters
- `email` *(string, required)* → Faculty email  
- `password` *(string, required)* → Password  
- `firstName` *(string, optional)* → First name  
- `lastName` *(string, optional)* → Last name  
- `prefix` *(string, optional)* → Prefix  

Responses

| Status Code | Type    | Description | Response Example |
|-------------|---------|-------------|------------------|
| **201** | ✅ Success | Faculty created | `{"message": "Faculty Created Successfully!"}` |
| **400** | ❌ Error | Duplicate email | `{"error": "Mail Already Exists"}` |
| **500** | ❌ Error | Server error | `{"error": "Registration failed"}` |

---

#### **POST** `/admin/register/student`

Register a new student user.

 Query Parameters
- `email` *(string, required)* → Student email  
- `password` *(string, required)* → Password  
- `rollNo` *(string, required)* → Roll Number  
- `division` *(string, required)* → Division  
- `firstName` *(string, optional)* → First name  
- `lastName` *(string, optional)* → Last name  

Responses

| Status Code | Type    | Description | Response Example |
|-------------|---------|-------------|------------------|
| **201** | ✅ Success | Student created | `{"message": "Student Created Successfully!"}` |
| **400** | ❌ Error | Duplicate email | `{"error": "Mail Already Exists"}` |
| **500** | ❌ Error | Server error | `{"error": "Registration failed"}` |

---

