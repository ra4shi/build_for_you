const express = require('express');
const localadminController = require('../Controller/localadminController')
const router = express.Router()
const auth = require('../middlewares/localadminauthMiddleware')
const cloudinary = require("cloudinary").v2;
const multer = require('multer');
const path = require('path')
const uploads = require('../config/multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../front-end/client/src/projectimg'))
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname
    cb(null, name)
  }
})
const upload = multer({ storage: storage })

cloudinary.config({
  cloud_name: 'doflo05dy',
  api_key: '495613638731729',
  api_secret: 'FvTPQYqeAPuKVin9IhNkUnjJUyI'
});



router.post('/register', localadminController.register);

router.post('/otpVerification', localadminController.otpVerification)

// Route for resending OTP




router.post('/resend-otp', localadminController.resendotp);


router.post("/login", localadminController.login);

router.post("/profile", auth, localadminController.profile);

router.post("/editprofile", auth, localadminController.editprofile);

router.post("/uploadImage", auth, localadminController.uploadimage);

router.post('/addproject', auth, localadminController.addproject);

router.post('/projects', auth, localadminController.showproject);

router.post('/uploadImage', localadminController.uploadImage);

router.post('/addcompanydetails', auth, localadminController.addcompanydetails)

router.post('/edit-companydetails/:companyId', auth, localadminController.editCompanyDetails)

router.post('/showcompany', auth, localadminController.showcompany);

router.get('/projects/:projectId', auth, localadminController.getProjectDetails);

router.post('/appointments', auth, localadminController.appointmentlists)

router.get('/company-data', auth, localadminController.companyData)

router.patch('/edit-company-data', auth, localadminController.companyDataEdit)
 
router.get('/project-data/:projectId', auth, localadminController.getProjects)

router.post('/edit-project-data', auth, localadminController.projectDataEdit)

router.patch('/delete-project/:projectId', auth, localadminController.deleteproject)

router.post('/edit-appointment-status/:appointmentId', auth, localadminController.editappointmentstatus)

router.patch('/edit-contruction-status/:appointmentId', auth, localadminController.editcontructionstatus)

router.post('/getsenderId' , auth , localadminController.getsenderId)

router.post('/chathistory' , localadminController.getChat)

router.get('/appointmentdetails/:orderId' , auth , localadminController.AppointmentDetails)

router.post('/dashboard' , auth , localadminController.dashbord)

module.exports = router;







