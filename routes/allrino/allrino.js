"use strict";
const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const projectRouter = require("./project");
const departamentRouter = require("./departament");
const documentRouter = require("./documents");

const filesRouter = require("./files");

// Обработка маршрута /alrino/user
router.use("/document", documentRouter);

// Обработка маршрута /alrino/user
router.use("/user", userRouter);

// Обработка маршрута /alrino/org
router.use("/project", projectRouter);

// Обработка маршрута /alrino/div
router.use("/departament", departamentRouter);

// Обработка маршрута /alrino/files
router.use("/files", filesRouter);
module.exports = router;
