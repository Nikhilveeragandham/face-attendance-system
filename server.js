require("dotenv").config();

const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const studentRoutes =
    require("./routes/studentRoutes");

const attendanceRoutes =
    require("./routes/attendanceRoutes");

const app = express();

const cors = require("cors");

app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://face-attendance-system-1-ypft.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);

});
