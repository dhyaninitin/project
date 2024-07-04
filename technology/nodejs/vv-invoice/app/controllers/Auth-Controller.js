const signUpModel = require("../models/Signup-Model");
const otpViaEmailModel = require("../models/Otp-Via-Email-Model");
var generator = require('generate-password');
const nodemailer = require("nodemailer")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const config = process.env;

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.INVOICE_SENDING_EMAIL,
    pass: config.INVOICE_SENDING_PASSWORD,
  },
});

// SIGNUP POST
const signup = async (req, res) => {
  const { name, mobileno, email, password } = req.body;
  try {
    const existingUser = await signUpModel.findOne({ email });
    if (existingUser) {
      return res.send({ status: 400, message: "Employee already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newSignup = {
      name,
      mobileno,
      email,
      password: hash,
      base64img: null,
      generateddocumentserialno: 0,
      createdat: new Date(),
    };
    await new signUpModel(newSignup).save();
    res.send({ status: 200, message: "Signup successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// LOGIN POST
const login = (req, res) => {
  const { email, password } = req.body;
  try {
    signUpModel.findOne({ email }, function (err, response) {
      if (!response) {
        return res.send({ message: "Invalid email address" });
      }
      bcrypt.compare(password, response.password, (err, isMatch) => {
        if (err) {
          throw err;
        }
        if (!isMatch) {
          return res.send({ message: "Invalid password" });
        }
        const { name, email } = response;
        const payload = {
          id: response._id,
          name,
          email,
        };
        const token = jwt.sign(payload, config.SECRET_KEY, { expiresIn: 86400 });
        res.send({
          status: 200,
          message: `Welcome ${name}`,
          token,
        });
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// POST -> CHECK OTP
const OTP_EXPIRATION_TIME_MINUTES = 5;

const checkOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.send({ status: 400, message: 'Email and OTP are required' });
    }

    const response = await otpViaEmailModel.findOne({ email });

    if (!response) {
      return res.send({ status: 510, message: 'Invalid email address' });
    }

    const otpResult = parseInt(otp) === response.otp;

    if (otpResult) {
      const currentDate = new Date();
      const createdDate = new Date(response.createdat);

      const timeDiffInMs = currentDate.getTime() - createdDate.getTime();
      const timeDiffInMinutes = Math.floor(timeDiffInMs / (1000 * 60));

      if (timeDiffInMinutes >= OTP_EXPIRATION_TIME_MINUTES) {
        return res.send({ status: 400, message: 'OTP expired. Request a new one.' });
      }

      return res.send({ status: 200, message: 'Valid' });
    }

    return res.send({ status: 409, message: 'Invalid OTP' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};


// POST sendOtpToUserEmail
const sendOtpToUserEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const OTP = generator.generate({
      length: 6,
      numbers: true,
      symbols: false,
      lowercase: false,
      uppercase: false,
    });

    const mailDetails = {
      from: config.INVOICE_SENDING_EMAIL,
      to: email,
      subject: 'Your One Time Password from Virtuevise',
      html: `OTP: ${OTP}`,
    };

    await mailTransporter.sendMail(mailDetails);

    const existingUser = await otpViaEmailModel.findOne({ email });

    if (existingUser) {
      await otpViaEmailModel.findOneAndUpdate(
        { email },
        {
          $set: {
            otp: OTP,
            createdat: new Date()
          },
          $inc: { requestcount: 1 }
        }
      );
    } else {
      const otpViaEmailData = new otpViaEmailModel({
        email,
        otp: OTP,
        createdat: new Date(),
        requestcount: 1
      });
      await otpViaEmailData.save();
    }

    return res.send({
      status: 200,
      message: 'OTP sent! Check your email.'
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// FORGET PASSWORD POST
const forgetPassword = async (req, res) => {
  const email = req.body.email;
  try {
    const user = await signUpModel.findOne({ email });
    if (!user) {
      res.send({ status: 510, message: "Invalid email address" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      await signUpModel.findOneAndUpdate(
        { email: email },
        { $set: { password: hash, modifiedat: new Date() } }
      );
      res.send({ status: 200, message: "Password updated" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// POST -> loginThroughGoogle
const loginThroughGoogle = async (req, res) => {
  try {
    const { name, email, id } = req.body;

    let user = await signUpModel.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          googleid: id,
          name,
          email,
          loginby: "google",
          base64img: null,
          generateddocumentserialno: 0,
          createdat: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    const token = jwt.sign(payload, config.SECRET_KEY, { expiresIn: 86400 });
    res.send({
      status: 200,
      message: `Welcome ${user.name}`,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  signup,
  login,
  forgetPassword,
  loginThroughGoogle,
  checkOtp,
  sendOtpToUserEmail
};
