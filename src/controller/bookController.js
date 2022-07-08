const bookModel = require('../Models/bookModel')
const userModel = require('../Models/userModel')
const moment = require('moment')

const mongoose = require('mongoose')
const reviewModel = require('../Models/reviewModel')

const createBook = async function (req, res) {
    try {
        const data = req.body
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

        //____Mandatory_Fields____\\
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please enter valid Detail" })
        if (!title) return res.status(400).send({ status: false, message: "Title is mandatory" })
        if (!excerpt) return res.status(400).send({ status: false, message: "excerpt is mandatory" })
        if (!userId) return res.status(400).send({ status: false, message: "userId is mandatory" })
        if (!ISBN) return res.status(400).send({ status: false, message: "ISBN is mandatory" })
        if (!category) return res.status(400).send({ status: false, message: "category is mandatory" })
        if (!subcategory) return res.status(400).send({ status: false, message: "subcategory is mandatory" })
        if (!releasedAt) return res.status(400).send({ status: false, message: "Released date is mandatory" })

        //____Validation____\\
        if (mongoose.Types.ObjectId.isValid(userId) == false) {
            return res.status(400).send({ status: false, message: "userId Invalid" });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(releasedAt)) {
            return res.status(400).send({ status: false, message: "Released date is not valid it should be YYYY-MM-DD" })
        }
        if (!/^([0-9]{10}|[0-9]{13}|[0-9]{17})$/.test(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN Must Be 10, 13 and 17 Digits Only" })
        }

        //____Duplicate_Validation____\\
        const checkTitle = await bookModel.findOne({ title })
        if (checkTitle) return res.status(409).send({ status: false, message: "Title already exists" })

        const checkISBN = await bookModel.findOne({ ISBN })
        if (checkISBN) return res.status(409).send({ status: false, message: "ISBN already exists" })

        const userID = await userModel.findOne({ _id: userId })
        if (!userID) return res.status(404).send({ status: false, message: "UserID not Found" })

        //____Creating____\\
        const postBook = await bookModel.create(data)
        res.status(201).send
            ({ status: true, message: "Created successfully", data: postBook, releasedAt: new Date() })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getBook = async function (req, res) {
    try {
        const dataFromQuery = req.query
        const { userId, category, subcategory } = dataFromQuery

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId Invalid" });
        }
        // const userID = await userModel.findOne({ userId })                              ??????? ask to TA ???????
        // if (!userID) return res.status(404).send({ status: false, message: "UserID not Found" })

        const findCategory = await userModel.findOne({ category })
        if (!findCategory) return res.status(404).send({ status: false, message: "This Category Not exist" })

        const findSubcategory = await userModel.findOne({ subcategory })
        if (!findSubcategory) return res.status(404).send({ status: false, message: "This Subcategory Not exist" })

        const returnBook = await bookModel.find({ $and: [dataFromQuery, { isDeleted: false }] })
            .select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })
        if (returnBook.length > 0) {
            return res.status(200).send({ status: true, count: returnBook.length, message: "Book list", data: returnBook })
        } else {
            res.status(404).send({ status: false, message: "No Book Found" })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
// ### GET /books/:bookId
// // - Returns a book with complete details including reviews.
//  Reviews array would be in the form of Array. Response example [here](#book-details-response)
// // - Return the HTTP status 200 if any documents are found. 
// The response structure should be like [this](#successful-response-structure) 
// // - If the book has no reviews then the response body should include book detail as shown 
// [here](#book-details-response-no-reviews) and an empty array for reviewsData.
// // - If no documents are found then return an HTTP status 404 with a response like [this](#error-response-structure) 
const getBookById = async function (req, res) {
    try {
        const book = req.params.bookId

        const findBooks = await bookModel.findOne({ book: book, isDeleted: false })
            .select({
                _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, subcategory: 1,
                isDeleted: 1, reviews: 1, releasedAt: 1, createdAt: 1, updatedAt: 1, reviewsData: []
            })

        if (findBooks) return res.status(200).send({ status: true, message: "Book list ", data: findBooks })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
// status: true,
// message: 'Books list',
// data: {
//   "_id": ObjectId("88abc190ef0288abc190ef55"),
//   "title": "How to win friends and influence people",
//   "excerpt": "book body",
//   "userId": ObjectId("88abc190ef0288abc190ef02")
//   "category": "Book",
//   "subcategory": ["Non fiction", "Self Help"],
//   "isDeleted": false,
//   "reviews": 0,
//   "releasedAt": "2021-09-17"
//   "createdAt": "2021-09-17T04:25:07.803Z",
//   "updatedAt": "2021-09-17T04:25:07.803Z",
//   "reviewsData": []
// }
// }
// ``
// ### PUT /books/:bookId
// - Update a book by changing its
//   - title
//   - excerpt
//   - release date
//   - ISBN
// - Make sure the unique constraints are not violated when making the update
// - Check if the bookId exists (must have isDeleted false and is present in collection). If it doesn't, return an HTTP status 404 with a response body like [this](#error-response-structure)
// - Return an HTTP status 200 if updated successfully with a body like [this](#successful-response-structure) 
// - Also make sure in the response you return the updated book document. 


const updateBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let data = req.body
        const { title, excerpt, releasedAt, ISBN } = data

        if (!Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Data is not present in request body" })
        }
        if (!bookId) return res.status(400).send({ status: false, message: "BookId is required in params" })
 
        //____Validation____\\
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(404).send({ status: false, message: "you have entered a invalid book id or book is deleted" })
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(releasedAt)) {
            return res.status(400).send({ status: false, message: "Released date is not valid it should be YYYY-MM-DD" })
        }
        if (!/^([0-9]{10}|[0-9]{13}|[0-9]{17})$/.test(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN Must Be 10, 13 and 17 Digits Only" })
        }

        //____Duplicate_Validation____\\
        let uniqueTitle = await bookModel.findOne({ title: title })
        if (uniqueTitle) return res.status(409).send({ status: false, message: "Title already exists" })

        let uniqueISBN = await bookModel.findOne({ ISBN: ISBN })
        if (uniqueISBN) return res.status(409).send({ status: false, message: " ISBN already exists" })
  
        //____Updating____\\
        let updateBooks = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, {
            $set: { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN }
        }, { new: true })      // upsert = update and insert (optional in this case)

        if (!updateBooks)return res.status(404).send({ status: false, message: "BookId not found Or Deleted" })
        
          return res.status(200).send({ status: true, data: updateBooks })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: "error", error: error.message })
    }
}
let deleteBooks = async function (req, res) {
    try {
        let id = req.params.bookId

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "not a valid bookId" })
        }
        let validationDelete = await bookModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        if (!validationDelete) {
            return res.status(404).send({ status: false, message: "book does not exist" })
        }
        return res.status(200).send({ status: true, message: "Successfully Deleted" })

    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

module.exports = { createBook, getBook, getBookById, updateBooks ,deleteBooks }