const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    companyname: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    appointmentfee: {
        type: String,
        required: true
    },
    aboutproject: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    projectcost: {
        type: String,
        required: true
    }
    ,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    projectId: {
        type: String,
        required: true
    },



})


const Project = mongoose.model('Project', projectSchema)

module.exports = Project; 