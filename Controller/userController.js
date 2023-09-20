const { securePassword } = require("../config/bcryptConfig");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const Company = require('../models/companyModel')
const Banners = require('../models/bannerModel');
const Project = require('../models/ProjectModel')
const Order = require('../models/orderModel')
const Address = require('../models/addressModel')
const Razorpay = require('razorpay');
const { response } = require("express");
const Chat = require('../models/chatModel')
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

var razorpayintence = new Razorpay({
  key_id: process.env.razorPay_Key_id,
  key_secret: process.env.razorPay_Key_Secret
})


const sendResetPasswordEmail = async (email, otp) => {
  try {
    await User.updateOne({ email: email }, { $set: { otp: otp } });

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });

    const mailOptions = {
      from: 'smtp.gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      html: `<p>Your password reset OTP is: ${otp}</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('Password reset email sent', info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).send({ message: 'User not found', success: false });
    }

    const otp = otpGenerate();
    await sendResetPasswordEmail(email, otp);

    res.status(200).send({ message: 'Password reset OTP sent successfully', success: true });
  } catch (error) {
    res.status(500).send({ message: 'Something went wrong', success: false });
    console.log(error)
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email, otp: otp });

    if (!user) {
      return res.status(404).send({ message: 'Invalid OTP or User not found', success: false });
    }

    // Reset the user's password
    const hashedPassword = await securePassword(newPassword);
    await User.updateOne({ email: email }, { $set: { password: hashedPassword }, $unset: { otp: 1 } });

    res.status(200).send({ message: 'Password reset successful', success: true });
  } catch (error) {
    res.status(500).send({ message: 'Something went wrong', success: false });
  }
};



const sendVerifyMail = async (name, email) => {
  try {
    console.log(email)
    const otp = otpGenerate();
    const subOtp = otp.toString();
    await User.updateOne({ email: email }, { $set: { otp: subOtp } });
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

    const mailOptions = {
      from: "globalcycle12@gmail.com",
      to: email,
      subject: "to verify your detals",
      html:
        "<p>Hi " +
        name +
        " This is your otp to verify your build4yo accont the otp is " +
        otp +
        "</p>",
    };

    transporter.sendMail(mailOptions, (error, info) => {
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
    const { name, email, password, mobile } = req.body;
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(200).send({ message: 'User already exists', success: false });
    }

    const hashedPassword = await securePassword(password);

    const user = new User({
      name: name,
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
    const userOtp = await User.findOne({ email: req.body.email, otp: req.body.otp });

    if (!userOtp) {
      return res.status(200).send({ message: 'Invalid OTP, please check again', success: false });
    }

    await User.updateOne({ email: req.body.email }, { $unset: { otp: 1 }, $set: { isVerified: true } });

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
    await User.updateOne({ email: email }, { $set: { subOtp: subOtp } });
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


    await User.updateOne({ email: email }, { $set: { otp: newOtp } });

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
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Password is incorrect", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_Secret, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: "User logged in successfully", success: true, token });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "error while logging in", success: false, error });
  }
}

const getuserinfo = async (req, res) => {
  try {

    const user = await User.findById(req.body.userId);
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: {
          name: user.name,
          email: user.email,
          profile: user.profile,
          mobile: user.mobile,
          // image : user.files['image'][0].filename
        },
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
}


const edituser = async (req, res) => {
  try {

    const id = req.body.userId

    console.log(id, 'userid')
    const image = req.file.filename
    const { name, email, mobile } = req.body;

    // Find the user by userId
    console.log(req.body)
    const user = await User.findById(req.body.userId)
    console.log(user)

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name,
        email: email,
        mobile: mobile,
      },
      { new: true }  
    );
    console.log(updatedUser)

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    if (req.file) {
      updatedUser.image = req.file.filename;
    }

    // Save the updated user to the database
    await updatedUser.save();

    res.status(200).json({ message: "User profile updated successfully", success: true });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error updating user profile", success: false, error: error.message });
  }
}



const uploadimage = async (req, res) => {
  try {
    const image = req.body.image;
    const imageUpload = await cloudinary.uploader.upload(image, opts)
    await User.findByIdAndUpdate(req.body.userId, {
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

const loadBanner = async (req, res) => {
  try {

    const banners = await Banners.find();
    res.status(200).json({
      success: true,
      banners: banners.map(banner => ({
        title: banner.title,
        image: banner.image,
        link: banner.link
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error loading banners",
      success: false,
      error: error.message,
    });
  }
}



const projectsShowing = async (req, res) => {
  try {

    const project = await Project.find({ status: 'approved' });


    console.log(project)

    res.status(200).json(project);

  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

var ProjectIdForApp
const ProjectSingle = async (req, res) => {
  try {
    const projectId = req.params.projectId;


    const project = await Project.findById(projectId);

    const companyId = project.projectId;

    ProjectIdForApp = projectId

    const company = await Company.find({ company: companyId })

    res.status(200).send({ project, company });
  } catch (error) {
    console.log('Error fetching project details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const companies = async (req, res) => {
  try {
    const company = await Company.find()
    res.status(200).json({ success: true, company });

  } catch (error) {
    console.log('Error fetching company details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


const companySingle = async (req, res) => {
  try {

    const companyId = req.params.companyId;

    const company = await Company.findById(companyId);

    const fetchId = company.company

    const projectId = fetchId.toString();

    const project = await Project.find({ projectId: projectId })

    const companyIds = companyId.toString()


    const reviews = await Rating.find({ companyId: companyIds })




    res.status(200).json({ company, project, reviews });





  } catch (error) {
    console.log("Error fetching company details:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



var CompanyIdAll;
const appointmentbooking = async (req, res) => {
  try {

    const companyId = req.params.companyId;

    const user = await User.findById(req.body.userId);

    const company = await Company.findById(companyId);
    CompanyIdAll = companyId;
    const project = await Project.findById(ProjectIdForApp);
    console.log(req.body)

    if (project) {
      res.status(200).send({ success: true, company, project, user });
    } else {
      res.status(404).json({ message: 'Not Found', success: false, redirectTo: '/projects' });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

var addressIdforappointment;
const datas = async (req, res) => {
  try {

    const { name, address, userId, pincode, city, state, phone, companyId, bookingdate } = req.body.data;

    const newAddress = new Address({
      name,
      address,
      pincode,
      city,
      state,
      phone,
      userId: req.body.userId,
      companyId: companyId,
      bookingdate,
    });


    const f = await newAddress.save();


    addressIdforappointment = f._id.toString()
    console.log(addressIdforappointment)

    const project = await Project.findById(ProjectIdForApp)
    console.log(project.appointmentfee);
    var optionss = {
      amount: project.appointmentfee * 100,
      currency: "INR",
      receipt: "" + req.body.order_id
    }
    razorpayintence.orders.create(optionss, function (err, order) {
      res.status(200).send({ message: 'pay advance', success: true, data: order })
    });

  } catch (error) {
    console.log(error)
  }
}


const advancePayment = async (req, res) => {

  try {
    console.log("advance payment controller");
    const project = await Project.findById(ProjectIdForApp)

    var optionss = {
      amount: project.appointmentfee * 100,
      currency: "INR",
      receipt: "" + req.body.order_id
    }
    razorpayintence.orders.create(optionss, function (err, order) {
      res.status(200).send({ message: 'pay for appo', success: true, data: order })
    });

  } catch (error) {
    console.log(error)
  }
};

console.log(addressIdforappointment)
const bookDeal = async (req, res) => {
  try {

    // console.log('payment', req.body.payment);
    // console.log('order', req.body.order);

    const details = req.body;

    // console.log("details", details);
    console.log(ProjectIdForApp);
    const PROJECTSDATA = await Project.findById(ProjectIdForApp)
    console.log(PROJECTSDATA.name)
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", process.env.razorPay_Key_Secret);
    hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
    hmac = hmac.digest('hex');



    if (hmac === details.payment.razorpay_signature) {

      const amount = details.order.amount / 100;

      const newOrder = new Order({
        company_id: details.order.companyId,
        user_id: req.body.userId,
        amount: amount,
        date: new Date(),
        status: 'success',
        projectId: ProjectIdForApp,
        companyId: CompanyIdAll,
        projectName: PROJECTSDATA.name,
        companyName: PROJECTSDATA.companyname,
        category: PROJECTSDATA.category,
        addresssId: addressIdforappointment

      });

      console.log("user id when order done", req.body.userId);




      const savesuccessfull = await newOrder.save();

      if (savesuccessfull) {
        res.status(200).send({ success: true, redirectTo: '/appointments' })
      }


    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error, success: false });
  }
};




const appointmentlists = async (req, res) => {
  try {
    const userId = req.body.userId;
    const data = await Order.find({ user_id: userId });
    const projects = data.map(order => ({
      projectId: order.projectId,
    }));

    const projectIds = projects.map(project => project.projectId);

    const fetchedProjects = await Project.find({
      _id: { $in: projectIds },
    });

    // console.log(fetchedProjects);


    if (data) {

      res.status(200).send({ data, fetchedProjects });
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  } catch (error) {
    console.log('Error Fetching Appointments: ', error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

const Services = async (req, res) => {
  try {

    console.log("first Services")
  } catch (error) {
    console.log(error)
  }
}


const userData = async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.body.userId })


    if (!userdata) {
      return res.status(200).send({ message: 'not get User datas', success: false })
    }

    res.status(200).send({ message: 'User Data fetched successfully', success: true, data: userdata })
  } catch (error) {
    res.status(500).send({ message: 'Internal server error', success: false })
  }
}


const userDataEdit = async (req, res) => {
  try {

    var userDatadd = await User.findOne({ _id: req.body.userId })

    var userIdsrc = req.body.userId
    multerInstance.fields([
      { name: 'profile', maxCount: 1 }
    ])(req, res, async function (err) {
      if (err) {
        console.error('Error uploading images: ', err);
        return res.status(500).json({ error: 'Error uploading images' })
      }

      const name = req.body.name;
      const email = req.body.email;
      const mobile = req.body.mobile
      console.log(req.files)
      if (req.files.profile) {
        const newprofile = req.files?.profile?.[0]?.filename ? req.files?.profile?.[0]?.filename : userDatadd.profile[0]

        const d = await User.updateOne(
          { _id: userIdsrc },
          {
            $set: {
              name: name,
              email: email,
              mobile: mobile,
              profile: [newprofile]
            }
          }
        );
        return res.status(200).json({ message: 'Edited success', success: true })
      } else {
        await User.updateOne({ _id: userIdsrc }, { $set: { name: name, email: email, mobile: mobile } })

        res.status(200).json({ message: ' Edited Succesfull', success: true })
      }
    })
  } catch (error) {

    console.log('error', error)
    res.status(500).send({ message: 'somthing went wrong', success: false })

  }
}



const getsenderId = async (req, res) => {
  try {
    console.log("vannu")
    res.status(200).send({ id: req.body.userId, success: true })

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
  const chats = chathistory?.chathistory
  const senderchats = chats?.filter((item) => item.author !== req.body.data.userid)
  let sendeid
  if (senderchats) {
    sendeid = senderchats[0]?.author
  }
  const profile = await localadmin.findOne({ _id: sendeid })
  const image = profile?.profile
  const name = profile?.name
  try {
    const chat = chathistory?.chathistory
    if (chathistory) {
      res.status(200).send({ chat, image, name, success: true })
    }

  } catch (error) {
    res.status(500)

  }

}




const submitReview = async (req, res) => {
  try {
    const Oreders = await Order.findOne({ _id: req.body.data })
    const user = await User.findOne({ _id: Oreders.user_id })
    const exist = await Rating.findOne({ companyId: Oreders.companyId, userId: Oreders.user_id })
    if (exist) {
      const update = await Rating.findOneAndUpdate(
        { userId: Oreders.user_id, userId: Oreders.user_id },
        {
          $set: {
            review: req.body.review,
            rating: req.body.rating,
          },
        },
        { new: true }
      );

      console.log(update)
      if (update) {
        return res.status(200).send({ message: "review upated", success: true })

      }
    }
    const username = user.name
    const rating = new Rating({
      companyId: Oreders.companyId,
      username: username,
      review: req.body.review,
      rating: req.body.rating,
      userId: Oreders.user_id
    })
    const saved = await rating.save()
    if (saved) {

      return res.status(200).send({ message: "review upated", success: true })
    } else {
      return res.status(200).send({ message: "Please try again", success: false })
    }
  } catch (error) {
    console.log("error")
    res.status(500).send({ error })
  }
}




const averagerating = (review) => {
  const totalrating = review.map(item => item.rating).reduce((acc, rating) => acc + rating, 0)
  const length = review.length
  const avgrating = totalrating / length
  const roundedNumber = Math.round(avgrating * 2) / 2;
  return roundedNumber
}


const getReview = async (req, res) => {

  try {
    const review = await Rating.find({ companyId: req.body.id })
    const avgrating = averagerating(review)

    if (review) {
      res.status(200).send({ success: true, data: review, rate: avgrating })
    }
    else {
      res.status(200).send({ success: false })
    }

  } catch (error) {
    res.status(500).send(error)
  }
}

 






module.exports = {
  register,
  login,
  otpVerification,
  resetPassword,
  forgotPassword,
  sendResetPasswordEmail,
  getuserinfo,
  edituser,
  uploadimage,
  loadBanner,
  projectsShowing,
  ProjectSingle,
  companies,
  companySingle,
  appointmentbooking,
  datas,
  advancePayment,
  bookDeal,
  appointmentlists,
  resendotp,
  Services,
  userData,
  userDataEdit,
  getsenderId,
  getChat,
  chatHistory,
  getReview,
  submitReview


}