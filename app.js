const express = require ('express')
const app = express()
const bodyParser = require ('body-parser')
const dotenv = require ('dotenv')
const cors = require ('cors')
// const mongoose = require ('mongoose')
let userRouter = require("./route/user.route")



dotenv.config()

app.use(cors())
app.use(express.json({limiit:"50mb"}))
app.use(bodyParser.urlencoded({extended:true}))


require('./connection/mongoose.connection')
app.use("/user", userRouter)

require('./model/user.model')





app.get('/', (req,res)=>{
    console.log('hello world');
    res.send('hello')
})

app.listen("3000", ()=>{
    console.log("You are connected");
})