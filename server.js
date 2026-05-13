require("dotenv").config();

const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const studentRoutes =
    require("./routes/studentRoutes");

const attendanceRoutes =
    require("./routes/attendanceRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static("public"));

app.use("/api/students", studentRoutes);

app.use("/api/attendance", attendanceRoutes);

mongoose.connect(process.env.MONGO_URI)

.then(() => {

    console.log("MongoDB Connected");

})

.catch((error) => {

    console.log(error);

});

app.listen(3001, () => {

    console.log("Server running on port 3001");

});