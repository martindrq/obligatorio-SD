var multer  = require('multer')
var express = require('express');
var session = require('express-session');
var app = express();

app.use(session({secret: 'scsdvssdfsdf34d'}));
app.use(express.static('public'));
app.use(multer({ dest: './uploads/', inMemory:true}))
app.set('view engine', 'ejs');  

module.exports = app;