const mongoose = require('mongoose')
const bookingSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'rejected', 'success'],
        default: 'pending'
    },
    projectId: {
        type: String,
        required: true
    },
    companyId: {
        type: String,
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    appointmentstatus : {
        type: String,
        enum: ['pending', 'delayed', 'success'],
        default: 'pending'
    },
    contructionstatus: {
        type : String,
        default : 'pending'
    },
    addresssId : {
        type : String,
        required : true
    }


}, {
    timestamps: true
});
const bookingModel = mongoose.model('booking', bookingSchema)
module.exports = bookingModel
