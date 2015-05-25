
var File          = require('./config/mongodb').File;
var dropBoxClient = require('./config/dropbox');
var app           = require('./config/express');

//Servimos el index
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/views/index.html');
});

/*
* Nos envian un archivo, creamos un objeto File,
* mandamos el archivo a dropbox, y luego lo persistimos en mongo
*/
app.post('/uploadFile', function (req, res) {
  var userFile = req.files.file;
  
  var file = new File(
    {
      name : userFile.originalname,
      user : req.body.user,
      tags : req.body.tags.split(",")
    }
  );

  dropBoxClient.put(userFile.originalname, userFile.buffer, function(status, reply){
    file.save(function(){
      res.send(reply)
    });
  })
});

/*Dado un tag, buscamos los archivos con esos tags en mongo */
app.get('/search', function (req, res) {
  File.find({tags: req.query.name}, function(status, resp){
    res.send(resp)
  });
});

/*Dado un nombre de un archivo lo descargamos de dropbox*/
app.get('/download/:file', function (req, res) {
  dropBoxClient.media(req.params.file, function(status, reply){
    res.redirect(reply.url)
  })
});


/*Iniciamos el server */
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Obligatorio app listening at http://%s:%s', host, port);
});






