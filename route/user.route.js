const express = require ('express')
const router = express.Router()

const {registerUser, userLogin,  getDashboard} = require('../controller/user.controller')

router.post("/signup", registerUser)
router.post("/login", userLogin)


router.get("/dashboard", getDashboard)



module.exports = router
