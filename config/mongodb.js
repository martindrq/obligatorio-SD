var mongoose = require('mongoose');
mongoose.connect('mongodb://root:root@ds031802.mongolab.com:31802/obligatorio-sd');

module.exports = {
		File : mongoose.model('File', { name: String , user : String, tags:[]})
};