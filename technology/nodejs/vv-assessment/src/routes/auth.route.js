const express = require("express");
const authRouter = express.Router();
const adminAuth = require('../middlewares/admin-auth.js')


const {
  login,
  signup,
  updateFeedback,
  getCandidates,
  updateCandidate,
  deleteCandidate,
  getTopCandidates
} = require('../controllers/auth.controller.js');

authRouter.post("/login", login);
authRouter.post("/sign-up", signup);
authRouter.patch("/send-feedback", updateFeedback);
authRouter.get("/get-candidates", adminAuth, getCandidates);
authRouter.patch("/update-candidate", adminAuth, updateCandidate);
authRouter.delete("/delete-candidate", adminAuth, deleteCandidate);
authRouter.get("/top-candidates", adminAuth, getTopCandidates);

module.exports = authRouter;