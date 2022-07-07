const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({
    bookId: {
        type: ObjectId,
        required: true,
        ref: "Book",
        trim: true
    },
    reviewedBy: {
        type: String,
        required: true,
        default: 'Guest',
        trim: true
    },
    reviewedAt: {
        type: String,
        required: true,
        format: "YYYY-MM-DD",
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        default: null, // optional
        trim : true
    },
    deletedAt: {
        type: String,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema)
