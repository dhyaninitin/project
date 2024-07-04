const bcrypt = require("bcryptjs");
const signUpModel = require("../models/sign-up.model")
const adminLoginModel = require("../models/admin.model")
const answerModel = require("../models/answer.model")
require("dotenv").config();
const config = process.env;
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await adminLoginModel.findOne({ email });
    if (existingUser) {
      if (existingUser?.password === password) {
        const payload = {
          firstname: existingUser.firstname,
          lastname: existingUser.lastname,
          email: existingUser.email,
        }
        const token = jwt.sign(payload, config.ADMIN_SECRET_KEY, { expiresIn: '1d' });
        return res.send({ status: 200, message: "Login Successfully", token: token });
      }
    } else {
      return res.send({ status: 404, message: "Invalid Credentials" });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// SIGNUP POST
const signup = async (req, res) => {
  const { firstname, lastname, email, phone, education, collegeCode, collegeName, year } = req.body;
  try {
    const existingUser = await signUpModel.findOne({ email });
    if (existingUser?.attempts > 1) {
      await signUpModel.findOneAndUpdate({ email: existingUser.email }, { $set: { attempts: existingUser?.attempts - 1 } });
      const payload = {
        userId: existingUser.userId,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        email: existingUser.email,
        phone: existingUser.phone,
        collegeCode: existingUser.collegeCode,
        collegeName: existingUser.collegeName,
        year: existingUser.year,
        attempts: existingUser.attempts,
      }
      const token = jwt.sign(payload, config.SECRET_KEY, { expiresIn: '1h' });
      return res.send({ status: 201, message: "Re-Test Allowed", token: token });
    } else if (existingUser?.attempts == 1) {
      return res.send({ status: 400, message: "No more Attemptes allowed" });
    }
    const newSignup = {
      userId: uuidv4(),
      firstname,
      lastname,
      email,
      phone,
      education,
      collegeCode,
      collegeName,
      year,
      attempts: 1,
      score: 0,
      comment: '',
      feedbackRating: 0,
      createdat: new Date(),
    };
    const token = jwt.sign(newSignup, config.SECRET_KEY, { expiresIn: '1h' });
    const userData = await new signUpModel(newSignup).save();
    delete userData.token
    res.send({ status: 200, message: "Signup successful", token: token, userData: userData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateCandidate = async (req, res) => {
  const { firstname, lastname, email, phone, attempts, collegeCode, collegeName, year, comment, feedbackRating, education } = req.body;
  try {
    const existingUser = await signUpModel.findOne({ email });
    if (existingUser) {
      await signUpModel.findOneAndUpdate({ email: existingUser.email }, { $set: req.body });
      return res.send({ status: 200, message: "Candidate Updated Successfully" });
    } else {
      return res.send({ status: 400, message: "Email Not Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const { userId } = req.query;
    let userDeleted = await signUpModel.deleteMany({ userId: userId });
    let userAnswerDeleted = await answerModel.deleteMany({ userId: userId });
    if (userDeleted && userAnswerDeleted) {
      return res.send({ status: 200, message: "Candidate Data Deleted Successfully" });
    } else {
      return res.send({ status: 400, message: "Server Error" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


const updateFeedback = async (req, res) => {
  const { comment, feedbackRating, userId } = req.body;
  try {
    await signUpModel.findOneAndUpdate({ userId: userId }, { $set: { comment: comment, feedbackRating: feedbackRating } });
    return res.send({ status: 200, message: "Feedback Submitted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getCandidates = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;
  let query = {};
  if (search) {
    query = {
      $or: [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    };
  }
  try {
    const data = await signUpModel.find(query)
      .skip(skip)
      .limit(limit);
      
    const total = await signUpModel.countDocuments(query);
    return res.json({
      status: 200,
      message: "Success",
      data: data,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalRecords: total
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getTopCandidates = async (req, res) => {
  let { page = 1, limit = 10, target, search } = req.query;
  target = parseInt(target) || 5;
  const skip = (page - 1) * limit;
  try {
    let query = { score: { $gte: target } };
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const latestData = await signUpModel.find(query)
      .skip(skip)
      .limit(parseInt(limit));
    const totalRecords = await signUpModel.countDocuments(query);
    res.json({
      status: 200,
      message: "Success",
      data: latestData,
      totalRecords: totalRecords
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  signup,
  updateFeedback,
  login,
  deleteCandidate,
  getCandidates,
  updateCandidate,
  getTopCandidates
};