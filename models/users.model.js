let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({	
	fullName: {
		type: String,
		default: ''
	},
	userName: {
		type: String,
		default: ''
	},
  contact_no: {
		type: String,
		require: true
	},
	
}, { timestamps: true, strict: false, autoIndex: true });
schema.plugin(mongoosePaginate);
module.exports = schema;