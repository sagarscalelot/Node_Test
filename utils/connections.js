let mongoose = require('mongoose');
let mongoDB = mongoose.createConnection("mongodb://localhost:27017/DemoPractice", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
module.exports = mongoDB;