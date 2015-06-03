
var File          = require('./config/mongodb').File;
var User          = require('./config/mongodb').User;
var dropBoxClient = require('./config/dropbox');
var app           = require('./config/express');
var _             = require('lodash');
var Q             = require('q');

//Servimos el index
app.post('/home', function (req, res) {
  console.log(req.body)
  User.find(
  {
    name: req.body.name, 
    password:req.body.password
  }, 
  function(status, resp){
      if(resp.length != 0){

        var user = _.first(resp);
        req.session.user = user;

        getFilesByUserGroup(user)
          .then(
            function(files){
              res.render('index',{user: user, files:files});
            }
          )
      } else { 
        res.end("No existe el usuario")
      }
  });
});

app.get('/home', function (req, res) {
  if(req.session.user){
    getFilesByUserGroup(req.session.user)
      .then(
        function(files){
          res.render('index',{user: req.session.user, files:files});
        }
      )
  }else{
    res.redirect('/'); 
  }
});

app.get('/', function (req, res) {
  res.render('login');
});

app.get('/users', function (req, res) {
  res.sendfile(__dirname + '/views/users.html');
});

app.post('/users', function (req, res) {
  var user = new User({
      name : req.body.name,
      password : req.body.password,
      groups : req.body.groups
  });
  user.save(function(){
    res.redirect('/');
  });
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
      owner : req.session.user.name,
      groupCanWrite: req.body.groupCanWrite, 
      groupCanRead: req.body.groupCanRead, 
      ownerCanRead: req.body.ownerCanRead, 
      ownerCanWrite: req.body.ownerCanWrite, 
      publicCanWrite: req.body.publicCanWrite, 
      publicCanRead: req.body.publicCanRead,
      groups : req.body.groups,
      tags : req.body.tags.split(",")
    }
  );

  File.findOne({name: userFile.originalname}, function(status, resp){
    //Archivo existe
    if(resp.length !== 0){
        if(hasPermission(req.session.user,resp,'write')){
          req.session.fileToConfirm = resp.name;
          req.session.fileToConfirmContent = userFile.buffer;
          res.render('rewriteConfirm',{file: resp, user: req.session.user});
        } else {
          res.end('No tienes permiso para modificar este archivo');
        }
    } else {
      dropBoxClient.put(userFile.originalname, userFile.buffer, function(status, reply){
        file.save(function(){
          res.redirect('/home');
        });
      })
    }
  });
});

app.post('/rewrite', function (req, res) {
  
  var fileName = req.session.fileToConfirm;
  var fileContent = req.session.fileToConfirmContent;

  File.findOne({name: fileName}, function(status, file){
    
    file.groupCanWrite = req.body.groupCanWrite; 
    file.groupCanRead = req.body.groupCanRead; 
    file.ownerCanRead = req.body.ownerCanRead; 
    file.ownerCanWrite = req.body.ownerCanWrite; 
    file.publicCanWrite = req.body.publicCanWrite; 
    file.publicCanRead = req.body.publicCanRead;
    file.groups  = req.body.groups;
    file.tags  = req.body.tags.split(",")

    dropBoxClient.put(file.name, fileContent, function(status, reply){
      console.log(file)
      console.log(file.save)
      file.save(function(){
        res.redirect('/home');
      });
    });

   });

});

/*Dado un tag, buscamos los archivos con esos tags en mongo */
app.get('/search', function (req, res) {
  File.find({tags: req.query.name}, function(status, resp){
    res.send(resp)
  });
});

/*Dado un nombre de un archivo lo descargamos de dropbox*/
app.get('/download/:file', function (req, res) {
  File.find({name: req.params.file}, function(status, resp){
    if(hasPermission(req.session.user, _.first(resp), 'read')){
      dropBoxClient.media(req.params.file, function(status, reply){
            res.redirect(reply.url)
      })
    } else {
      res.end("No tienes permiso para leer el archivo");
    }
  });
});


/*Iniciamos el server */
var server = app.listen((process.env.PORT || 3000), function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Obligatorio app listening at http://%s:%s', host, port);
});


function getFilesByUserGroup(user){
  var deferred = Q.defer();
  File.find({groups: {  $in: user.groups }}, function(status, resp){
    var indexByGroup ={};
    _.forEach(resp, function(file){
      _.forEach(file.groups, function(group){
          indexByGroup[group] = indexByGroup[group] || [];
          indexByGroup[group].push(file);
      });
    });
    deferred.resolve(indexByGroup);
  });
  return deferred.promise;
}

function hasPermission(user, file, type){
  var byGroup = _.intersection(user.groups, file.groups).length !== 0;
  var byOwner = user.name === file.owner;
  var byPublic = _.includes(file.groups, 'public');
  var hasPermission = false;

  if(byOwner){
    if(type === 'read'){
      hasPermission = hasPermission || file.ownerCanRead;      
    }
    if(type === 'write'){
      hasPermission = hasPermission || file.ownerCanWrite;      
    }
  }

  if(byGroup){
    if(type === 'read'){
      hasPermission = hasPermission || file.groupCanRead;      
    }
    if(type === 'write'){
      hasPermission = hasPermission || file.groupCanWrite;      
    }
  }

  if(byPublic){
    if(type === 'read'){
      hasPermission = hasPermission || file.publicCanRead;      
    }
    if(type === 'write'){
      hasPermission = hasPermission || file.publicCanWrite;      
    }
  }
  return hasPermission;
}