const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route');
const { default: mongoose } = require('mongoose');
const app = express();
const multer=require('multer')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use( multer().any())

mongoose.connect("mongodb+srv://syedfaizanali798:qIuO1FNAsWQj7j9T@cluster0.pgdyj.mongodb.net/group15Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});