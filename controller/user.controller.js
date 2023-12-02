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




// const resetPassword = (req, res) => {
//   const { email, otp, newPassword } = req.body;
  
//   if (!email || !otp || !newPassword) {
//     // console.log('missig data');
//     console.log(email, otp, newPassword);
//     return res.status(400).json({ message: 'Missing required data' });
//   }

//   userModel.findOne({ email, otp })
//     .then(async (user) => {
//       if (!user) {
//         return res.status(500).json({ message: 'User not found' });
//       }
//       console.log('is ok');
//       const hashPassword = await bcryptjs.hash(newPassword, 10);
//       userModel.updateOne({ _id: user._id }, { password: hashPassword })
//         .then(user => {
//           res.status(200).json({ message: 'Password reset successful' });
//           console.log('Password reset successful');
//         }).catch((error) => {
//           res.status(500).json({ message: 'Internal server error' });
//           console.log('internal server error');
//         })


//     }).catch((error) => {
//       console.log(error);
//     })
// }



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


// app.post('/api/logout', (req,res) => {
//   res.cookie('token', '').json(true);
// });


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

// app.post('/api/upload-by-link', async (req,res) => {
//   const {link} = req.body;
//   const newName = 'photo' + Date.now() + '.jpg';
//   await imageDownloader.image({
//     url: link,
//     dest: '/tmp/' +newName,
//   });
//   const url = await uploadToS3('/tmp/' +newName, newName, mime.lookup('/tmp/' +newName));
//   res.json(url);
// });

// const photosMiddleware = multer({ dest: '/tmp' });

// const fileUpload = photosMiddleware.array('photos', 100);

// const uploadFiles = async (req, res) => {
//   const uploadedFiles = [];
//   for (let i = 0; i < req.files.length; i++) {
//     const { path, originalname, mimetype } = req.files[i];
//     const url = await uploadToS3(path, originalname, mimetype);
//     uploadedFiles.push(url);
//   }
//   res.json(uploadedFiles);
// };
// app.post('/api/upload', photosMiddleware.array('photos', 100), async (req,res) => {
//   const uploadedFiles = [];
//   for (let i = 0; i < req.files.length; i++) {
//     const {path,originalname,mimetype} = req.files[i];
//     const url = await uploadToS3(path, originalname, mimetype);
//     uploadedFiles.push(url);
//   }
//   res.json(uploadedFiles);
// });


// const uploadFiles = (req, res) => {
//   let image = req.body.fileUpload
//   cloudinary.v2.uploader.upload(image, (error, result) => {
//   })
//       .then((response) => {
//         let myimage = response.secure_url
//         // console.log(myimage);
//           PlaceModel.find(req.body.id, { $set: { image: req.body.myimage, status: true } })
//               .then((response) => {
//                   console.log(response);
//                   res.send({ message: "image uploaded successfully", statue: true, myimage })
//               })
//               .catch((err) => {
//                   console.log(err);
//               })

//       }).catch((err) => {
//           console.log(err);
//       })

// }



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


module.exports = { registerUser, userLogin, getDashboard, password, resetPassword, place, uploadFiles, uploadLink }