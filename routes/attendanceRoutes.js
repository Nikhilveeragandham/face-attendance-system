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

        const attendance =
            new Attendance({
                rollNumber,
                name
            });

        await attendance.save();

        res.json({
            message: "Attendance Marked"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;