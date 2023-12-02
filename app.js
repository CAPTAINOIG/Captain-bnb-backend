const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cloudinary = require ('cloudinary')
const dotenv = require('dotenv');
const cors = require('cors');


// Load environment variables
dotenv.config();

// Middleware setup
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));


  require('./connection/mongoose.connection')

// Router setup
let userRouter = require("./route/user.route");
app.use("/user", userRouter);

// Model setup
require('./model/user.model');
require('./model/user.model')

// Routes


cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 



  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});


app.get('/', (req, res) => {
  console.log('Hello world');
  res.send('Hello');
});

// Server setup
const PORT = process.env.PORT || 3000; // Use environment variable for port or default to 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
