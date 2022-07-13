const bookModel = require('../Models/bookModel')
const userModel = require('../Models/userModel')
const moment = require('moment')

const mongoose = require('mongoose')
const reviewModel = require('../Models/reviewModel')

let isValid = function(value){
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value != "string" || value.trim().length == 0) return false;
    return true;
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
 };
const createBook = async function (req, res) {
    try {
        const data = req.body
        const { title, excerpt, userId, ISBN, category, subcategory,releasedAt } = data

        //_Mandatory_Fields_\\
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please enter valid Detail" })
        if (!title) return res.status(400).send({ status: false, message: "Title is mandatory" })
        if (!excerpt) return res.status(400).send({ status: false, message: "excerpt is mandatory" })
        if (!userId) return res.status(400).send({ status: false, message: "userId is mandatory" })
        if (!ISBN) return res.status(400).send({ status: false, message: "ISBN is mandatory" })
        if (!category) return res.status(400).send({ status: false, message: "category is mandatory" })
        if (!subcategory) return res.status(400).send({ status: false, message: "subcategory is mandatory" })
    
        //_Validation_\\
        if (mongoose.Types.ObjectId.isValid(userId) == false) {
            return res.status(400).send({ status: false, message: "userId Invalid" });
        }
        if (!/^(18|19|20)[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt)) {
           return res.status(400).send({ status: false, message: "Released date is not valid it should be YYYY-MM-DD" })
       }
        if (!/^([0-9]{10}|[0-9]{13}|[0-9]{17})$/.test(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN Must Be 10, 13 and 17 Digits Only" })
        }
        
         let userLoggedIn = req.decodedToken.userId
         if (req.body.userId !== userLoggedIn)
         return res.status(403).send({ status: false, msg: 'User logged is not allowed to modify the requested users data' })
   

        //_Duplicate_Validation_\\
        const checkTitle = await bookModel.findOne({ title })
        if (checkTitle) return res.status(409).send({ status: false, message: "Title already exists" })

        const checkISBN = await bookModel.findOne({ ISBN })
        if (checkISBN) return res.status(409).send({ status: false, message: "ISBN already exists" })

        const userID = await userModel.findOne({ _id: userId })
        if (!userID) return res.status(404).send({ status: false, message: "UserID not Found" })

        //_Creating_\\
        const postBook = await bookModel.create(data)
        res.status(201).send
            ({ status: true, message: "Created successfully", data: postBook})
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
const getBook = async function (req, res) {
    try {
        const dataFromQuery = req.query
        const { userId, category, subcategory } = dataFromQuery
        if(userId){
            if(!isValidObjectId(userId)){     
              return res.status(400).send({status: false, message: `${userId}It is not a valid user id`})
              }}

        // if (!mongoose.Types.ObjectId.isValid(userId)) {
        //     return res.status(400).send({ status: false, message: "userId Invalid" });
        // }
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
        const bookId = req.params.bookId
        bookId.isDeleted=false
        if(!mongoose.Types.ObjectId.isValid(bookId)){
            return res.status(400).send({status:false,message:'Invalid UserId Format'})
        }
        
        const findBooks = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if(!findBooks){
            return res.status(404).send({status:false, message:"book not found"})}
        let obj = { 
            _id: findBooks._id,
            title: findBooks.title,
            excerpt: findBooks.excerpt,
            userId: findBooks.userId,
            category: findBooks.category,
            subcategory: findBooks.subcategory,
            isDeleted: findBooks.isDeleted,
            reviews: findBooks.reviews,
            releasedAt: findBooks.releasedAt,
            createdAt: findBooks.createdAt,
            updatedAt: findBooks.updatedAt
          }
     
        const reviewDetail = await reviewModel.find({ bookId: bookId, isDeleted: false });    
        obj.reviewsData = reviewDetail
        return res.status(200).send({ status: true, message: "Book list ", data: obj });
        
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
const updateBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let data = req.body
        const { title, excerpt, releasedAt, ISBN } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Data is not present in request body" })
        }
        if (!bookId) return res.status(400).send({ status: false, message: "BookId is required in params" })
 
        //____Validation____\\
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(404).send({ status: false, message: "you have entered a invalid book id or book is deleted" })
        }
        let findBook = await bookModel.findOne({ _id: bookId })
        
        let userLoggedIn = req.decodedToken.userId
        if (findBook.userId.toString() !== userLoggedIn)
        return res.status(403).send({ status: false, msg: 'User logged is not allowed to modify the requested users data' })
        
        if (!/^(18|19|20)[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt)) {
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
        let bookId = req.params.bookId

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "not a valid bookId" })
        }
        const checkBookId = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookId) return res.status(404).send({ status: false, message: "Book Not Found Maybe Deleted" })

        let userLoggedIn = req.decodedToken.userId
        if (checkBookId.userId.toString() != userLoggedIn){
        return res.status(403).send({ status: false, msg: 'User logged is not allowed to modify the requested users data' })
        }

        await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })

        return res.status(200).send({ status: true, message: "Successfully Deleted" })

    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

module.exports = { createBook, getBook, getBookById, updateBooks ,deleteBooks }