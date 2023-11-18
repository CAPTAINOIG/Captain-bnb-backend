const { response } = require('express');
let userModel = require('../model/user.model')
const jwt = require ('jsonwebtoken')


const registerUser = (req,res)=>{
    let form = new userModel(req.body)
    form.save()
    .then((result)=>{
        console.log(result);
        // res.status(200).json({message:"user signed up successfully", result})
        res.send({status:true,  message:"user signed up successfully", result})
    })
    .catch((err)=>{
        console.log(err);
        if(err == 11000){
            res.send({status:false,  message:"Duplicate user found"})
        // return res.status(400).json({message:"Duplicate user found"})
        } else{
            res.send({status:false, message:"fill in appropriately"})
        }

    })
}

const userLogin = async (req, res) => {
    console.log(req.body);
    let { password, email } = req.body
    userModel.findOne({ email: req.body.email })
        .then((user) => {
            if (user) {
                let secrete = process.env.SECRET
                // res.send({message:"email exist", status:true})
                user.validatePassword(password, (err, same) => {
                    // res.send({message:"email exist", stat us:true})
                    if (err) {
                        res.send({ message: "server error", status: false })
                        // return res.status(500).json({message: "Internal server error"})
                    }
                    else {
                        if (same) {
                            let token = jwt.sign({ email }, secrete, { expiresIn: "10h" })
                            console.log(token);
                            res.send({ message: "User Signed in Successfully", status: true, token, user })
                        } else {
                            res.send({ message: "Wrong password, please type the correct password", status: false })
                        }
                    }
                })
            } else {
                res.send({ message: "wrong email, please type the correct email", status: false })

            }
        })
        .catch((err) = {
            if(err) {
                res.send({ message: "server error", status: false })
                        // return res.status(500).json({message: "Internal server error"})
                console.log(err);

            }
        })
}


const getDashboard = (req, res)=>{
    let token = (req.headers.authorization.split(" ")[1]);
    let secret = process.env.SECRET
    jwt.verify(token, secret, (err, result)=>{
        if(err){
            console.log(err);
            res.send({status:false, message: "error"})
        }
        else{
            userModel.findOne({email: result.email})
            .then((userDetail)=>{
                // res.status(200).json(result)
                res.send({status:true, message: "Welcome to the Dashboard", userDetail})
                console.log(result);
            })
        }
    })
    
}

module.exports = {registerUser, userLogin, getDashboard}