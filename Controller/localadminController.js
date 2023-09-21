const { securePassword } = require('../config/bcryptConfig')
const Localadmin = require('../models/localadminModel')
const jwt = require('jsonwebtoken')
const Project = require('../models/ProjectModel')
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer')
const Company = require('../models/companyModel')
const Order = require('../models/orderModel')
const Address = require('../models/addressModel')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')
const Rating = require('../models/ratingModel')


const path = require('path');
const multer = require('multer');
const company = require('../models/companyModel');
const localadmin = require('../models/localadminModel');

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



const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
};


const otpGenerate = () => {
  const otp = Math.floor(Math.random() * 9000) + 1000;
  return otp;
};





const sendVerifyMail = async (name, email) => {
  try {
    const otp = otpGenerate();
    const subOtp = otp.toString();
    await Localadmin.updateOne({ email: email }, { $set: { otp: subOtp } });
    console.log(subOtp, 'sendle');

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
      requireTLS: true,
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });

    const mailOption = {
      from: "globalcycle12@gmail.com",
      to: email,
      subject: "to verify your detals",
      html:
        "<p>Hi " +
        name +
        " This is your otp to verify your build4you accont the otp is " +
        otp +
        "</p>",
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('Email has been sent', info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const register = async (req, res) => {
  try {
    const { name, username, email, password, mobile } = req.body;

    console.log(req.body)
    const userExists = await Localadmin.findOne({ email: email });
    if (userExists) {
      return res.status(200).send({ message: 'Company email already exists', success: false });
    }

    const usernameExists = await Localadmin.findOne({ username: username })

    if (usernameExists) {
      return res.status(200).send({ message: 'Company Username already exists', success: false });
    }

    const hashedPassword = await securePassword(password);

    const user = new Localadmin({
      name: name,
      username: username,
      email: email,
      password: hashedPassword,
      mobile: mobile,
    });

    await user.save();
    sendVerifyMail(name, email);
    res.status(200).send({ message: 'OTP has been sent', success: true });
  } catch (error) {
    res.status(500).send({ message: 'There was an error while creating the user', error, success: false });
  }
};

const otpVerification = async (req, res) => {
  try {
    const userOtp = await Localadmin.findOne({ email: req.body.email, otp: req.body.otp });

    if (!userOtp) {
      return res.status(200).send({ message: 'Invalid OTP, please check again', success: false });
    }

    await Localadmin.updateOne({ email: req.body.email }, { $unset: { otp: 1 }, $set: { isVerified: true } });

    res.status(200).send({ message: 'Registration successful', success: true });
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Something went wrong', success: false });
  }
};




const generateNewOtp = () => {
  const otp = Math.floor(Math.random() * 9000) + 1000;
  return otp;
};

const resendVerifyMail = async (email, otps) => {
  try {
    // const { email } = req.body.email;
    console.log(otps, 'otp')

    const subOtp = otps.toString();
    await Localadmin.updateOne({ email: email }, { $set: { subOtp: subOtp } });
    console.log(subOtp, 'generated');

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
      requireTLS: true,
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });

    const mailOption = {
      from: "globalcycle12@gmail.com",
      to: email,
      subject: "to verify your detals",
      html:
        "<p>Hi " +
        " This is your resend otp to verify your build4you accont the otp is " +
        subOtp +
        "</p>",
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('Email has been sent', info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};


const resendotp = async (req, res) => {
  try {
    const { email } = req.body;


    const newOtp = generateNewOtp();


    await Localadmin.updateOne({ email: email }, { $set: { otp: newOtp } });

    // Send the new OTP to the user's email
    await resendVerifyMail(email, newOtp); // Implement your email sending function

    res.status(200).json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error resending OTP' });
  }
}

const login = async (req, res) => {
  try {
    const localadmin = await Localadmin.findOne({ email: req.body.email });
    if (!localadmin) {
      return res
        .status(200)
        .send({ message: "Admin does not exist", success: false });
    }
    console.log(req.body.password)
    console.log(localadmin.password)
    const isMatch = await bcrypt.compare(req.body.password, localadmin.password);

    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Password is incorrect", success: false });
    } else {
      const token = jwt.sign({ id: localadmin._id }, process.env.local_Secret, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: "Localadmin logged in successfully", success: true, token });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "error while logging in", success: false, error });
  }
}




const profile = async (req, res) => {
  try {

    const localadmin = await Localadmin.findById(req.body.localId);
    if (!localadmin) {
      return res
        .status(200)
        .send({ message: "Admin not found", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: {
          name: localadmin.name,
          email: localadmin.email,
          profile: localadmin.profile,
          mobile: localadmin.mobile,
        },

      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting admin info", success: false, error });
  }
}

const editprofile = async (req, res) => {
  try {
    const result = await Localadmin.findByIdAndUpdate(req.body.localId, {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
    });
    if (result) {
      res
        .status(200)
        .send({ message: "Admin profile updated successfully", success: true });
    } else {
      res
        .status(200)
        .send({ message: "Admin profile not updated", success: false });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting admin info", success: false, error });
  }
}

const uploadimage = async (req, res) => {
  try {
    const image = req.body.image;
    const imageUpload = await cloudinary.uploader.upload(image, opts)
    await Localadmin.findByIdAndUpdate(req.body.localId, {
      profile: imageUpload.secure_url
    })
    res.status(200).send({ message: "Profile updated succesfully ", success: true })
  } catch (error) {
    res.status(500).send({
      message: "Error updating profile picture",
      success: false,
      error,
    });
  }
}


const addcompanydetails = async (req, res) => {
  try {
    const localId = req.body.localId;
    multerInstance.fields([
      { name: 'image', maxCount: 1 },
      { name: 'license', maxCount: 1 },
      { name: 'certifications', maxCount: 5 }
    ])(req, res, async function (err) {
      if (err) {
        console.error('Error uploading images:', err);
        return res.status(500).json({ error: 'Error uploading images' });
      }
      const {
        companyname,
        companyusername,
        aboutcompany,
        company
      } = req.body;
      const localadmin = await Localadmin.findById(localId);
      if (!localadmin) {
        return res.status(404).send({ error: 'Localadmin not found' });
      }
      const companyId = localId;
      const existingCompany = await Company.findOne({ company: companyId });
      if (existingCompany) {
        return res.status(200).json({ message: ' Company Details Already Added', success: false, redirectTo: `/localadmin/showcompany/` });
      } else {
        const company = new Company({
          companyname,

          companyusername,

          aboutcompany,
          image: req.files['image'][0].filename,
          license: req.files['license'][0].filename,
          certifications: req.files['certifications'].map(file => file.filename),
          company: companyId
        });
        if (company.companyusername === localadmin.username) {
          const savedcompany = await company.save();
          res.status(201).json({ company: savedcompany, success: true, redirectTo: '/localadmin/showcompany' });
        } else {
          res.status(201).json({ message: 'Company username is Wrong', success: false });
        }
      }
    });

  } catch (error) {
    console.error('Error Creating Company Details', error);
    res.status(500).json({ error: 'Error creating Company Details' });
  }
};




const editCompanyDetails = async (req, res) => {
  try {
    console.log("first")
    const localId = req.body.localId;
    multerInstance.fields([
      { name: 'image', maxCount: 1 },
      { name: 'license', maxCount: 1 },
      { name: 'certifications', maxCount: 5 }
    ])(req, res, async function (err) {
      if (err) {
        console.error('Error uploading images:', err);
        return res.status(500).json({ error: 'Error uploading images' });
      }
      const {
        companyname,
        companyusername,

        aboutcompany,
        companyId,

      } = req.body;

      const localadmin = await Localadmin.findById(localId);
      if (!localadmin) {
        return res.status(404).send({ error: 'Localadmin not found' });
      }

      const existingCompany = await Company.findById(companyId);
      if (!existingCompany) {
        return res.status(404).send({ error: 'Company not found' });
      }

      if (company.companyusername === localadmin.username) {
        existingCompany.companyname = companyname;


        existingCompany.aboutcompany = aboutcompany;

        if (req.files['image']) {
          existingCompany.image = req.files['image'][0].filename;
        }
        if (req.files['license']) {
          existingCompany.license = req.files['license'][0].filename;
        }
        if (req.files['certifications']) {
          existingCompany.certifications = req.files['certifications'].map(file => file.filename);
        }

        const savedCompany = await existingCompany.save();
        res.status(200).json({ company: savedCompany, success: true, redirectTo: '/localadmin/showcompany' });
      } else {
        res.status(400).json({ message: 'Company username is Wrong', success: false });
      }
    });
  } catch (error) {
    console.error('Error Editing Company Details', error);
    res.status(500).json({ error: 'Error editing Company Details' });
  }
};



const showcompany = async (req, res) => {
  try {

    const localId = req.body.localId;
    const localadmin = await Localadmin.findById(localId);

    if (!localadmin) {
      return res.status(404).json({ error: 'Localadmin not found' });
    }
    const company = await Company.findOne({ company: localId });
    if (company === null || company.companyusername !== localadmin.username) {
      return res.status(200).json({ redirectTo: '/localadmin/addcompanydetails' });
    }
    return res.status(200).json({ company, success: true });
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}





const addproject = async (req, res) => {
  try {
    const company = await Company.findOne({ company: req.body.localId })

    if (!company) {

      return res.status(500).send({ error: 'Company not found' })

    }
    const projectid = req.body.localId
    multerInstance.array('images', 3)(req, res, async function (err) {
      if (err) {
        console.error('Error uploading images:', err);
        return res.status(500).json({ error: 'Error uploading images' });
      }


      const { name, companyname, category, aboutproject, projectId, appointmentfee, projectcost } = req.body;
      const images = req.files.map(file => file.filename);




      const newProject = new Project({
        name,
        companyname,
        category,
        aboutproject,
        appointmentfee,
        images: images,
        projectId: projectid,
        projectcost

      });
      await newProject.save();


      res.status(201).json({ message: 'Project created successfully' });
    });
  } catch (error) {
    console.log("first")
    console.error('Error adding project:', error);
    res.status(500).json({ error: 'Error adding project' });
  }
};





const showproject = async (req, res) => {
  try {
    const localId = req.body.localId;
    const localadmin = await Localadmin.findById(localId);

    if (!localadmin) {
      return res.status(404).json({ message: 'Localadmin not found' });
    }

    const projects = await Project.find({ projectId: localId });

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const getProjectDetails = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const uploadImage = async (req, res) => {
  try {

    const { image } = req.body;
    const newProject = await Project.create({ image });
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const appointmentlists = async (req, res) => {
  try {
    const userId = req.body.localId;



    const data = await Company.find({ company: userId });



    const companyIDobj = data[0]._id

    const companyID = companyIDobj.toString();


    const appointment = await Order.find({ companyId: companyID })

    if (data) {
      res.status(200).send({ data, appointment, Order });
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  } catch (error) {
    console.log('Error Fetching Appointments: ', error);
    res.status(500).send({ message: 'Internal server error' });
  }
};


const companyData = async (req, res) => {
  try {


    const companyDatadd = await Company.findOne({ company: req.body.localId })
    if (!companyDatadd) {
      return res.status(200).send({ message: 'not get company datas', success: false })
    }
    res.status(200).send({ message: 'Company datas get ', success: true, data: companyDatadd })
  } catch (error) {
    res.status(500).send({ message: 'Internal server error', success: false })
  }
}


const companyDataEdit = async (req, res) => {
  try {
    var companyDatadd = await Company.findOne({ company: req.body.localId })
    console.log('asdfasdf', companyDatadd)
    var localIdsrc = req.body.localId
    multerInstance.fields([
      { name: 'image', maxCount: 1 },
    ])(req, res, async function (err) {
      if (err) {
        console.error('Error uploading images:', err);
        return res.status(500).json({ error: 'Error uploading images' });
      }

      const companyname = req.body.companyname;

      const aboutcompany = req.body.aboutcompany

      if (req.files.image) {


        const newimage = req.files?.image?.[0]?.filename ? req.files?.image?.[0]?.filename : companyDatadd.image[0]

        const d = await Company.updateOne(
          { company: localIdsrc },
          {
            $set: {
              companyname: companyname,

              aboutcompany: aboutcompany,
              image: [newimage],

            },
          }
        );

        return res.status(200).json({ message: 'Edited Success', success: true });

      } else {

        await Company.updateOne({ company: localIdsrc }, { $set: { companyname: companyname, aboutcompany: aboutcompany } })

        return res.status(200).json({ message: 'Edited Success', success: true });
      }
    })
  } catch (error) {
    console.log('error', error)
    res.status(500).send({ message: 'somthing went wrong', success: false })
  }
}





var ProjectIDFORALL;
const getProjects = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    ProjectIDFORALL = projectId
    console.log(ProjectIDFORALL)
    const project = await Project.findOne({ _id: projectId })

    res.status(200).send({ project, message: 'project Fetch successfull', success: true })
  } catch (error) {

  }
}


const projectDataEdit = async (req, res) => {
  try {
    console.log(ProjectIDFORALL)
    var projectDatadd = await Project.findOne({ _id: ProjectIDFORALL })
    console.log(projectDatadd)

    if (projectDatadd === null) {
      res.send({ redirectTo: '//localadmin/projects' })
    }

    const IDFORPROJECTS = projectDatadd._id.toString()

    var ProjctIdSrc = IDFORPROJECTS


    multerInstance.fields([
      { name: 'images', maxCount: 3 }
    ])(req, res, async function (err) {
      if (err) {
        console.error('Error uploading images:', err);
        return res.status(500).json({ error: 'Error uploading images' });
      }


      const name = req.body.name;
      const companyname = req.body.companyname;
      const category = req.body.category;
      const appointmentfee = req.body.appointmentfee;
      const aboutproject = req.body.aboutproject;
      const projectcost = req.body.projectcost;
      console.log(req.files)

      if (req.files.images) {

        const newimage = req.files?.images?.[3]?.filename ? req.files?.images?.[3]?.filename : projectDatadd.images[3]

        const d = await Project.updateOne(
          { _id: ProjctIdSrc },
          {
            $set: {
              name: name,
              companyname: companyname,
              category: category,
              appointmentfee: appointmentfee,
              aboutproject: aboutproject,
              projectcost: projectcost,
              images: [newimage]
            }
          }
        )
    

        return res.status(200).json({ message: 'Edited Success', success: true });

      } else {

        await Project.updateOne({ _id: ProjctIdSrc }, { $set: { name: name, companyname: companyname, category: category, appointmentfee: appointmentfee, aboutproject: aboutproject, projectcost: projectcost } })

        return res.status(200).json({ message: 'Edited Success', success: true });

      }
    })
  } catch (error) {

    console.log('error', error)
    res.status(500).send({ message: 'somthing went wrong', success: false })

  }
}



const deleteproject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    console.log(projectId)

    const deletedproject = await Project.deleteOne({ _id: projectId })
  
    if (!deletedproject) {

      return res.status(404).json({ message: 'Project not found', success: false });
    }


    return res.status(200).json({ message: 'Project deleted successfully' ,success : true});


  } catch (error) {
console.log(error)
  }
}



const editappointmentstatus = async (req, res) => {
  try {

    const appointmentId = req.params.appointmentId
    console.log(appointmentId)

    const order = await Order.findOne({ _id: appointmentId })
    console.log(order)

    const status = order.appointmentstatus

    await Order.updateOne({ _id: appointmentId }, {
      $set: {
        appointmentstatus: "approved"
      }
    })
    console.log(status)

    res.status(200).json({ message: 'Appointment update suceessfull ', success: true })
  } catch (error) {
    res.status(500).json({ message: 'Appointment fetch failed ', success: false })
  }
}


const editcontructionstatus = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId
    console.log(appointmentId)
    const order = await Order.findOne({ _id: appointmentId })
    console.log(order)

    const status = order.contructionstatus

    await Order.updateOne({ _id: appointmentId }, {
      $set: {
        contructionstatus: "success"
      }
    })
    console.log(status)

    res.status(200).json({ message: 'Appointment update suceessfull ', success: true })
  } catch (error) {
    res.status(500).json({ message: 'Appointment fetch failed ', success: false })
  }
}




const getsenderId = async (req, res) => {
  try {
    res.status(200).send({ id: req.body.localId, success: true })

  } catch (error) {

  }
}
const chatHistory = async (room, message, author) => {

  const roomexist = await Chat.findOne({ chatRoom: room })
  console.log("room nd")

  if (roomexist) {
    const chat = await Chat.findOne(({ chatRoom: room }))
    const id = chat._id
    const chatUpdate = await Chat.findByIdAndUpdate(
      id,
      {
        $push: {
          chathistory: {
            author: author,
            message: message,
            time: new Date(),
          },
        },
      },
      { new: true }
    );

  }
  else {
    const savechat = new Chat({
      chatRoom: room,
      chathistory: [
        {
          author: author,
          message: message,
          time: new Date()
        }
      ]
    })
    await savechat.save()

  }
}

const getChat = async (req, res) => {
  const chathistory = await Chat.findOne({ chatRoom: req.body.data.id })
  const chat = chathistory?.chathistory
  const senderchats = chat?.filter((item) => item.author !== req.body.data.userid)
  let sendeid
  if (senderchats) {
    sendeid = senderchats[0]?.author
  }
  const profile = await localadmin.findOne({ _id: sendeid })
  const name = profile?.name
  if (chathistory) {
    res.status(200).send({ chat, name, success: true })
  }
}


const AppointmentDetails = async (req, res) => {
  try {

    const orderId = req.params.orderId.toString()

    const order = await Order.findById(orderId)
    const addressId = order.addresssId

    const address = await Address.findById(addressId)

    const projectid = await order.projectId

    console.log(projectid)

    const project = await Project.find({ _id: projectid })

 


    return res.status(200).send({ message: ' Data Fetched successfully', success: true, order, address, project })



  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: ' Error in Backend ', success: false })

  }
}


const dashboeard = async (req, res) => {
  try {

    const localId = req.body.localId

    const company = await Company.findOne({ company: localId })
    const companyId = company._id.toString()

    const companyproject = company.company


    const order = await Order.find({ companyId: companyId })

    const ordercount = order.length

    const totalamount = await Order.aggregate([
      {
        $match: {
          companyId: companyId,
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

    const totalappointmentamount = totalamount[0].total


    const project = await Project.find({ projectId: companyproject })

  const projectcount =  project.length

  const completedcontruction = await order.find( { contructionstatus : 'success'})  

    if (!company) {

      return res.status(404).json({ error: 'Company not found' });
    }
    const ratings  = await Rating.find({ companyId : companyId})
    const ratingcount = ratings.length
    

    return res.status(200).json({   order, company, ordercount, totalappointmentamount ,completedcontruction  ,projectcount,ratingcount, message: " dashboard data fetched", success: true });




  } catch (error) {

    console.log(error)
    return res.status(500).json({ message: "DAshbord Fetcheing error in Backend ", success: false })

  }
}





module.exports = {
  register,
  login,
  profile,
  editprofile,
  uploadimage,
  addproject,
  showproject,
  sendVerifyMail,
  otpVerification,
  addcompanydetails,
  uploadImage,
  showcompany,
  getProjectDetails,
  editCompanyDetails,
  appointmentlists,
  resendotp,
  companyData,
  companyDataEdit,
  getProjects,
  projectDataEdit,
  deleteproject,
  editappointmentstatus,
  getsenderId,
  chatHistory,
  getChat,
  AppointmentDetails,
  dashboeard,
  editcontructionstatus
}