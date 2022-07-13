const express = require("express")
const router = express.Router();

const userController = require('../controller/userController')
const bookController=require('../controller/bookController')
const reviewController=require('../controller/reviewController')

const mid = require('../middleware/auth')


//____Creating_User____\\
router.post('/register', userController.CreateRegister)
//____User_Login_____\\
router.post('/login', userController.userLogin)

//----------------------Books_Block--------------------------------\\
// ,Authorization.authorise
//____Creating_books____\\
router.post('/books', mid.authenticate,bookController.createBook)
//____Get_books____\\
router.get('/books', mid.authenticate,bookController.getBook)
//____Get_books_By_Id____\\
router.get('/books/:bookId', mid.authenticate,bookController.getBookById)
//_update_books_By_Id_\\
router.put('/books/:bookId', mid.authenticate,mid.authorise,bookController.updateBooks)
//_delete book_\\
router.delete('/books/:bookId',mid.authenticate, bookController.deleteBooks)

//----------------------Review_Block--------------------------------\\

//____Get_books_By_Id____\\
router.post("/books/:bookId/review", reviewController.postReview )
//____Update_review_by_Id____\\
router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)

//____Delete_review_by_Id____\\
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReview)

module.exports = router;