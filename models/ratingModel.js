const mongoose = require('mongoose')

const ratingSchema = new mongoose.Schema({
    companyId: {
        type: String,
        required: true
    },
    username:{
        type:String,
        required:true
    },
    userId: {
        type: String,
        required: true
    },
    review:{
        type:String,
        require:true
    },
    rating:{
        type:Number,
        required:true
    },
    average:{
        type:String,
    
    }
},{
    timestamps:true
    
})
const ratingModel = mongoose.model('review', ratingSchema)
module.exports = ratingModel
