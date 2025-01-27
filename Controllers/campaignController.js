// controllers/campaignController.js
const Campaign = require('../Models/Campaign');
const Video = require('../Models/Video');
const User = require('../Models/User')
const sequelize = require('sequelize');
const { Op } = require('sequelize');
// controllers/campaignController.js
const CampaignWatch = require('../Models/CampaignWatch');
// const Video = require('../Models/Video');
const UserCampaignsStarted = require('../Models/UserCampaignsStarted');
const UserCampaignVideos = require('../Models/UserCampaignVideos');
const Location =require('../Models/location')

const axios = require('axios');

const fs = require('fs');
const path = require('path');

const UserR = require('../Models/UserR');

var admin = require("firebase-admin");

var serviceAccount = require("../thekoi-firebase-adminsdk-9le63-c9703aadce.json");

const Notification = require('../Models/Notifications');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

admin.initializeApp({
  credential: admin.credential.cert(require('../thekoi-firebase-adminsdk-9le63-c9703aadce.json')),
});






exports.videoWithCampaignId = async (req, res) => {
  const  campaignId  = req.body.campaignId;

  if (!campaignId) {
    return res.status(400).json({ error: 'campaignId is required' });
  }

  try {
    // Find all videos where campaignId matches the input
    const videos = await Video.findAll({
      where: {
        campaignId: campaignId,
      },
    });

    if (videos.length === 0) {
      return res.status(404).json({ message: 'No videos found for this campaign' });
    }

    // Return the video entries
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'An error occurred while fetching videos' });
  }
};




// const axios = require('axios');

exports.updateCampaignWatchTime = async (req, res) => {
  try {
    const { campaignId, userId, watchDuration, videoPath, Lat, Long } = req.body;

    // Find the video by its path to get the video ID
    const video = await Video.findOne({
      where: { path: videoPath },
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Find or create a record for the user starting the campaign
    let userCampaignStarted = await UserCampaignsStarted.findOne({
      where: { userId, campaignId },
    });

    let CampaignViewed = await Campaign.findOne({
      where: { campaignId },
    });

    let UserData = await UserR.findOne({
      where: { id: userId },
    });

    console.log(UserData)

    let CampaignVideoViewed = await Video.findOne({
      where: { path: videoPath },
    });


    
    if (!userCampaignStarted) {
      userCampaignStarted = await UserCampaignsStarted.create({
        userId,
        campaignId,
        watchDuration: watchDuration, // Initialize
        views: 1, // Initialize,
        
      });
    }


    let userCampaignVideo = await UserCampaignVideos.findOne({
      where: {
        userCampaignStartedId: userCampaignStarted.userCampaignStartedId,
        videoId: CampaignVideoViewed.videoId,
      },
    });



  
 


   

    setInterval(()=>{

      if (!userCampaignVideo) {
        userCampaignVideo = UserCampaignVideos.create({
          userCampaignStartedId: userCampaignStarted.userCampaignStartedId,
          videoId: CampaignVideoViewed.videoId,
          watchDuration: watchDuration, // Initialize
          views: 1,
          
        });
      }

    }, 200)
    
    // if (!userCampaignVideo) {
    //   userCampaignVideo = await UserCampaignVideos.create({
    //     userCampaignStartedId: userCampaignStarted.userCampaignStartedId,
    //     videoId: CampaignVideoViewed.videoId,
    //     watchDuration: watchDuration, // Initialize
    //     views: 1,
        
    //   });
    // }


    // UserData.views +=


    CampaignVideoViewed.watchDuration += watchDuration;
    CampaignVideoViewed.views += 1;

    CampaignViewed.watchTime += watchDuration;
    CampaignViewed.views += 1;

    UserData.watchTime += watchDuration;
    UserData.views += 1;

    // Increment the total watch time and views for the campaign
    userCampaignStarted.watchDuration += watchDuration;
    userCampaignStarted.views += 1;


     // Increment the watch time and views for this video
     userCampaignVideo.watchDuration += watchDuration;
     userCampaignVideo.views += 1;

    await CampaignVideoViewed.save();
    await CampaignViewed.save();
    await userCampaignStarted.save(); // Save the updated data

    await UserData.save();
    // Find or create a record for the user watching this specific video
    
    // Fetch city name from latitude and longitude
    const cityName = await getCityFromLatLong(Lat, Long);

    const Loc = await Location.findAll({
      where:{
        City:cityName
      }
    })

    if (Loc.City === null){
      views = 1
    }else{

    }

    if (!cityName) {
      return res.status(400).json({ error: 'Unable to fetch city name for the provided coordinates.' });
    }

    // Create a new location record
    const newLocation = await Location.create({
      ucvId:userCampaignStarted.userCampaignStartedId,
      watchDuration,
      views: 1, // Replace with actual views logic if needed
      Lat,
      Long,
      City: cityName,
      videoId:video.videoId,
      userId:UserData.id
    });

    

    await newLocation.save();

   
    await userCampaignVideo.save(); // Save the updated data

    res.status(200).json({
      success: true,
      message: 'Campaign and video watch time updated successfully',
      userCampaignStarted,
      userCampaignVideo,
    });
  } catch (error) {
    console.error('Error updating campaign and video watch time:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign and video watch time',
      error: error.message,
    });
  }
};



const getCityFromLatLong = async (lat, lon) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`;
    const response = await axios.get(url);
    
    // Check for city, town, or village in the response


    console.log('API Response:', response.data);
    
    const city = response.data.address.city || response.data.address.town || response.data.address.village  || response.data.address.municipality;

    if (!city) {
      throw new Error('City name not found in the response.');
    }

    return city; // Return the city name
  } catch (error) {
    console.error('Error fetching city name:', error.message);
    throw new Error('Unable to fetch city name.');
  }
};

exports.returnactiveCampaign = async (req,res) => {

  try{
    ActiveCampaign =  await Campaign.findOne({where:{
      Active:1
    }})

    res.status(200).json({message:'Active Campaign sent successfully', ActiveCampaign:ActiveCampaign})
  }
  catch (error) {
    console.error('Error sending active campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to to send active campaign',
      error: error.message,
    });
  }

}


exports.activateCampaign = async (req, res) => {
  const  campaignId  = req.body; // Extract campaignId from the request body

  console.log(campaignId)

  if (!campaignId) {
    return res.status(400).json({
      success: false,
      message: 'Campaign ID is required to activate a campaign.'
    });
  }

  try {
    // Find the campaign by campaignId
    const campaign = await Campaign.findOne({ where: { campaignId:campaignId.campaignId } });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.'
      });
    }

    // Update the campaign to active
    campaign.Active = true;
    await campaign.save();

    res.status(200).json({
      success: true,
      message: `Campaign with ID ${campaignId} activated successfully.`,
      campaign
    });
  } catch (error) {
    console.error('Error Activating Campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate the campaign.',
      error: error.message
    });
  }
};


exports.deactivateCampaign = async (req, res) => {
  const  campaignId  = req.body; // Extract campaignId from the request body

  if (!campaignId) {
    return res.status(400).json({
      success: false,
      message: 'Campaign ID is required to deactivate a campaign.'
    });
  }

  try {
    // Find the campaign by campaignId
    const campaign = await Campaign.findOne({ where: { campaignId:campaignId.campaignId } });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.'
      });
    }

    // Update the campaign to inactive
    campaign.Active = false;
    await campaign.save();

    res.status(200).json({
      success: true,
      message: `Campaign with ID ${campaignId} deactivated successfully.`,
      campaign
    });
  } catch (error) {
    console.error('Error Deactivating Campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate the campaign.',
      error: error.message
    });
  }
};





//////////////////////////            Post Previous Create Campaign functionality         ////////////////////////////////////////////

exports.PushNotification = async (req, res) => {
  try {
    const title = req.body.title || 'Default Title';
    const message = req.body.body || 'Default Message';

    await sendNotificationToAllDevices(title, message);

    async function sendNotificationToAllDevices(title, message) {
      try {
        const payload = {
          notification: {
            title: title,
            body: message,
          },
        };

        const tokens = await getTokensFromDatabase();
        if (tokens.length === 0) {
          console.log('No devices registered for notifications.');
          return res.status(200).json({
            success: true,
            message: 'No devices to send notifications to.',
          });
        }

        const response = await admin.messaging().sendToDevice(tokens, payload);
        console.log('Successfully sent message:', response);
        return res.status(200).json({
          success: true,
          message: 'Notification sent successfully',
          response,
        });
      } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send notification',
          error: error.message,
        });
      }
    }

    async function getTokensFromDatabase() {
      try {
        const users = await UserR.findAll({
          attributes: ['DeviceAccessToken'],
          where: {
            DeviceAccessToken: {
              [Op.ne]: null,
            },
          },
        });
        return users.map((user) => user.DeviceAccessToken);
      } catch (error) {
        console.error('Error fetching device tokens:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error Sending Notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to push the notification',
      error: error.message,
    });
  }
};



// exports.PushNotification = async (req, res) => {
//   try {


//     const title  = req.body.title;
//     const message = req.body.body;

//     sendNotificationToAllDevices(title,message)

//     async function sendNotificationToAllDevices(title, message) {
//       try {
//         const payload = {
//           notification: {
//             title: title,
//             body: message,
//           },
//         };
    
//         // Retrieve all tokens from your database
//         const tokens = await getTokensFromDatabase(); // Implement this function based on your DB schema
    
//         if (tokens.length > 0) {
//           const response = await admin.messaging().sendToDevice(tokens, payload);
//           console.log('Successfully sent message:', response);
//         } else {
//           console.log('No devices registered for notifications.');
//         }
//       } catch (error) {
//         console.error('Error sending message:', error);
//       }
//     }
    
//     // Function to be called when a new campaign is created
//     // async function onNewCampaignCreated(newCampaign) {
//     //   const title = 'New Campaign Created';
//     //   const message = `Check out our new campaign: ${newCampaign.campaignName}`;
    
//     //   await sendNotificationToAllDevices(title, message);
//     // }
    
//     // Dummy function to mimic fetching tokens from database
//     async function getTokensFromDatabase() {
//       try {
//         const users = await UserR.findAll({
//           attributes: ['DeviceAccessToken'], // Only select the DeviceAccessToken field
//           where: {
//             DeviceAccessToken: {
//               [sequelize.Op.ne]: null, // Ensure token is not null
//             },
//           },
//         });
    
//         const tokens = users.map(user => user.DeviceAccessToken);
//         return tokens;
//       } catch (error) {
//         console.error('Error fetching device tokens:', error);
//         throw error;
//       }
//       // Replace this with actual code to fetch tokens from your database
      
//     }





  

//   } catch (error) {
//     console.error('Error Sending  Notificaion:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to Push the Notificaiton',
//       error: error.message,
//     });
//   }
// };


////////////////////////////////////////////////////////////////////////////////////////////////////


exports.PostCreateVideoCampaigns = async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    const { campaignName, description, endDate, tags, videoOrder } = req.body;
    const parsedOrder = JSON.parse(videoOrder); // Parse the video order JSON

    // Create a new campaign
    const newCampaign = await Campaign.create({
      campaignName,
      description,
      endDate,
      tags,
    });

    // Loop through each file and create a video entry
    for (const file of req.files) {
      const fileOrder = parsedOrder.find((o) => o.file === file.originalname);

      // Create a video associated with the campaign
      await Video.create({
        path: file.path, // Store the file path
        campaignId: newCampaign.campaignId, // Associate with the campaign
        order: fileOrder ? fileOrder.order : 0, // Default order if not provided
        totalDuration: fileOrder ? fileOrder.totalDuration : 0, // Example duration field
      });
    }

    // Retrieve all videos associated with the campaign, ordered by 'order'
    const videosGET = await Video.findAll({
      where: { campaignId: newCampaign.campaignId },
      order: [['order', 'ASC']],
    });

    console.log('Videos Created:', videosGET);

    res.status(201).json({
      message: 'Campaign and videos created successfully!',
      campaign: newCampaign,
      videos: videosGET,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Error creating campaign', error: error.message });
  }
};





exports.getSingleVideoCampaigns = async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({ success: false, message: 'Campaign ID is required' });
    }

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const videos = await Video.findAll({ where: { campaignId } });
    const urls = videos.map(video => `https://yourdomain.com/${video.path}`);

    res.status(200).json({
      success: true,
      campaign,
      videos: urls,
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch campaign', error: error.message });
  }
};


// Route to retrieve all video campaigns

exports.GetVideoCampaigns =  async (req, res) => {
  try {
    // Retrieve all campaigns from the database
    const campaigns = await Campaign.findAll();
    
    // Respond with the list of campaigns
    res.status(200).json(campaigns);
  } catch (error) {
    // If an error occurs, respond with an error message
    console.error('Error retrieving video campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve video campaigns',
      error: error.message
    });
  }
};

// Route to retrieve a single video campaign by ID
exports.getSingleVideoCampaigns = async (req, res) => {
  try {
    // Extract campaign ID from the request parameters
    const  campaignId  = req.body.campaignId; // Assuming campaignId is passed as a URL parameter

    // Find the campaign by ID in the database
    const campaign = await Campaign.findByPk(campaignId);

    // If campaign with given ID doesn't exist, return error
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Video campaign not found'
      });
    }

    // Find videos associated with the campaign
    const videos = await Video.findAll({ where: { campaignId: campaignId } });

    // Construct URLs for the videos
    let urls = videos.map(video => 'https://thekoi.ca/api/' + video.path);

    // Respond with the campaign and URLs
    res.status(200).json({
      success: true,
      campaign,
      urls
    });
  } catch (error) {
    // If an error occurs, respond with an error message
    console.error('Error retrieving video campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve video campaign',
      error: error.message
    });
  }
};



// Route to update a video campaign by ID
exports.putUpdateVideoCampaign = async (req, res) => {
  try {
    // Extract campaign ID from the request parameters
    const {campaignId} = req.body;

    // Extract updated data from the request body
    const { campaignName, video, description, tags, endDate } = req.body;

    // Find the campaign by ID in the database
    const campaign = await Campaign.findById(campaignId);

    // If campaign with given ID doesn't exist, return error
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Video campaign not found'
      });
    }

    // Update campaign data
    campaign.campaignName = campaignName;
    campaign.video = video;
    campaign.description = description;
    campaign.views = views;

    // Save the updated campaign data
    await campaign.save();

    // Respond with success message
    res.status(200).json({
      success: true,
      message: 'Video campaign updated successfully',
      campaign
    });
  } catch (error) {
    // If an error occurs, respond with an error message
    console.error('Error updating video campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video campaign',
      error: error.message
    });
  }
};

// Route to delete a video campaign by ID
// exports.deleteVideoCampaigns = async (req, res) => {
//   try {
//     // Extract campaign ID from the request parameters
//     const {campaignId} = req.body;

//     // Find and delete the campaign by ID in the database
//     const deletedCampaign = await Campaign.findByPkAndDelete(campaignId);

//     // If campaign with given ID doesn't exist, return error
//     if (!deletedCampaign) {
//       return res.status(404).json({
//         success: false,
//         message: 'Video campaign not found'
//       });
//     }

//     // Respond with success message
//     res.status(200).json({
//       success: true,
//       message: 'Video campaign deleted successfully'
//     });
//   } catch (error) {
//     // If an error occurs, respond with an error message
//     console.error('Error deleting video campaign:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete video campaign',
//       error: error.message
//     });
//   }
// };


exports.deleteVideoCampaigns = async (req, res) => {
  try {
    // Extract campaign ID from the request body
    const { campaignId } = req.body;

    // Find the campaign by ID
    const campaign = await Campaign.findByPk(campaignId);

    // If campaign not found, return error
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Video campaign not found',
      });
    }

    // Find all videos associated with the campaign
    const videos = await Video.findAll({
      where: { campaignId },
    });

    // Delete video files from the upload directory
    for (const video of videos) {
      const filePath = path.resolve(video.path); // Resolve full path
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file
        console.log(`Deleted file: ${filePath}`);
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    }

    // Delete videos from the video table
    await Video.destroy({
      where: { campaignId },
    });

    // Delete the campaign
    await Campaign.destroy({
      where: { campaignId: campaignId },
    });

    // Respond with success message
    res.status(200).json({
      success: true,
      message: 'Video campaign and associated videos deleted successfully',
    });
  } catch (error) {
    // If an error occurs, respond with an error message
    console.error('Error deleting video campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video campaign',
      error: error.message,
    });
  }
};



// Controller function to fetch all notifications
exports.fetchAllNotifications = async (req, res) => {
  try {
    const { userId } = req.query; // Assume userId can be passed as a query parameter

    let notifications;

    if (userId) {
      // Fetch user-specific notifications
      notifications = await Notification.findAll({
        where: {
          [Op.or]: [
            { type: 'general' }, // General notifications
            { type: 'user-specific', userId: userId } // User-specific notifications for this user
          ]
        },
        order: [['createdAt', 'DESC']] // Order by creation date, latest first
      });
    } else {
      // Fetch only general notifications if no userId is provided
      notifications = await Notification.findAll({
        where: {
          type: 'general'
        },
        order: [['createdAt', 'DESC']]
      });
    }

    res.status(200).json({
      success: true,
      notifications: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};