// routes/analyticsRouter.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../Controllers/analyticsController');

// router.get('/campaigns/views', analyticsController.getCampaignViews);
// router.get('/campaigns/users', analyticsController.getCampaignUsers);
// router.get('/users/views', analyticsController.getUserViews);
// router.get('/campaigns/location', analyticsController.getCampaignLocation);
// router.get('/views/location', analyticsController.getLocationViews);
// router.get('/users/location', analyticsController.getUserLocation);
router.get('/users/usertable', analyticsController.getUserTable);
// router.get('')
router.get('/TotalViewsAllCampain', analyticsController.getTotalCampaignData);

// router.get('/CampaignsWithUsers', analyticsController.getCampaignsWithUsers);
// router.get('/Views' , analyticsController.getViewsByLocation);
// router.get('/getUsersByLocation' , analyticsController.getUsersByLocation);
// router.post('/postStartDate', analyticsController.getStartDate);


module.exports = router;
