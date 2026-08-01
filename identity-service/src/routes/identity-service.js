const express = require("express");
const {
  registerUser,
  loginUser,
  refreshTokenUser,
  logoutUser,
  getCurrentUser,
} = require("../controllers/identity-controllers");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenUser);
router.post("/logout", logoutUser);
router.get("/me", getCurrentUser);

module.exports = router;
