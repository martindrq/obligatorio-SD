var Dropbox = require("dropbox");
var dbox  = require("dbox")

//Creamos una instancia de conexion a dropbox
var app    = dbox.app({ "app_key": "qcxgkunzqwwhxuu", "app_secret": "2nq5zqndgx87yk9" })
var client = app.client(
	{ 	oauth_token_secret: 'tw5jntf46es0zfo',
  		oauth_token: 'u1wy3yevoao44u6n',
  		uid: '100976628' 
  	}
);

module.exports = client;