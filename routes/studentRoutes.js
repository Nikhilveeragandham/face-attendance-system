const express = require("express");
const router = express.Router();

const Student = require("../models/Student");

// Get all students
router.get("/", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Students with face
router.get("/with-face", async (req, res) => {
    try {
        const students = await Student.find({
            faceDescriptor: { $exists: true, $ne: [] }
        });

        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// REGISTER FACE (THIS WAS BROKEN)
router.post("/register-face", async (req, res) => {

    try {

        console.log("REGISTER FACE HIT");
        console.log(req.body);

        const { rollNumber, faceDescriptor } = req.body;

        const student = await Student.findOne({ rollNumber });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        student.faceDescriptor = faceDescriptor;

        await student.save();

        res.json({
            message: "Face Registered Successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            error: error.message
        });
    }

});

module.exports = router;