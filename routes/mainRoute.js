const express = require("express");
const router = express.Router();

const teacher = require("../controller/teacher.controller");

router.get("/getTeachers",teacher.getTeacher);

module.exports = router;
