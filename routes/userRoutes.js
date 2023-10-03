const express = require("express");
const userController = require('../Controller/userController')
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const axios = require("axios")

router.use(express.static(__dirname + "../../front-end/client/src/components/ErrorPage"));
router.use('/error', express.static('./src/components'))  

router.use((req, res) => {
  res.status(404).sendFile(__dirname + "/error/ErrorPage.js");
});

router.use((req, res) => {
  res.status(404).sendFile(__dirname + "../../front-end/client/src/components/ErrorPage.js");
});

router.post('/edit-user-profile', auth, userController.edituser);

router.post('/resend-otp', userController.resendotp);

router.post("/register", userController.register)

router.post("/login", userController.login)

router.post('/otpVerification', userController.otpVerification)

router.post('/forgotPassword', userController.forgotPassword);

router.post('/resetPassword', userController.resetPassword);

router.post("/get-user-info-by-id", auth, userController.getuserinfo)



router.post("/uploadImage", auth, userController.uploadimage)

router.post("/banners", userController.loadBanner)

router.post('/projects', userController.projectsShowing)

router.post('/project-details/:projectId', auth, userController.ProjectSingle)

router.post('/companies', userController.companies)

router.post('/company-details/:companyId', auth, userController.companySingle);

router.post('/appointmentbooking/:companyId', auth, userController.appointmentbooking)



router.post('/datasss', auth, userController.datas)

router.get('/user-data', auth, userController.userData)

router.patch('/edit-user-data', auth, userController.userDataEdit)

router.post("/order", auth, userController.advancePayment);

router.post("/bookorder", auth, userController.bookDeal);

router.post('/appointments', auth, userController.appointmentlists)

router.post('/services', userController.Services)

router.post('/getuserId' , auth , userController.getsenderId)

router.post('/getchathistory' , userController.getChat)

router.post("/submitReview", userController.submitReview);

router.post("/getReview", userController.getReview);

router.use((req, res) => {
  res.status(404).send("Error: Page not found");
});


module.exports = router;
