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
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM image_locations', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
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
    client.query('INSERT INTO image_locations(url) VALUES("' + path + '")', function(err, result) {
      done();
      if (err)
       { console.error(err); res.send("Error " + err); }
    });
    if(err){
      console.log(err);
    }
  });
  res.send("ok");
})



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
