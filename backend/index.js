const express = require("express");
const authRoutes = require("./routes/auth")
const classRoutes = require("./routes/class")
const gradeRoutes = require("./routes/grades")
const studentViews = require("./routes/studentView")
const connectDB = require("./config/db")

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json())
app.use('/auth',authRoutes)
app.use('/class',classRoutes)
app.use('/grades',gradeRoutes)
app.use('/studentView',studentViews)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));