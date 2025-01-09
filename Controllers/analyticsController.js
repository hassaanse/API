

const Campaign = require('../Models/Campaign');
const AnalyticsData = require('../Models/AnalyticsData');
const UserR = require('../Models/UserR')
const CampaignWatch = require('../Models/CampaignWatch')
const sequelize = require('sequelize')
const {Op} = require('sequelize')
const moment = require('moment');

const Videos = require('../Models/Video');

const UserCampaignsStarted = require('../Models/UserCampaignsStarted')

const UserCampaignVideos = require('../Models/UserCampaignVideos')


const Location = require('../Models/location')






exports.getTotalCampaignData = async (req, res) => {
    try {
      // Query to calculate the sum of views from all campaigns
      const totalViews = await Videos.sum('views');
  
      // Query to count the total number of campaigns
      const totalCampaigns = await Campaign.count();
  
      const totalWatchTime = await Campaign.sum('watchTime');
  
      const CampaignViewsData = await Campaign.findAll({
        attributes: ['campaignName', 'views']
      });
  
      const UserViewsData = await UserR.findAll({
        attributes:['id','firstName','lastName', 'views']
      });
  
      const locations = await Location.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('City')), 'City']]
      });
  
      // const locationNames = locations.map(location => location.location);
  
      const totalLocations = locations.length;
  
      const CampaignViews = CampaignViewsData.map(item => [item.campaignName, item.views]);
  
      const UserViews = UserViewsData.map(item => [item.firstName+' '+item.lastName, item.views]);
      
      const campaignWatchData = await CampaignWatch.findAll({
        attributes: ['campaignId', 'userId']
      });
  
      const campaignWatches = await CampaignWatch.findAll();
  
      // const userIdsSet = new Set(campaignWatches.map(campaignWatch => campaignWatch.userId));
      // const uniqueUserIds = Array.from(userIdsSet);
      // const totalUsersRunningCampaign = uniqueUserIds.length;
  
      // const compaignIdsSet = new Set(campaignWatches.map(campaignWatch => campaignWatch.campaignId));
      // const uniqueCampaignIds = Array.from(compaignIdsSet);
      // const totalCampaignsRunningUsers = uniqueCampaignIds.length;


      const campaignsWithViews = await Campaign.findAll({
        where: {
          views: { [Op.gt]: 0 }, // Only campaigns with views > 0
        },
      });


      const totalCampaignsRunningUsers = campaignsWithViews.length;




      const usersWithViews = await UserR.findAll({
        where: {
          views: { [Op.gt]: 0 }, // Only users with views > 0
        },
      });


      const totalUsersRunningCampaign = usersWithViews.length;
  
      const counts = {};

  
  
      for (const { campaignId, userId } of campaignWatches) {
        const key = `${campaignId}_${userId}`;
        counts[key] = (counts[key] || 0) + 1;
      }
  
      const uniqueStrings = new Set();
      
      
  
      const Locations = await Location.findAll({
        attributes: [
          'City',
          [sequelize.fn('SUM', sequelize.col('views')), 'Views'], // Sum of views for each city
        ],
        group: ['City'], // Group by city
        order: [[sequelize.col('Views'), 'DESC']], // Order by total views (optional)
        raw: true, // Return raw data
      });

      console.log(Locations)

      const locationViews = await Location.findAll({
        attributes: [
          'City',
          [sequelize.fn('SUM', sequelize.col('Location.views')), 'totalViews']
        ],
        include: [
          {
            model: Videos,
            attributes: [] // Exclude Video attributes
          }
        ],
        group: ['City']
      });


      const LocationVSviews = [];
      locationViews.forEach(row => {
        LocationVSviews.push([row.get('City'), row.get('totalViews') || 0]); // Default to 0 if null
      });
  

      const LV = Locations.map((loc) => [loc.City, loc.Views]);

      // console.log(LocationVSviews)
  
      // const formattedViewsByLocation = viewsByLocation.map(locationData => ([
      //   locationData.City,
      //   Number(locationData.dataValues.Views)
      // ]));
  
      const registeredUsersByLocation = await Location.findAll({
        attributes: [
          'city',
          [sequelize.fn('count', sequelize.col('City')), 'registeredUsers']
        ],
        group: ['city']
      });

      console.log("Registered Users:  ", registeredUsersByLocation)



      
      //////////////////////////

  
      const activeUsersByLocation = await Location.findAll({
        attributes: [
          'City',
          [sequelize.fn('count', sequelize.literal('DISTINCT "id"')), 'activeUsers']
        ],
        where: {
          views: {
            [Op.gt]: 1
          }
        },
        group: ['city']
      });

   ////////////////////////
      const userCountByLocation = await Location.findAll({
        attributes: ['City', [sequelize.fn('COUNT', sequelize.col('userId')), 'userCount']],
        include: [{ model: UserR, attributes: [] }],
        group: ['City'],
      });
      
      const LocationVSusers = [];
      userCountByLocation.forEach(row => {
        LocationVSusers.push([row.get('City'), row.get('userCount')]);
      });

      console.log(LocationVSusers);

   ///////////////////////


   const campaignsByLocation = await Location.findAll({
    attributes: [
      'City', // Grouping by City
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Video->Campaign.campaignId'))), 'totalCampaigns'] // Count distinct campaign IDs
    ],
    include: [
      {
        model: Videos,
        attributes: [], // Exclude Video attributes
        include: [
          {
            model: Campaign,
            attributes: [] // Exclude Campaign attributes
          }
        ]
      }
    ],
    group: ['City'] // Group by City
  });

  const LocationVScampaigns =    [];
  campaignsByLocation.forEach(row => {
    LocationVScampaigns.push([row.get('City'), row.get('totalCampaigns')]);
  });


    console.log(LocationVScampaigns)


    //////////////////////////

    console.log("Active Users By location  :  ", activeUsersByLocation)
  



       
      const formattedData =   registeredUsersByLocation.map(regData => {
        const location = regData.City;
        const registeredUsers = regData.dataValues.registeredUsers;
        const matchingActive = activeUsersByLocation.find(actData => actData.location === location);
        const activeUsers = matchingActive ? matchingActive.dataValues.activeUsers : 0;
        return [location, activeUsers, registeredUsers];
      });

      

      
      // Store data in the AnalyticsData table
      const currentDates = moment().format('YYYY-MM-DD');
      console.log(typeof(currentDates));
      console.log(currentDates);
      let currentDate = currentDates
  
      // Check if there is already a record for the current date
      let analyticsData = await AnalyticsData.findOne({
        where: {
          currentDate: currentDate
        }
      });

      // const result = [];

      // console.log(campaignWatchData)
  
      // for (const { campaignId, userId } of campaignWatchData) {
      //   const campaign = await Campaign.findOne({
      //     where: { campaignId },
      //     attributes: ['campaignName'],
      //   });
      
      //   const user = await UserR.findOne({
      //     where: { id },
      //     attributes: ['firstName', 'lastName'],
      //   });
        
      //   console.log(campaign)
      //   console.log(user)

      //   console.log('Campaign:', campaign ? campaign.campaignName : 'Not found', 'User:', user ? user.userName : 'Not found');
      
      //   if (campaign && user) {
      //     const concatenatedString = campaign.campaignName + ' - ' + user.firstName;
      //     if (!uniqueStrings.has(concatenatedString)) {
      //       uniqueStrings.add(concatenatedString);
      //       result.push([concatenatedString, counts[`${campaignId}_${userId}`]]);
      //     }
      //   }
      // }
      // // console.log(campaign)
      // console.log(result);

      // const result = [];
      // // const uniqueStrings = new Set();
  
      // console.log('Fetching user campaigns...');
      // const userCampaigns = await UserCampaignsStarted.findAll({
      //   limit: 100, // Limit the number of records fetched
      //   include: [
      //     {
      //       model: Campaign,
      //       attributes: ['campaignName'],
      //     },
      //     {
      //       model: UserR,
      //       attributes: ['firstName', 'lastName'],
      //     },
      //   ],
      // });
  
      // console.log('Processing campaigns...');
      // for (const userCampaign of userCampaigns) {
      //   const { campaignId, userId, Campaign: campaign, UserR: user } = userCampaign;
  
      //   console.log('Campaign:', campaign?.campaignName || 'Not found');
      //   console.log('User:', user ? `${user.firstName} ${user.lastName}` : 'Not found');
  
      //   if (campaign && user) {
      //     const concatenatedString = `${campaign.campaignName} - ${user.firstName}`;
      //     if (!uniqueStrings.has(concatenatedString)) {
      //       uniqueStrings.add(concatenatedString);
      //       const countKey = `${campaignId}_${userId}`;
      //       result.push([concatenatedString, counts[countKey] || 0]);
      //     }
      //   }
      // }


      // const uniqueStrings = new Set();
    const result = [];

    // Fetch all required data at once
    const userCampaignsStarted = await UserCampaignsStarted.findAll({
      include: [
        {
          model: Campaign,
          attributes: ['campaignName'], // Fetch campaignName
        },
        {
          model: UserR,
          attributes: ['firstName', 'lastName'], // Fetch firstName and lastName
        },
      ],
    });

    // Process each user-campaign relationship
    for (const userCampaign of userCampaignsStarted) {
      const { Campaign: campaign, UserR: user, campaignId, userId } = userCampaign;

      // Skip if either campaign or user data is missing
      if (!campaign || !user) continue;

      const concatenatedString = `${campaign.campaignName} - ${user.firstName}`;

      if (!uniqueStrings.has(concatenatedString)) {
        uniqueStrings.add(concatenatedString);

        // Count entries for this campaign-user combination
        const count = await UserCampaignsStarted.count({
          where: { campaignId, userId },
        });

        result.push([concatenatedString, count]);
      }
    }

      
  
      if (analyticsData) {
        // If a record for the current date exists, update the existing record
        await analyticsData.update({
          totalViews: totalViews || 0,
          totalCampaigns: totalCampaigns || 0,
          totalWatchTime: totalWatchTime || 0,
          totalLocations: totalLocations || 0,
          totalCampaignsRunningUsers: totalCampaignsRunningUsers || 0,
          totalUsersRunningCampaign: totalUsersRunningCampaign || 0,
          CampaignViews: CampaignViews || 0,
          CampaignUsers: result || 0,
          UserViews: UserViews || 0,
          LocationVSviews: LocationVSviews || 0,
          LocationVSusers: LocationVSusers || 0,
          LocationVScampaigns: LocationVScampaigns || 0
          // viewsByLocation: viewsByLocation || 0,
          // usersVsLocation: formattedData || 0
        });
      } else {
        // If there is no record for the current date, create a new record
        await AnalyticsData.create({
          currentDate: currentDate,
          totalViews: totalViews || 0,
          totalCampaigns: totalCampaigns || 0,
          totalWatchTime: totalWatchTime || 0,
          totalLocations: totalLocations || 0,
          totalCampaignsRunningUsers: totalCampaignsRunningUsers || 0,
          totalUsersRunningCampaign: totalUsersRunningCampaign || 0,
          CampaignViews: CampaignViews || 0,
          CampaignUsers: result || 0,
          UserViews: UserViews || 0,
          LocationVSviews: LocationVSviews || 0,
          LocationVSusers: LocationVSusers || 0,
          LocationVScampaigns: LocationVScampaigns || 0
          // viewsByLocation: viewsByLocation || 0,
          // usersVsLocation: formattedData || 0
        });
      }
  
      // Respond with the total views and total number of campaigns
      res.status(200).json({
        success: true,
        totalViews: totalViews || 0,
        totalCampaigns: totalCampaigns || 0,
        totalWatchTime: totalWatchTime || 0,
        totalLocations: totalLocations || 0,
        totalCampaignsRunningUsers: totalCampaignsRunningUsers || 0,
        totalUsersRunningCampaign : totalUsersRunningCampaign || 0,
        CampaignViews: CampaignViews || 0,
        CampaignUsers: result || 0,
        UserViews: UserViews || 0,
        LocationVSviews: LocationVSviews || 0,
        LocationVSusers: LocationVSusers || 0,
        LocationVScampaigns: LocationVScampaigns || 0
        // viewsByLocation: viewsByLocation || 0,
        // usersVsLocation: formattedData || 0, 
        // userCountByLocation
      });
    } catch (error) {
      console.error('Error fetching total campaign data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch total campaign data',
        error: error.message
      });
    }
  };


  exports.getUserTable = async (req, res, next) => {
    try {
      const users = await UserR.findAll({
        attributes: [
          'id',
          'userName',
          'userEmail',
          'location',
          'createdAt',
          [sequelize.fn('COUNT', sequelize.col('Campaigns.campaignId')), 'campaignCount']
        ],
        include: [{
          model: Campaign,
          as: 'Campaigns',
          attributes: [],
          required: false
        }],
        group: ['User.userId']
      });
  
      // Access the result here
      users.forEach(user => {
        console.log(`User ID: ${user.userId}`);
        console.log(`Name: ${user.userNname}`);
        console.log(`Location: ${user.location}`);
        
        console.log(`Number of Campaigns: ${user.campaignCount}`);
        console.log("------------------------------------------");
      });
  
      return res.status(200).json(users);
    } catch (error) {
      // Handle errors here
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  