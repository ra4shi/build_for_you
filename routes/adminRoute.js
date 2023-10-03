const express = require("express");
const router = express.Router();

const adminController = require('../Controller/adminController')
const auth = require('../middlewares/adminauthMiddleware')



router.post('/admin-login', adminController.adminLogin);

//get users list
router.post('/users-list', auth, adminController.getUsersList);

//get admin list
router.post("/localadmin-list", auth, adminController.getLocaladminList)

//blocK admin by id
router.post("/block-unblock-admin", auth, adminController.checkblock)


//delete user by id

router.post('/block-localadmin-by-id', auth, adminController.blockUserById);

//get user data
router.post("/get-user-data", auth, adminController.getUserData)

//edit user info
router.post("/edit-user-info", auth, adminController.editUserinfo)
  
router.post("/project-management", auth, adminController.approvel) 

router.post("/update-status", auth, adminController.updateStatus)

router.post('/add-banner', auth ,  adminController.createBanner);

router.post('/show-banner', auth, adminController.showbanner)

router.get('/company-list', auth, adminController.companies)

router.get('/companyView/:companyId', auth, adminController.companyView)

router.delete('/delete-company/:companyId', auth, adminController.deletecompany)

router.get('/projectview/:projectId', auth , adminController.projectView)

router.post('/admindashbord' , auth , adminController.admindashbord)

router.use((req, res) => {
    res.status(404).send("Error: Page not found");
  });

module.exports = router;
