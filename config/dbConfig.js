// const mongoose = require("mongoose");

// mongoose.connect(process.env.mongo_URL);

// const connection = mongoose.connection;

// connection.on("connected", () => {
//   console.log("MongoDB is Connected");
// });

// connection.on("error" ,(error)=>{
//     console.log(error ," there is an error")
// });

const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  mongoURI: process.env.mongo_URL
}