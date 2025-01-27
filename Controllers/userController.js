// controllers/userController.js

const  User  = require('../Models/User'); // Assuming your User model is defined in a file called models.js
const UserCampaignVideos = require('../Models/UserCampaignVideos');
const UserCampaignsStarted = require('../Models/UserCampaignsStarted');

const UserR = require('../Models/UserR')

const nodemailer = require('nodemailer');

const { Op } = require('sequelize'); // Import Sequelize operators


const crypto = require('crypto');
const jwt = require('jsonwebtoken');

exports.deleteUser = async (req, res) => {
  const { id } = req.body; // Extract the user id from the request body

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required to delete a user.'
    });
  }

  try {
    // Find the user by id and delete
    const user = await UserR.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Delete the user
    await user.destroy();

    res.status(200).json({
      success: true,
      message: `User with ID ${id} deleted successfully.`
    });
  } catch (error) {
    console.error('Error Deleting User:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete the user.',
      error: error.message
    });
  }
};



const bcrypt = require('bcrypt');
// const { User } = require('../models');

exports.registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      number,
      country,
      city,
      address,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      DeviceAccessToken
    } = req.body;

    // Hash the password using bcrypt
    const saltRounds = 10; // Number of salt rounds for hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Get file paths from Multer (after handling file uploads)
    const driverLicensePath = req.files['driverLicense'][0].path || 0;
    const proofOfVehiclePath = req.files['proofOfVehicle'][0].path || 0;
    const proofOfInsurancePath = req.files['proofOfInsurance'][0].path || 0;

    if(driverLicensePath === 0){
      res.status('404').json({message:'Driver licence PDF is not found!'})
    }

    if(proofOfVehiclePath === 0){
      res.status('404').json({message:'Vehicle Proof PDF is not found!'})
    }
    
    if(proofOfInsurancePath === 0){
      res.status('404').json({message:'Proof of Insurance PDF is not found!'})
    }
    

    // Create a new user in the database with the hashed password
    const newUser = await UserR.create({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Store the hashed password
      number,
      country,
      city,
      address,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      driverLicensePath,
      proofOfVehiclePath,
      proofOfInsurancePath,
      DeviceAccessToken
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed, Please provide all the pdf documents ',
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const Users = await UserR.findAll(); // Added parentheses to invoke the function

    res.status(200).json({
      success: true,
      message: 'Users are sent successfully',
      users: Users // Changed "User" to "users" for better clarity and consistency
    });
  } catch (error) { // Added error parameter in catch block
    console.error('Error Sending Users:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to fetch users data',
      error: error.message // Added error.message to provide more details about the error
    });
  }
};



exports.updateUserById = async (req, res) => {
  try {
    // Extract user ID from the request parameters

    // Extract updated data from the request body
    const {userId,  userName, userEmail, location, Type, password } = req.body;

    // Find the user by ID in the database
    const user = await User.findByPk(userId);

    // If user with given ID doesn't exist, return error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user data
    user.userName = userName;
    user.userEmail = userEmail;
    user.location = location;
    user.Type = Type;
    user.password = password;

    // Save the updated user data
    await user.save();

    // Respond with success message
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    // If an error occurs, respond with an error message
    console.error('Error updating user:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update user, make sure to provide all pdf documents',
      error: error.message
    });
  }
};


exports.postCreateUser = async (req, res) => {
  try {
      // Extract data from the request body
      const { userName, userEmail, location, password } = req.body;

      const Type = 'admin';

      console.log(userName + '  ' + userEmail + '  ' + location + '  ' + password);

      // Create a new user in the database
      const newUser = await User.create({
          userName,
          userEmail,
          location,
          Type,
          password
      });

      // Respond with the newly created user
      res.status(201).json({
          success: true,
          message: 'User created successfully',
          user: newUser
      });
  } catch (error) {
      // If an error occurs, respond with an error message
      console.error('Error creating user:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to create user',
          error: error.message
      });
  }
};


exports.postUserLogin = async (req, res) => {
  try {
    // Extract username and password from the request body
    const { username, password, useremail } = req.body;

    // Find the user by username and password in the database
    const user = await User.findOne({
      where: {
        [Op.or]: [
          username ? { userName: username } : undefined, // Include userName condition only if userName is defined
          useremail ? { userEmail: useremail } : undefined, // Include userEmail condition only if userEmail is defined
        ].filter(Boolean), // Remove null values from the array
        password: password,
        Type: 'admin'
      }
    });
    // If user not found or password incorrect, return error
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // User found, return user data
    return res.status(200).json({ success: true, user });
  } catch (error) {
    // If an error occurs, respond with an error message
    console.error('Error logging in user:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const DeviceAccessToken = req.body.DeviceAccessToken;
    

    console.log(email,password);
    // Find user by email
    const user = await UserR.findOne({ where: { email:email } })

    user.DeviceAccessToken = DeviceAccessToken;



    console.log(user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.DeviceAccessToken = DeviceAccessToken;

    await user.save();


    const userCampaigns = await UserCampaignsStarted.findAll({
      where: { userId:user.id },
      attributes: ['views', 'watchDuration'],
    });

    // Calculate the total views and watch duration
    let totalViews = 0;
    let totalWatchDuration = 0;

    userCampaigns.forEach(campaign => {
      totalViews += campaign.views;
      totalWatchDuration += campaign.watchDuration;
    });

    const totalCampaigns = await UserCampaignsStarted.count({
      where: { userId:user.id },
    });

    // 6



    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);


    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials' });
    }

    // Optional: Generate a JWT token for the user
    

    res.status(200).json({
      success: true,
      message: 'Login successful', userId:user.id, firstName:user.firstName, lastName:user.lastName, userViews:totalViews,usersWatchtime:totalWatchDuration,userCampaigns:totalCampaigns, userDeviceToken:user.DeviceAccessToken
      // UserCampaignVideos:totalCampaignsVideos
     
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};


exports.forgetpassword = async (req, res) => {
  const email = req.body.email;
  if (!email) {
      return res.status(400).send('Email is required');
  }

  const user = await UserR.findOne({ where: { email } });
  if (!user) {
      return res.status(400).send('User not found');
  }

  // Generate a verification code
  const verificationCode = crypto.randomBytes(3).toString('hex'); // Generates a 6-digit code
  const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

  // user.resetToken = hashedVerificationCode;
  user.resetToken = verificationCode;

  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();

  const transporter = nodemailer.createTransport({
    host: 'smtp.allforexstocks.com',
    port: 465,
    secure: true,
    auth: {
      user: 'admin@allforexstocks.com',
      pass: 'hassaanse120.',
    },
    logger: true,
    debug: true,
  });

  const mailOptions = {
    from: 'admin@allforexstocks.com',
    to: email,
    subject: 'Password Reset Verification Code',
    text: `Your password reset verification code is: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email');
    }
    res.status(200).send('Verification code sent to your email');
  });
};


exports.verifyResetCode = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  if (!email || !verificationCode || !newPassword) {
      return res.status(400).send('Email, verification code, and new password are required');
  }

  const user = await UserR.findOne({ where: { email } });
  if (!user) {
      return res.status(400).send('User not found');
  }

  if (Date.now() > user.resetTokenExpiry) {
      return res.status(400).send('Verification code expired');
  }

  const verification_code_hash = await bcrypt.hash(verificationCode,10)

  console.log('verificcation code hash : ', verification_code_hash )
  console.log('user.resettoken hash is : ', user.resetToken)

  // const isCodeValid = await bcrypt.compare(verificationCode, user.resetToken);
  if (verificationCode !== user.resetToken) {
      return res.status(400).send('Invalid verification code');
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password
  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.status(200).send('Password has been reset successfully');
};
