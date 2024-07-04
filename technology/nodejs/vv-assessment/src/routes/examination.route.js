const express = require("express");
const examRouter = express.Router();
const auth = require('../middlewares/auth.js')
const adminAuth = require('../middlewares/admin-auth.js')
const multer = require('multer');
// Define storage for the uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
  startTest, submitAnswers, fetchAnswers, uploadQuestions, getAllQuestion, deleteQuestion, updateQuestion, getCollege, postCollege, compareSession
} = require('../controllers/examination.controller.js');

examRouter.post("/start-test", auth, startTest);
examRouter.post("/submit-test", auth, submitAnswers);
examRouter.get("/fetch-answers", adminAuth, fetchAnswers);
examRouter.get("/fetch-questions", adminAuth, getAllQuestion);
examRouter.post("/upload-questions", upload.single('file'), adminAuth, uploadQuestions);
examRouter.patch("/update-question", adminAuth, updateQuestion);
examRouter.delete("/delete-question", adminAuth, deleteQuestion);
examRouter.get("/get-college", auth, getCollege);
examRouter.post("/post-college", auth, postCollege);
examRouter.get("/compare-session", compareSession);
// examRouter.post("/post-session", auth, postSession);

module.exports = examRouter;