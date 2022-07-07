const reviewModel = require('../Models/reviewModel')
// ## Review APIs
// ### POST /books/:bookId/review
// - Add a review for the book in reviews collection.
// - Check if the bookId exists and is not deleted before adding the review.
//  Send an error response with appropirate status code like
//   [this](#error-response-structure) if the book does not exist
// - Get review details like review, rating, reviewer's name in request body.
// - Update the related book document by increasing its review count
// - Return the updated book document with reviews data on successful operation.
//  The response body should be in the form of JSON object like [this](#successful-response-structure)

const postReview = async function(req,res){

    const review = req.body
    const {bookId,reviewedBy,reviewedAt,rating,} = review
    
    //____Mandatory_Fields____\\
    if(!bookId) return res.status(400).send({status: false, message: "BookId Is Mandatory"})
    if(!reviewedBy) return res.status(400).send({status: false, message: "ReviewedBy Is Mandatory"})
    if(!reviewedAt) return res.status(400).send({status: false, message: "reviewedAt Is Mandatory"})
    if(!rating) return res.status(400).send({status: false, message: "rating Is Mandatory"})

     //____Validation____\\
    if (mongoose.Types.ObjectId.isValid(bookId) == false) {
        return res.status(400).send({ status: false, message: "userId Invalid" });
    }
    if (!/^[a-zA-Z ]{2,30}$/.test(reviewedBy)) {
        return res.status(400).send({ status: false, message: "Name Should Be 2-30 Characters" })
    }
    if (!/^[0-9 -]{1,5}$/.test(rating) ) {
        return res.status(400).send({ status: false, message: "Rating Should Between 1-5 Numbers" })
    }
    const createdReview = await reviewModel.create(review)
    return res.status(201).send({status: true, data: createdReview, reviewedAt: new Date()})
    
}
    // {
    //     "_id": ObjectId("88abc190ef0288abc190ef89"),
    //     bookId: ObjectId("88abc190ef0288abc190ef55"),
    //     reviewedBy: "Jane Doe",
    //     reviewedAt: "2021-09-17T04:25:07.803Z",
    //     rating: 4,
    //     review: "An exciting nerving thriller. A gripping tale. A must read book."
    //   },

module.exports = {postReview}