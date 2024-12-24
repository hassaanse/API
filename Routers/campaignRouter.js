const express = require('express');
const router = express.Router();
const campaignController = require('../Controllers/campaignController');
const upload = require('../config/multer');

// Campaign routes
router.post('/createCampaigns', campaignController.PostCreateVideoCampaigns);

router.post('/createCampaign', upload.array('videos'), campaignController.PostCreateVideoCampaigns);


router.get('/getAllCompaigns', campaignController.GetVideoCampaigns)

router.post('/deleteCompaign', campaignController.deleteVideoCampaigns)

router.post('/updateCampaignWatchTime', campaignController.updateCampaignWatchTime)

router.post('/getCampaignVideos', campaignController.getSingleVideoCampaigns)

router.get('/activecampaign', campaignController.returnactiveCampaign)


router.get('/notifications', campaignController.fetchAllNotifications);

router.post('/videowithID', campaignController.videoWithCampaignId);

module.exports = router;