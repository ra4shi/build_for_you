const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    categoryname: {
        type: String,
        required: true
    },
    IsActive: {
        type: Boolean,
        default: true
    }

})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category;