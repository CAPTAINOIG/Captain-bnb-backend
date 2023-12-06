const mongoose  = require("mongoose")
const bcrypt = require ('bcryptjs')


let newSchema = new mongoose.Schema({
    firstName: {type:String, required:true},
    lastName: {type: String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    phone: {type:String,required:true},
    otp: {type:Number},
    registrationDate: {type: Date, default: Date.now()},
    date: {
        type: String,
        default: () => new Date().toLocaleDateString(), // Default value for date
      },
      time: {
        type: String,
        default: () => new Date().toLocaleTimeString(), // Default value for time
      },
      
})


let saltRounds = 10
newSchema.pre("save", function(next){
    console.log(this.password);
    bcrypt.hash(this.password, saltRounds)
    .then((response)=>{
        console.log(response);
        this.password = response
        next()
    })
    .catch((err)=>{
        console.log(err);
    })
})

newSchema.methods.validatePassword = function(password, callback) {
    bcrypt.compare(password, this.password, (err, same)=>{
        console.log(same);
        if(!err){
            callback(err, same)
        } else{
            next()
        }
    })
}

let userModel = mongoose.model("real_estate", newSchema)

module.exports = userModel



// const htmlEmail = `
//   <html>
//     <head>
//       <style>
//         /* Your CSS styles for the email */
//         body {
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//           background-color: #f4f4f4;
//           margin: 0;
//           padding: 0;
//         }
//         .container {
//           max-width: 600px;
//           margin: 20px auto;
//           padding: 20px;
//           background-color: #fff;
//           border-radius: 8px;
//           box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//         }
//         h1 {
//           color: #333;
//           text-align: center;
//         }
//         p {
//           color: #555;
//           line-height: 1.6;
//         }
//         .image-container {
//           text-align: center;
//           margin-bottom: 20px;
//         }
//         .image-container img {
//           max-width: 100%;
//           height: auto;
//           border-radius: 8px;
//         }
//         /* Add more styles as needed */
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <h1>Hello, User!</h1>
//         <p>This is a beautiful HTML email sent via Captainbnb.</p>
//         <div class="image-container">
//         <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Beautiful Image" />
//         </div>
//         <!-- Add your content here -->
//       </div>
//     </body>
//   </html>
// `;