var Q    = require('q');
var fs    = require('fs');

var appPath = 'user/admin/obligatorio/';
var host 	= '192.168.1.50';
var port 	= 50070;

//var WebHDFS = require('webhdfs');
var hdfs = new (require("node-webhdfs")).WebHDFSClient({ user: 'admin' ,namenode_host: host, namenode_port: port });

var api  = {

	put : function(file){

 		var deferred = Q.defer();

		hdfs.del('/'+appPath+file.originalname,null,null,function(err){

			hdfs.create('/'+appPath+file.originalname,file.buffer,null,null,function(a){
		
			  	hdfs.append('/'+appPath+file.originalname,file.buffer,function(a){			  		
				   	deferred.resolve("OK")
				 });
			});
		});

		return deferred.promise;
	},
	getLink : function(fileName){
 		return "http://"+host+":"+port+"/webhdfs/v1/"+appPath+fileName+"?op=open";
	}
}

module.exports = api;