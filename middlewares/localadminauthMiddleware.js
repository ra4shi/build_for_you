const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
   
   
    const token = req.headers["authorization"].split(" ")[1];
   


   
    jwt.verify(token, process.env.local_Secret, (err, decoded) => {
      if (err) { 
      
    
        return res.status(401).send({ message: "Auth failed", success: false });
      } else {
      
       if (decoded.role==="localadmin") {
         
        req.body.localId = decoded.id;
       
        next();
       } else {
        return res.status(401).send({ message: "Auth failed", success: false });  
       }
        
      }
    });
  } catch (error) {
    return res
      .status(401)
      .send({ message: "Auth  error failed", success: false, error });
  }
};
