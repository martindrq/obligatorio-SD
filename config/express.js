var multer  = require('multer')
var express = require('express');
var app = express();

app.use(express.static('public'));
app.use(multer({ dest: './uploads/', inMemory:true}))
app.set('view engine', 'ejs');  

module.exports = app;