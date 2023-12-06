const express = require ('express')
const router = express.Router()

const {registerUser, userLogin,  getDashboard, password, resetPassword, place, uploadFiles, uploadLink, getAllUser, getUserPlace} = require('../controller/user.controller')

router.post("/signup", registerUser)
router.post("/login", userLogin)
router.post('/password', password)
router.post('/reset', resetPassword)
router.post('/place', place)
router.post('/upload', uploadFiles)
router.post('/link', uploadLink)


router.get("/dashboard", getDashboard)
router.get('/getUser', getAllUser)
router.get('/getPlace', getUserPlace)





module.exports = router
