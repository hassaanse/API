// routes/communicationsRouter.js
const express = require('express');
const router = express.Router();
const communicationsController = require('../Controllers/communicationsController');

router.get('/saved', communicationsController.getSavedCommunications);
router.post('/new', communicationsController.createCommunication);

module.exports = router;
