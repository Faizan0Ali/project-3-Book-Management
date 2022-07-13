const userModel = require('../Models/userModel')
const jwt = require('jsonwebtoken')

const CreateRegister = async function (req, res) {
    try {
        const data = req.body
        const { title, name, phone, email, password, address } = data

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please enter valid Detail" })

        //____Mandatory_Fields____\\
        if (!title) return res.status(400).send({ status: false, message: "Title is mandatory" })
        if (!name) return res.status(400).send({ status: false, message: "Name is mandatory" })
        if (!phone) return res.status(400).send({ status: false, message: "Phone is mandatory" })
        if (!email) return res.status(400).send({ status: false, message: "Email is mandatory" })
        if (!password) return res.status(400).send({ status: false, message: "Password is mandatory" })

        //____Validation_Section____\\
        if (!["Mr", "Mrs", "Miss"].includes(title)) {        // .includes is used for enum and it should be only this
            return res.status(400).send({ status: false, message: "Title Must be of these values [Mr, Mrs, Miss] " })
        }
        if (!/^[a-zA-Z ]{2,30}$/.test(name)) {
            return res.status(400).send({ status: false, message: "Name Should Be 2-30 Characters" })
        }
        if (!/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(email)) {
            return res.status(400).send({ status: false, message: "Email Id Is Not Valid" })
        }
        if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone)) {
            return res.status(400).send({ status: false, message: "Phone Number Is Not Valid" })
        }
        if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password)) {
            return res.status(400).send({ status: false, message: "Password Should First Capital letter and 8-15 characters" })
        }

        // if (!/^\d+\s[A-z]+\s[A-z]+/g.test(address.street)) { // ????????? question to TA  about pincode????????
        //     return res.status(400).send({ status: false, message: "Street Is Not Valid" })
        // }
        if (!/^[a-zA-Z ]{2,30}$/.test(address.city)) { // ????????? question to TA  about pincode????????
            return res.status(400).send({ status: false, message: "City Is Not Valid" })
        }
        if (!/^[0-9]{6,6}$/.test(address.pincode)) { // ????????? question to TA  about pincode????????
            return res.status(400).send({ status: false, message: "Pincode Is Not Valid" })
        }
        //____Duplicate_Validation____\\
        const duplicateEmail = await userModel.findOne({ email })
        if (duplicateEmail) return res.status(409).send({ status: false, message: `This Email Already Exist ::${email}` })

        const duplicatePhone = await userModel.findOne({ phone })
        if (duplicatePhone) return res.status(409).send({ status: false, message: `This Phone Number Already Exist ::${phone}` })

        const createData = await userModel.create(data)
        res.status(201).send({ status: true, message: "Succesfully Created", data: createData })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }
}

// - On a successful login attempt return a JWT token contatining the userId, exp, iat.

const userLogin = async function (req, res) {
  try{
    let data = req.body
    let { email, password } = data

    if(Object.keys(data).length==0)return res.status(400).send({status:false, message: "Please Enter Details"})
    if (!email || !password) return res.status(400).send({ status: false, message: "Email Id And Password is mandatory" })
  
    const user = await userModel.findOne({ email, password })
    if(!user)return res.status(400).send({status:false,message:"Email Or Password Is Incorrect"})

    //____Creating_JsonWebToken____\\
    let token = jwt.sign(
        {
            userId: user._id.toString(),
            company : "Team15",
            organisation: "functionUp"
        },
        "BookManagement",{ expiresIn: "1h" }
    );
    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, message: "Login successfully" , token: token, issuedAt:new Date(),expiresIn: "1h"})
    } catch(error){
        return res.status(500).send({status:false, message: error.message})
    }
}
module.exports = { CreateRegister, userLogin }
