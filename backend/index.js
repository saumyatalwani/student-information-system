const express = require("express");
const authRoutes = require("./routes/auth")
const studentViews = require("./routes/studentView")
const facultViews = require("./routes/teacherView")
const adminViews = require("./routes/adminView")
const connectDB = require("./config/db")
const cors = require("cors")

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors())
app.use(express.json())
app.use('/auth',authRoutes)
app.use('/studentView',studentViews)
app.use('/facultyView',facultViews)
app.use('/admin',adminViews)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));