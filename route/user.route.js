// user.routes.js

const express = require('express');
const router = express.Router();
const { registerUser, userLogin, getDashboard, password, resetPassword, place, uploadFiles, uploadLink, getAllUser, getUserPlace, deleteOne, deletePlace, editUser } = require('../controller/user.controller');
const { editPlace } = require('../controller/user.controller');

router.post("/signup", registerUser);
router.post("/login", userLogin);
router.post('/password', password);
router.post('/reset', resetPassword);
router.post('/place', place);
router.post('/upload', uploadFiles);
router.post('/link', uploadLink);
router.delete('/deleteModel', deleteOne);
router.delete('/deleteUserPlace', deletePlace);
router.put('/editPlace/:id', editPlace); // Define the route with ID parameter
router.put('/editUser/:id', editUser); // Define the route with ID parameter


router.get("/dashboard", getDashboard);
router.get('/getUser', getAllUser);
router.get('/getPlace', getUserPlace);

module.exports = router;
