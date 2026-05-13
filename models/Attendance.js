const express = require("express");

const router = express.Router();

const Attendance =
    require("../models/Attendance");

router.post("/mark", async (req, res) => {

    try {

        const {
            rollNumber,
            name
        } = req.body;

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const existingAttendance =
            await Attendance.findOne({

                rollNumber,

                date: {
                    $gte: today
                }

            });

        if (existingAttendance) {

            return res.json({
                message:
                    "Attendance Already Marked Today"
            });

        }

        const attendance =
            new Attendance({
                rollNumber,
                name
            });

        await attendance.save();

        res.json({
            message:
                "Attendance Marked Successfully"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;