const jwt = require("jsonwebtoken");
const bookModel = require("../Models/bookModel") 

//================================================= Authentication ==================================================//
const authenticate = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"] || req.headers["X-Api-Key"]
    if (!token) return res.status(400).send({ status: false, msg: "token must be present in the request header" })
    let decodedToken = jwt.verify(token, 'BookManagement', function (err, decodedToken) {
      if (err) {
        res.status(401).send({ status: false, msg: "invalid token" })
      } else {
        return decodedToken
      }
    })

    req.decodedToken = decodedToken

    next()
  }
  catch (err) {
    res.status(500).send({ msg: err.message })
  }
}

//================================================= Authorization ==================================================//

const authorise = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"] || req.headers["X-Api-Key"]
    let bookId = req.params.bookId
    const decodedToken =jwt.verify(token, "BookManagement")

    if (!(/^[0-9a-fA-F]{24}$/.test(bookId))) {
      return res.status(400).send({ status: false, message: 'please provide valid bookId' })
  }
  const bookByBookId = await bookModel.findOne({_id : bookId, isDeleted : false})

  if(!bookByBookId){
  return res.status(404).send({status : false, message : `no book found by ${bookId}`})    
  }
  if((decodedToken.userId != bookByBookId.userId)){   
    return res.status(403).send({status : false, message : `unauthorized access`})
    }

    next()  
  }
  catch (err) {
    res.status(500).send({ msg: err.message })
  }
}

module.exports = {authenticate, authorise}