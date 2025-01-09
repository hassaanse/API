// routes/analyticsRouter.js
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');

router.post('/delete', userController.deleteUser);
router.put('/update', userController.updateUserById);

router.post('/create', userController.postCreateUser);


// router.post('/login' , userController.postUserLogin);


// Multer middleware for handling file uploads
const upload = require('../config/multer'); // Import your Multer configuration

// Define the POST route with file upload handling
router.post(
  '/register',
  upload.fields([
    { name: 'driverLicense', maxCount: 1 },
    { name: 'proofOfVehicle', maxCount: 1 },
    { name: 'proofOfInsurance', maxCount: 1 },
  ]),
  userController.registerUser // Controller function
);
router.post('/login', userController.login);

router.post('/forget-Password', userController.forgetpassword);

// routes/userRoutes.js

router.post('/verify-reset-code', userController.verifyResetCode);

router.get('/list', userController.getAllUsers)

module.exports = router;
