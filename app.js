var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var path = require("path");
var fs = require('fs');
var mv = require('mv');
var multer = require('multer');
var timeout = require('connect-timeout');
var cors = require('cors');
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";

var jsonParser = bodyParser.json({ limit: 1024 * 1024 * 20, type: 'application/json' });

app.use(bodyParser.json({
  limit: '1000mb'
}));

app.use(bodyParser.urlencoded({
  limit: '1000mb',
  parameterLimit: 1000000000,
  extended: true
}));

app.use(timeout(2000000000)); //10min and plus
app.use(jsonParser);
app.use(cors());

var storage2 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'tempfolder');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload2 = multer({ storage: storage2 }).single('filename');

var account_route = require('./api/account.js');
var recruiter_route = require('./api/recruitermodule.js');
var employee_route = require('./api/employeemodule.js');

//Account Module
app.post('/api/v1/register', jsonParser, function (req, res) {

  let response = account_route.register(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

app.post('/api/v1/login', jsonParser, function (req, res) {

  let response = account_route.login(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

app.post('/api/v1/updateprofile', jsonParser, function (req, res) {

  let response = account_route.updateprofile(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

app.get('/api/v1/getdetails', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = account_route.getdetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/api/v1/uploadresume', function (req, res) {
  fs.access("tempfolder", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      logger.debug("Directory Does Not exist!");
    }
    else {
      upload2(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        console.log("__dirname::: " + __dirname);
        console.log(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/tempfolder/' + req.file.filename;
          //filenamearr.push(uploadpath);
          logger.debug(uploadpath);

          var ext = path.extname(req.file.originalname);
          logger.debug("extension :::" + ext);

          var filename = req.file.originalname;

          //rename the file
          var oldfilename = filename;

          var docname = req.body.userid + ext;
          console.log("docname::: " + docname);
          console.log("oldfilename:: " + oldfilename);
          fs.rename(__dirname + '/tempfolder/' + oldfilename, __dirname + '/tempfolder/' + docname, function (err) {
            if (err) console.log('ERROR: ' + err);
          });

          //copying file from tempfolder to uploads
          mv(__dirname + '/tempfolder/' + docname, __dirname + '/uploads/employee/resume/' + docname, function (err) {
            if (err) { throw err; }
            console.log('file moved successfully');
          });

          var output = { isSuccess: true, filename: docname, filetype: ext.toString(), result: "Document uploaded successfully!" };
          res.send(output);

        } else {
          res.sendStatus(204);
        }

      });
    }
  })
});

app.post('/api/v1/uploadphoto', function (req, res) {
  fs.access("tempfolder", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      logger.debug("Directory Does Not exist!");
    }
    else {
      upload2(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        console.log("__dirname::: " + __dirname);
        console.log(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/tempfolder/' + req.file.filename;
          //filenamearr.push(uploadpath);
          logger.debug(uploadpath);

          var ext = path.extname(req.file.originalname);
          logger.debug("extension :::" + ext);

          var filename = req.file.originalname;

          //rename the file
          var oldfilename = filename;

          var docname = req.body.userid + ext;
          console.log("docname::: " + docname);
          console.log("oldfilename:: " + oldfilename);
          fs.rename(__dirname + '/tempfolder/' + oldfilename, __dirname + '/tempfolder/' + docname, function (err) {
            if (err) console.log('ERROR: ' + err);
          });

          //copying file from tempfolder to uploads
          if (String(req.body.role) == "employee") {
            mv(__dirname + '/tempfolder/' + docname, __dirname + '/uploads/employee/photo/' + docname, function (err) {
              if (err) { throw err; }
              console.log('file moved successfully');
            });

          } else {
            mv(__dirname + '/tempfolder/' + docname, __dirname + '/uploads/recruiter/photo/' + docname, function (err) {
              if (err) { throw err; }
              console.log('file moved successfully');
            });

          }

          var output = { isSuccess: true, filename: docname, filetype: ext.toString(), result: "Document uploaded successfully!" };
          res.send(output);

        } else {
          res.sendStatus(204);
        }

      });
    }
  })
});

app.post('/api/v1/deleteaccount', jsonParser, function (req, res) {

  let response = account_route.deleteaccount(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

//Recurtier - Job Module
app.post('/api/v1/createjob', jsonParser, function (req, res) {

  let response = recruiter_route.createjob(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

app.get('/api/v1/searchresumes', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = recruiter_route.searchresumesonskillordesignation(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/api/v1/sendmail', jsonParser, function (req, res) {

  let response = recruiter_route.sendmailtoemployee(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

app.post('/api/v1/sendmessage', jsonParser, function (req, res) {

  let response = recruiter_route.sendmessage(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

app.get('/api/v1/viewapplication', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = recruiter_route.viewjobapplications(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/api/v1/changestatus', jsonParser, function (req, res) {

  let response = recruiter_route.changestatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

//Employee - Job Module
app.get('/api/v1/searchjobs', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = employee_route.searchresumesonskillordesignationorlocation(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/api/v1/applyjob', jsonParser, function (req, res) {

  let response = employee_route.applyjob(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

var listen = app.listen(3005, () => logger.debug('server started on port 3005'));
listen.setTimeout(2000000000); 