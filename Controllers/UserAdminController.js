const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../Models/UserAdmin');
const crypto = require('crypto');
require('dotenv').config();

const sendEmail = require('../utils/sendEmail')



const jwtSecret = process.env.JWT_SECRET; // Replace with environment variable
const jwtExpire = '1d';



// Sign Up
exports.signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // if (role !== 'admin') {
    //   return res.status(400).json({ error: 'Only Salespersons can sign up' });
    // }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      verified: false,
    });

    // Send verification email
    const verificationUrl = `https://thekoi.ca/backened/admin/verify-email/${verificationToken}`;
    // const verificationUrl = `http://localhost:8000/admin/verify-email/${verificationToken}`;

    await sendEmail(
      email,
      'Verify your email',
      `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`
    );

    res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.verificationToken = null; // Clear the token
    user.verified = true; // Mark the user as verified
    await user.save();

    // res.redirect('http://localhost:3000/'); // Redirect to the login page
    res.redirect('https://thekoi.ca/'); // Redirect to the login page
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.verified) return res.status(403).json({ error: 'Please verify your email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpire });
    res.json({
      token,
      id: user.id,
      username: user.name, // Assuming `username` is a field in the `User` model
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send reset password email
    const resetUrl = `https://thekoi.ca/backened/admin/reset-password/${resetToken}`;
    // const resetUrl = `http://localhost:8000/admin/reset-password/${resetToken}`;
    
    await sendEmail(
      email,
      'Reset your password',
      `<p>You requested to reset your password. Click <a href="${resetUrl}">here</a> to reset it.</p>`
    );

    res.json({ message: 'Reset password link sent to email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ where: { resetToken: token, resetTokenExpire: { [Op.gt]: Date.now() } } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
