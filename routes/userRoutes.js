const express = require("express");
const userController = require('../Controller/userController')
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const axios = require("axios")



const path = require('path');
const multer = require('multer');
const User = require('../models/userModel');

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../front-end/client/public/project_images'));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error("Only .png, .jpg, .jpeg, and .webp formats allowed!"));
  }
};

const multerInstance = multer({
  storage: storage,
  fileFilter: fileFilter
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


module.exports = router;
