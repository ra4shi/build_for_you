const Localadmin = require('../models/localadminModel')
const { securePassword } = require("../config/bcryptConfig");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Project = require('../models/ProjectModel');
const Banner = require('../models/bannerModel')
const Company = require('../models/companyModel')
const Order = require('../models/orderModel');
const Rating = require('../models/ratingModel')

const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/project_images'));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
 
  const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, .jpeg, and .webp formats allowed!'));
  }
};

const multerInstance = multer({
  storage: storage,
  fileFilter: fileFilter,
});


const adminEmail = "admin@gmail.com";
const adminPassword = "123";

const adminLogin = (req, res) => {
  if (req.body.email === adminEmail && req.body.password === adminPassword) {
    const admin_Secret = jwt.sign({ id: "thisIsAdmin" }, process.env.admin_Secret, {
      expiresIn: "1d",
    });
    res.status(200).send({
      message: "Admin logged in successfully",
      success: true,
      admin_Secret,
    });
  } else {
    res.status(200).send({ message: "Username or password is incorrect", success: false });
  }
};

const getUsersList = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send({ message: "Users fetched successfully", success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong on the server side" });
  }
};

const getLocaladminList = async (req, res) => {
  try {
    const localadmin = await Localadmin.find();
    res
      .status(200)
      .send({ message: "Admins fetched successsfully", success: true, localadmin });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong on server side" });
  }
}

const checkblock = async (req, res) => {
  try {
    const admin = await Localadmin.findById(req.body.id);

    if (!admin) {
      return res.status(200).send({ message: "Admin not found", success: false });
    }

    admin.isBlocked = !admin.isBlocked;

    await admin.save();

    return res.status(200).send({
      message: `Admin ${admin.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server side error", success: false });
  }
}

const blockUserById = async (req, res) => {
  try {
    console.log("bddgfghdgh  udg fjdgfgd")
    const userId = req.body.id;
    const data = await User.findByIdAndUpdate(userId, { status: 'blocked' }, { new: true });

    if (data) {
      res.status(200).send({ message: "User blocked successfully", success: true });
    } else {
      res.status(200).send({ message: "User not found", success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server side error", success: false });
  }
};

const getUserData = async (req, res) => {
  try {
    const data = await User.findOne({ _id: req.body.id });
    if (data) {
      res
        .status(200)
        .send({
          message: "User data fetched successfully",
          success: true,
          data,
        });
    } else {
      res.status(200).send({ message: "User not found", success: false });
    }
  } catch (error) {
    res.status(500).send({ message: "Server Side Error", success: false });
  }
}

const editUserinfo = async (req, res) => {
  try {
    const data = await User.findByIdAndUpdate(req.body.id, {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile
    });
    if (data) {
      res.status(200).send({ message: "User updated succesfully", success: true })
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "server side error", success: false });
  }
}



const approvel = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Side Error" });
  }
};

const updateStatus = async (req, res) => {
  const { projectId, newStatus } = req.body;

  try {

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }


    project.status = newStatus;

    await project.save();


    res.status(200).json({ message: "Project status updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Side Error" });
  }
};



const createBanner = async (req, res) => {
  try {
    multerInstance.single('image')(req, res, async function (err) {
      if (err) {
        console.error('Error uploading image:', err);
        return res.status(500).json({ error: 'Error uploading image' });
      }

      const { title, link, isActive } = req.body;
      const image = req.file.filename; // Use req.file.filename to get the uploaded image filename

      const banner = new Banner({
        title,
        link,
        isActive,
        image,
      });

      await banner.save();
      res.status(201).json({ success: true, message: 'Banner created successfully' });
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const showbanner = async (req, res) => {
  try {
    console.log(1);
    const banners = await Banner.find();
    res.status(200).json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const companies = async (req, res) => {
  try {

    const companies = await Localadmin.find();



    res.status(200).json({ companies, success: true, message: ' company Fetched ' });

  } catch (error) {
    console.log(error)
    res.status(200).json({ companies, success: false, message: ' fetched error ' });
  }
}


const companyView = async (req, res) => {
  try {
    console.log("first company")
    const companyId = req.params.companyId


    const company = await Company.findOne({ company: companyId })


    const projects = await Project.find({ projectId: companyId })




    res.status(200).json({ projects, company, success: true, message: ' fetched success ' });

  } catch (error) {
    console.log(error)
  }
}


const deletecompany = async (req, res) => {
  try {
    console.log(" deleting company")
    const companyId = req.params.companyId;
    console.log(companyId)

    const deletedCompany = await Localadmin.deleteOne({ _id: companyId });
    console.log(deletedCompany)
    if (!deletedCompany) {

      return res.status(404).json({ message: 'Company not found', success: true });
    }


    return res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {

    console.error('Error deleting company:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


const projectView = async (req, res) => {
  try {

  
    
    const projectId = req.params.projectId.toString();

    console.log(projectId)


    const project = await Project.findById(projectId);

    const companyId = project.projectId;

    const company = await Company.find({ company: companyId })

    res.status(200).send({ project, company , message:'data Fetched successfully' , success : true});
  } catch (error) {
    console.log('Error fetching project details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    
  }
}



const admindashbord = async (req, res) => {
  try {

    const companies  = await Company.find();

    const projects = await Project.find({ status : 'approved'})

    const orders = await Order.find()

    const ratings = await Rating.find()


    const totalamount = await Order.aggregate([
      {
        $match: {
          status: "success",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toInt: '$amount' } }
        }
      }

    ]);

    const contructioncompleted = await Order.find({ contructionstatus: 'success'})

    const completedcontruction = contructioncompleted.length


    const totalappointmentamount = totalamount[0].total
 
    const totalcompany = companies.length

    const totalproject = projects.length

    const totalorders = orders.length

    const totalratings = ratings.length

return res.status(200).json({ totalappointmentamount ,completedcontruction , totalcompany , totalproject , totalorders ,totalratings , message : " Datas Fetched Successfull" , success : true })
  
  } catch (error) {
    console.log(error)

    return res.status(500).json({ message : "backend error" , success : false})
  }
}








module.exports = {
  adminLogin,
  getUsersList,
  getLocaladminList,
  checkblock,
  blockUserById,
  getUserData,
  editUserinfo,
  approvel,
  updateStatus,
  createBanner,
  showbanner,
  companies,
  companyView,
  deletecompany,
  projectView,
  admindashbord


};
