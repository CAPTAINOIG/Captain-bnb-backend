const express = require ('express')
const router = express.Router()

const {registerUser, userLogin,  getDashboard, password, resetPassword, place, uploadFiles, uploadLink, getAllUser, getUserPlace, deleteOne, deletePlace} = require('../controller/user.controller')


router.post("/signup", registerUser)
router.post("/login", userLogin)
router.post('/password', password)
router.post('/reset', resetPassword)
router.post('/place', place)
router.post('/upload', uploadFiles)
router.post('/link', uploadLink)
router.delete('/deleteModel', deleteOne)
router.delete('/deleteUserPlace', deletePlace)



// router.put('/updateModel', updateOne)
// router.put('/update', updateOnePlace)



router.get("/dashboard", getDashboard)
router.get('/getUser', getAllUser)
router.get('/getPlace', getUserPlace)





module.exports = router
