const testModel = require("../models/examination.model")
const answerModel = require("../models/answer.model");
const signUpModel = require("../models/sign-up.model");
const collegeModel = require("../models/college.model");
const sessionModel = require("../models/session.model");
const multer = require('multer');
const XLSX = require('xlsx');
require("dotenv").config();
const CryptoJS = require("crypto-js");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadQuestions = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(sheet);
        for (const row of data) {
            const existingQuestion = await testModel.findOne({ question: row.Question });
            if (!existingQuestion) {
                const newAnswer = {
                    question: row.Question,
                    answer: row.Answer,
                    a: row.A,
                    b: row.B,
                    c: row.C,
                    d: row.D,
                    category: row.Category,
                    level: row.Level,
                    createdat: new Date(),
                };
                await new testModel(newAnswer).save();
            }
        }

        res.status(200).json({ message: "File uploaded and processed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const startTest = async (req, res) => {
    try {
        let category = ['JS', 'SQL', 'HTML & CSS', 'C#', 'Aptitude', 'C & C++'];
        let promises = category.map(async element => {
            let data = await testModel.find({ category: element });
            let levelOneRecords = data.filter(el => el.level === '1');
            let levelTwoRecords = data.filter(el => el.level === '2');
            let levelThreeRecords = data.filter(el => el.level === '3');
            levelOneRecords = shuffle(levelOneRecords);
            levelTwoRecords = shuffle(levelTwoRecords);
            levelThreeRecords = shuffle(levelThreeRecords);
            if (levelOneRecords.length > 2) {
                levelOneRecords = levelOneRecords.slice(0, 2);
            }
            if (levelTwoRecords.length > 2) {
                levelTwoRecords = levelTwoRecords.slice(0, 2);
            }
            if (levelThreeRecords.length > 1) {
                levelThreeRecords = levelThreeRecords.slice(0, 1);
            }

            let records = levelOneRecords.concat(levelTwoRecords, levelThreeRecords);

            const payload = {
                "_id": levelOneRecords[0].category,
                "category": levelOneRecords[0].category,
                "data": records
            }
            return payload;
        });

        let results = await Promise.all(promises);
        results = shuffle(results);
        const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(results), 'hereisthesecretkeyforencryption').toString();

        res.send({ status: 200, message: "successful", data: ciphertext });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 500, message: "Internal server error" });
    }
};

const submitAnswers = async (req, res) => {
    try {
        await answerModel.deleteMany({ userId: req.body.answers[0].userId });
        let correctAnswers = 0;
        req.body.answers.map(async answers => {
            const { userId, questionId, userAnswer, answer } = answers;
            const newAnswer = {
                userId,
                questionId,
                userAnswer,
                answer,
                createdat: new Date(),
            };
            if (userAnswer === answer) {
                correctAnswers++;
            }
            await new answerModel(newAnswer).save();
        })
        await signUpModel.findOneAndUpdate({ userId: req.body.answers[0].userId }, { $set: { score: correctAnswers } });
        res.send({ status: 200, message: "Answer Submitted Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const fetchAnswers = async (req, res) => {
    try {
        const { userId } = req.query;
        let userAnswers = await answerModel.find({ userId: userId });
        userAnswers = await Promise.all(userAnswers.map(async answers => {
            let questionDetail = await testModel.findOne({ _id: answers.questionId });
            return { ...questionDetail.toObject(), answers };
        }));
        const mergedData = userAnswers.map(item => {
            const { answers, ...rest } = item;
            return {
                ...rest,
                userId: answers.userId,
                userAnswer: answers.userAnswer
            };
        });
        mergedData.sort((a, b) => {
            if (a.category < b.category) return -1;
            if (a.category > b.category) return 1;
            if (a.level < b.level) return -1;
            if (a.level > b.level) return 1;
            return 0;
        });
        const groupedData = mergedData.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});
        const result = Object.entries(groupedData).map(([category, value]) => ({
            category,
            value
        }));

        res.send({ status: 200, message: "Success", userAnswers: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const getAllQuestion = async (req, res) => {
    const { page = 1, limit = 10, search, category, level } = req.query;
    const skip = (page - 1) * limit;
    let query = {};
    if (search || category || level) {
        query.$or = [
            { question: { $regex: search, $options: 'i' } },
        ];
        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }
        if (level) {
            query.level = { $regex: level, $options: 'i' };
        }
    }
    try {
        const questions = await testModel.find(query).skip(skip).limit(limit);
        const total = await testModel.countDocuments(query);
        return res.json({
            status: 200,
            message: "Success",
            data: questions,
            totalRecords: total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


const deleteQuestion = async (req, res) => {
    const { id } = req.query;
    try {
        const result = await testModel.findByIdAndDelete({ _id: id });
        if (!result) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json({ status: 200, message: 'Question deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete question' });
    }
};

const updateQuestion = async (req, res) => {
    const { questionId, category, level, a, b, c, d, answer, question } = req.body;
    try {
        const updatedQuestion = await testModel.findByIdAndUpdate(questionId, {
            category,
            level,
            a,
            b,
            c,
            d,
            answer,
            question
        }, { new: true });
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json({ status: 200, message: 'Question updated successfully', question: updatedQuestion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update question' });
    }
};

const compareSession = async (req, res) => {
    const { sessionId } = req.query;
    try {
        const session = await sessionModel.findOne({ sessionId: sessionId });
        if (!session) {
            return res.send({ status: 404, message: 'Session Not Found' });
        } else {
            if (session?.isActive == 0) {
                return res.send({ status: 404, message: 'Session Not Active' });
            } else {
                const college = await collegeModel.findOne({ _id: session.collegeId });
                if (!college) {
                    return res.send({ status: 404, message: 'College Not Found' });
                } else if (college.isActive == 0) {
                    return res.send({ status: 404, message: 'College Not Active' });
                } else {
                    const data = {
                        collegeName: college.name,
                        collegeCode: college.code,
                        year: session.year
                    }
                    return res.status(200).json({ status: 200, message: 'Success', data: data });
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update question' });
    }
};

const getCollege = async (req, res) => {
    const { sessionId } = req.body;
    try {
        const session = await sessionModel.findOne(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session Not Found' });
        } else {
            if (session?.isActive == 0) {
                return res.status(404).json({ message: 'Session Not Active' });
            } else {
                return res.status(200).json({ message: 'Success' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update question' });
    }
};

const postCollege = async (req, res) => {
    const { questionId, category, level, a, b, c, d, answer, question } = req.body;
    try {
        const updatedQuestion = await testModel.findByIdAndUpdate(questionId, {
            category,
            level,
            a,
            b,
            c,
            d,
            answer,
            question
        }, { new: true });
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json({ status: 200, message: 'Question updated successfully', question: updatedQuestion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update question' });
    }
};

module.exports = {
    startTest,
    submitAnswers,
    fetchAnswers,
    uploadQuestions,
    getAllQuestion,
    deleteQuestion,
    updateQuestion,
    compareSession,
    // postSession,
    getCollege,
    postCollege
};