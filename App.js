const express = require('express');
const app = express();
const multer = require('multer');
const cors = require('cors');
const sequelize = require('./config/database');


const campaignRouter = require('./Routers/campaignRouter');
const analyticsRouter = require('./Routers/analyticsRouter');
const communicationsRouter = require('./Routers/communicationsRouter');
const userRouter = require('./Routers/userRouter');
const AdminUser = require('./Routers/UserAdminRouter');
const path = require('path');

const Campaign = require('./Models/Campaign');
const VideoModel = require('./Models/Video');
const bodyParser = require('body-parser');
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));






// Multer configuration for handling multiple file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for each uploaded file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});


// Initialize multer with the configured storage
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use(express.json());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Update route to allow multiple file uploads
app.use('/campaign', upload.array('videos', 10), campaignRouter); // Adjusted for multiple files (maximum 10)


// Other routes
app.use('/analytics', analyticsRouter);
app.use('/communications', communicationsRouter);
app.use('/user', userRouter);
app.use('/admin', AdminUser);

// Database models and relations
const analyticsModel = require('./Models/Analytics');
const campaignModel = require('./Models/Campaign');
const viewModel = require('./Models/View');
const userModel = require('./Models/User');
const communicationModel = require('./Models/Communication');
const CampaignWatch = require('./Models/CampaignWatch');


viewModel.belongsTo(campaignModel);
viewModel.belongsTo(userModel);
campaignModel.hasMany(viewModel);
userModel.hasMany(viewModel);
communicationModel.belongsTo(userModel);
CampaignWatch.belongsTo(campaignModel, { foreignKey: 'campaignId' });
CampaignWatch.belongsTo(userModel, { foreignKey: 'userId' });
campaignModel.hasMany(CampaignWatch, { foreignKey: 'campaignWatchId' });
userModel.hasMany(CampaignWatch, { foreignKey: 'campaignWatchId' });

campaignModel.hasMany(VideoModel, { foreignKey: 'campaignId', onDelete: 'CASCADE' });
VideoModel.belongsTo(campaignModel, { foreignKey: 'campaignId' });

const PORT = process.env.PORT || 8000;




// Establish the database connection and start the server
// {force:true}
sequelize
  .sync()
  .then((result) => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Connection not established:', err);
  });
