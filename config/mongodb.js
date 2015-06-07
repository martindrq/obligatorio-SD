var mongoose = require('mongoose');
//mongoose.connect('mongodb://root:root@ds031802.mongolab.com:31802/obligatorio-sd');
mongoose.connect('mongodb://localhost/myapp/obligatorio-sd');

module.exports = {
		File : mongoose.model('File', { name: String , tags:[], groups:[], groupCanWrite: Boolean, groupCanRead: Boolean, ownerCanRead: Boolean, ownerCanWrite: Boolean, publicCanWrite: Boolean, publicCanRead: Boolean, owner:String, version:Number}),
		User : mongoose.model('User', { name: String , password : String, groups:[]})
};




