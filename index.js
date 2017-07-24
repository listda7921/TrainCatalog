var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require("fs");
var pg = require("pg");
var uuid = require('uuid');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
 fs.readdir(__dirname + '/img', function( err, files ) {
 if(err){
   console.log(err);
 }
 else{
   files.forEach(function(file){
     if('/img/'+ file == '/img/032f0770-6dc8-11e7-be82-59533fcdbf61.jpg'){
        console.log('/img/' + file);  
        var data = base64_encode(__dirname + '/img/' + file);
        console.log(data);
     }
    
   })
   
 }
   
 });
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM image_locations', function(err, result) {
      done();
      var data;
      var results = [];
      var test;
      var path;
      if (err)
       { console.error(err); response.send("Error " + err); }
      else{
      //   fs.readdir(__dirname + '/img', function( err, files ) {
      //     if( err ) {
      //         console.error( "Could not list the directory.", err );
      //         process.exit( 1 );
      //     } 
      //     else{
      //     files.forEach( function( file, index ) {
      //       result.forEach(function(r){
      //         if(r.url  == ('/img/' + file)){
      //           data = base64_encode(__dirname + '/img/' + file);
      //           results.push(data);
      //         }
      //       });
      //     });
      //     }
     
      //     response.render('pages/db', {base64Array: results });
   
      // });
      
      
      
      //test
      fs.readdir(__dirname + '/img/', function( err, files ) {
        path = __dirname;
        results.push("test");
        test = files[0];
      if(err){
        console.log(err);
       // results.push(err);
      }
      else{
        var res = result.rows;
        files.forEach(function(file){
          //res.forEach(function(r){
            //if(r == '/img/6c5f4840-6dc8-11e7-be82-59533fcdbf61.jpg'){
              console.log('/img/' + file);
              data = base64_encode(__dirname + '/img/' + file);
              results.push('/img/' + file);
              console.log(data);
           // }  
         // })
           
          
        })
         
      }
         
      });
      
      var res = result.rows[0].url;
        var resData = base64_encode(__dirname + "/img/6c5f4840-6dc8-11e7-be82-59533fcdbf61.jpg");
        //response.render('pages/db', {base64: data , results: results});
        response.send({base64: res , results: results, test: test, another: 'hello world', path: path});
    }
  });
});
});

app.post('/api/Upload', function(req, res){
  var img = decodeBase64Image(req.body.base64String);
  var fileName = uuid.v1();
  var path = '/img/' + fileName + '.jpg';
  fs.writeFile(__dirname + path, img.data, function(err) {
    console.log(err);
  });
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      var query = "INSERT INTO image_locations(url) VALUES('" + path + "')";
    client.query(query, function(err, result) {
      done();
      if (err)
       { console.error(err); res.send("Error " + err); }
    });
    if(err){
      console.log(err);
    }
  });
  res.send("ok");
});



function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};
  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }
  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');
  return response;
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}