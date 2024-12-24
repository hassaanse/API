// controllers/communicationsController.js
const Communication = require('../Models/Communication');

exports.getSavedCommunications = async (req, res) => {
  try {
    const savedCommunications = await Communication.findAll();
    res.status(200).json(savedCommunications);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};

exports.createCommunication = async (req, res) => {
  try {
    const { message, location } = req.body;
    const newCommunication = await Communication.create({ message, location });
    res.status(201).json(newCommunication);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};
