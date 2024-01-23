const { response } = require('express');
let userModel = require('../model/user.model')
const jwt = require('jsonwebtoken')
const cloudinary = require("cloudinary")
const nodemailer = require('nodemailer');
const bcryptjs = require('bcryptjs');
const multer = require('multer')
const imageDownloader = require('image-downloader');
const dotenv = require('dotenv');
// const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const PlaceModel = require('../model/Place');
dotenv.config()
multer()



const pass = process.env.PASS;
const USERMAIL = process.env.USERMAIL;
const tokenStorage = new Map();

function generating() {
  return Math.floor(1000 + Math.random() * 9000)
}



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: USERMAIL,
    pass: pass
  }
})



const registerUser = (req, res) => {
  let form = new userModel(req.body);
  form.save()
    .then((result) => {
      console.log(result);
      res.status(200).json({ status: true, message: "User signed up successfully", result });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 11000) {
        res.status(409).json({ status: false, message: "Duplicate user found" });
      } else {
        res.status(400).json({ status: false, message: "Fill in appropriately" });
      }
    });
};

const getAllUser = (req, res) => {
  userModel.find()
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: 'Users retrieved successfully', users: result });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Error retrieving users', error: err.message });
    });
};

const getUserPlace = async (req, res) => {
  try {
    const result = await PlaceModel.find();
    console.log(result);
    res.status(200).json({message: 'Usersplace retrieved successfully', users: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: 'Error retrieving usersplace', error: err.message });
  }
};

const deleteOne = (req, res) => {
  const itemId = req.body.id; // Assuming the ID is in the URL parameter
  console.log(itemId);
  userModel.deleteOne({ _id: itemId })
    .then((result) => {
      if (result.deletedCount === 1) {
        res.status(200).json({ message: 'Item deleted successfully' });
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal server error' });
    });
};

// const updateOne = (req, res) => {
//   const itemId = req.body.id; // Assuming the ID is in the request body
//   const updatedData = req.body.data; // New data for updating the model
//   userModel.findByIdAndUpdate(itemId, updatedData, { new: true })
//     .then((updatedItem) => {
//       if (updatedItem) {
//         res.status(200).json({ message: 'Item updated successfully', updatedItem });
//       } else {
//         res.status(404).json({ error: 'Item not found' });
//       }
//     })
//     .catch((error) => {
//       res.status(500).json({ error: 'Internal server error' });
//     });
// };



const deletePlace = (req, res) => {
  const itemId = req.body.id;// Assuming the ID is in the URL parameter
console.log(itemId)
  PlaceModel.deleteOne({ _id: itemId })
    .then((result) => {
      if (result.deletedCount === 1) {
        res.status(200).json({ message: 'Item deleted successfully' });
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal server error' });
    });
};

// const updateOnePlace = (req, res) => {
//   const itemId = req.body.id; // Assuming the ID is in the request body
//   const updatedData = req.body.updatedData; // Assuming updatedData holds the fields to be updated
  
//   PlaceModel.findByIdAndUpdate(itemId, updatedData, { new: true })
//     .then((updatedItem) => {
//       if (updatedItem) {
//         res.status(200).json({ message: 'Item updated successfully', updatedItem });
//       } else {
//         res.status(404).json({ error: 'Item not found' });
//       }
//     })
//     .catch((error) => {
//       res.status(500).json({ error: 'Internal server error' });
//     });
// };




const userLogin = async (req, res) => {
  console.log(req.body);
  const { password, email } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (user) {
      const secrete = process.env.SECRET;
      user.validatePassword(password, (err, same) => {
        if (err) {
          res.status(500).json({ message: "Server error", status: false });
        } else {
          if (same) {
            const token = jwt.sign({ email }, secrete, { expiresIn: "10h" });
            console.log(token);
            res.json({ message: "User signed in successfully", status: true, token, user });
          } else {
            res.status(401).json({ message: "Wrong password, please type the correct password", status: false });
          }
        }
      });
    } else {
      res.status(404).json({ message: "Wrong email, please type the correct email", status: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", status: false });
  }
};



const getDashboard = (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const secret = process.env.SECRET;

    jwt.verify(token, secret, async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(401).json({ status: false, message: "Unauthorized access" });
      } else {
        try {
          const userDetail = await userModel.findOne({ email: result.email });
          if (userDetail) {
            res.json({ status: true, message: "Welcome to the Dashboard", userDetail });
            console.log(result);
          } else {
            res.status(404).json({ status: false, message: "User not found" });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ status: false, message: "Server error" });
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: false, message: "Bad request" });
  }
};

const password = (req, res) => {
  const { email } = req.body;
  const resetToken = generating();
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24); // Token expires in 24 hours

  tokenStorage.set(resetToken, { email, expires: expirationDate, pin: generating() });
  console.log(email);

  userModel.findOne({ email })
    .then((User) => {
      if (User === null) {
        console.log('user not found', email);
        res.status(500).json({ message: '❌ User not found', status: false })
      } else {
        console.log('✔ user found', email);
        const mailOptions = {
          from: USERMAIL,
          to: email,
          subject: 'Your OTP Code',
          text: `Your 4-digit PIN code is: ${resetToken}`,
          // html:,
        };
        return transporter.sendMail(mailOptions)
          .then((emailResult) => {
            console.log(emailResult);
            userModel.updateOne({ email }, { $set: { otp: resetToken } })
              .then(result => {
                console.log(result);
                res.status(200).json({ message: 'Email sent successful', status: true });
              }).catch(() => {
                res.status(500).json({ message: 'Error occur while updating Model', status: false });
              });
            // res.status(200).json({ message: 'Email sent successful' });
          }).catch((error) => {
            console.log(error);
            res.status(500).json({ message: 'Error occur while sending email', status: false });
          });
      }
    }).catch((err) => {
      console.log(err);
      console.error('Error in sendResetEmail:', err);
      res.status(500).json({ message: '❌ Internal server error', status: false });
    });

}




const resetPassword = (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Missing required data' });
    console.log('missig data');
  }
  console.log(email, otp, newPassword);

  userModel.findOne({ email, otp })
    .then(async (user) => {
      if (!user) {
        return res.status(500).json({ message: 'User not found' });
      }
      console.log('is ok');
      const hashPassword = await bcryptjs.hash(newPassword, 10);
      userModel.updateOne({ _id: user._id }, { password: hashPassword })
        .then(user => {
          res.status(200).json({ message: 'Password reset successful' });
          console.log('Password reset successful');
        }).catch((error) => {
          res.status(500).json({ message: 'Internal server error' });
          console.log('internal server error');
        })


    }).catch((error) => {
      console.log(error);
    })
}



const place = (req, res) => {
  let form = new PlaceModel(req.body);
  form.save()
    .then((result) => {
      console.log(result);
      res.status(200).json({ status: true, message: "Successfully added the place!", result });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 11000) {
        res.status(409).json({ status: false, message: "Place already exists!" });
      } else {
        res.status(400).json({ status: false, message: "Failed to add the place." });
      }
    });
};



const uploadLink  = async (req, res)=>{
  const {link} = req.body;
  const newName = 'photo' + Date.now() + '.jpg';
  await imageDownloader.image({
    url: link,
    dest: '/tmp/' +newName,
  });
  // const url = await uploadToS3('/tmp/' +newName, newName, mime.lookup('/tmp/' +newName));
  // res.json(url);
};




 const uploadFiles = async (req, res = response) => {
  try {
      const { owner, nameOfHost, title, address, photos, description, perks, extraInfo, maxGuests, price, bed, bath, 
       bedroom } = req.body;

      let variants = []
      if(variants?.length){
          for (let i = 0; i < variants.length; i++) {
              const element = JSON.parse(variants[i]);
              variants.push(element)    
          }
      }

      let images = []
      
     await  req.files.forEach(image => {
          images.push(image.path);
      });

      let product = new uploadFiles({
          owner,
          nameOfHost,
          title,
          address,
          photos,
          description,
          perks,
          extraInfo,
          maxGuests,
          price,
          bed,
          bath, 
          bedroom, 
      })

      product = await product.save()

      res.json({ resp: true, message : 'Product added Successfully'});

  } catch (e) {
      console.log(e.message)
      return res.status(500).json({
          resp: false,
          msg : e.message
      });
  }

}


module.exports = { registerUser, userLogin, getDashboard, password, resetPassword, place, uploadFiles, uploadLink, getAllUser, getUserPlace, deleteOne, deletePlace }