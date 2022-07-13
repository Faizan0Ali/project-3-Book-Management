const reviewModel = require('../Models/reviewModel')
const mongoose = require('mongoose')
const isValid = require("../validator/validate")
const bookModel = require('../Models/bookModel')

const postReview = async function (req, res) {

    try {
        const reviewData = req.body
        const bookId = req.params.bookId
        const { reviewedBy, rating, review } = reviewData;

        //____Mandatory_Fields____\\
        if (!bookId) return res.status(400).send({ status: false, message: "BookId Is Mandatory" })
        // if (!reviewedBy) return res.status(400).send({ status: false, message: "ReviewedBy Is Mandatory" })
        if (!rating) return res.status(400).send({ status: false, message: "rating Is Mandatory" })

        //____Validation____\\
        if (mongoose.Types.ObjectId.isValid(bookId) == false) {
            return res.status(400).send({ status: false, message: "bookId Invalid" });
        }
        if (!/^[a-zA-Z ]{2,30}$/.test(reviewedBy)) {
            return res.status(400).send({ status: false, message: "Name Should Be 2-30 Characters" })
        }
        if (!(rating >= 1 && rating <= 5)) {
            return res
                .status(400)
                .send({ status: false, msg: "Rating should be inbetween 1-5 " });
        }
        const releasedDate = new Date();
        const responseBody = {
            bookId: bookId,
            reviewedBy: reviewedBy ? reviewedBy : "guest",
            rating: rating,
            reviewedAt: releasedDate,
            review: review,
        };
        const createdReview = await reviewModel.create(responseBody)

        const db = await reviewModel.find({ bookId: bookId, isDeleted: false })
            .select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

        const book = await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: 1 } }, { new: true }).lean()

        book.reviewsData = db

        return res.status(201).send({ status: true, message: 'Books list', data: book })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}
const updateReview = async function (req, res) {
    try {
        let data = req.body
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let { review, rating, reviewedBy } = data

        //_Mandatory_Fields_\\
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please enter valid Detail" })
        if (!reviewedBy) return res.status(400).send({ status: false, message: "ReviewedBy Is Mandatory" })
        if (!rating) return res.status(400).send({ status: false, message: "rating Is Mandatory" })

        //_Validation_\\ 
        if (mongoose.Types.ObjectId.isValid(bookId) == false) {
            return res.status(400).send({ status: false, message: "bookId Invalid" });
        }
        if (!/^[a-zA-Z ]{2,30}$/.test(reviewedBy)) {
            return res.status(400).send({ status: false, message: "Name Should Be 2-30 Characters" })
        }
        if (!(rating >= 1 && rating <= 5)) {
            return res.status(400).send({ status: false, msg: "Rating should be inbetween 1-5 " });
        }


        const checkBookId = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookId) return res.status(404).send({ status: false, message: "Book Not Found Maybe Deleted" })

        const checkReviewId = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkReviewId) return res.status(404).send({ status: false, message: "Review Not Found Maybe Deleted" })

        const updateByBody = await reviewModel.findOneAndUpdate({ _id: reviewId }, {
            $set: {
                reviewedBy: reviewedBy,
                rating: rating,
                review: review
            }
        }, { new: true })
        return res.status(200).send({ status: true, message: "Updated Successfully", data: updateByBody })
    } catch (error) {
        return res.status(500).send({ status: false, messege: error.message })
    }
}

const deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        const checkBookId = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookId) return res.status(404).send({ status: false, message: "Book Not Exist Maybe Deleted" })

        const checkReviewId = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkReviewId) return res.status(404).send({ status: false, message: "Review Not Exist Maybe Deleted" })

        await bookModel.updateOne({ _id: bookId }, { $inc: { review: -1 } })

        await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false },
            { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })

        return res.status(200).send({ status: true, message: "Deleted Successfuly" })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { postReview, updateReview, deleteReview }