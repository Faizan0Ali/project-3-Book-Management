const express = require("express")
const router = express.Router();

const userController = require('../controller/userController')
const bookController=require('../controller/bookController')
const reviewController=require('../controller/reviewController')

//____Creating_User____\\
router.post('/register', userController.CreateRegister)
//____User_Login_____\\
router.post('/login', userController.userLogin)

//----------------------Books_Block--------------------------------\\

//____Creating_books____\\
router.post('/books', bookController.createBook)
//____Get_books____\\
router.get('/books', bookController.getBook)
//____Get_books_By_Id____\\
router.get('/books/:bookId', bookController.allBook)

//----------------------Review_Block--------------------------------\\

//____Get_books_By_Id____\\
router.post("/books/:bookId/review", reviewController.postReview )


module.exports = router;