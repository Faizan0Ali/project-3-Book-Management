const jwt = require("jsonwebtoken");
const booksModel = require("../model/booksModel") 

//================================================= Authentication ==================================================//

const authenticate = async function (req, res, next) {
    try {
      let token = req.headers["x-Api-Key"];
      if (!token) {
        token = req.headers["x-api-key"];
      }
      //If no token is present in the request header return error
      if (!token) {
  
        return res.status(400).send({ status: false, msg: "token must be present" });
      }
      // console.log(token);
  
      let decodedToken = jwt.verify(token, " group 15");
  
      if (!decodedToken) {
        return res.status(403).send({ status: false, msg: "token is invalid" });
      }
    }
    catch (error) {
      console.log(error.message)
      res.status(500).send({ msg: " Server Error", error: error.message })
    }
    next()
  }
  
//================================================= Authorization ==================================================//


const authorise = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res.status(400).send({ status: false, msg: "token must be present" });
    }
    let decodedToken = jwt.verify(token, "group 15");

    let bookId = req.params.bookId
    let book = await booksModel.findById(bookId)

    if (!book) {
      return res.status(404).send({ status: false, msg: "book does not exists" })
    }
    if (book.isDeleted) {
      return res.status(404).send( {status: false, msg: "book is already deleted"} )
    }
    
    let userLoggedIn = decodedToken.userId

    if (book.userId != userLoggedIn) {
      return res.status(403).send({ status: false, msg: 'user logged is not allowed to modify the requested users data' })
    }
    next()
  }
  catch (error) {
    res.status(500).send({ msg: error.message })
  }
}




module.exports = {authenticate, authorise}