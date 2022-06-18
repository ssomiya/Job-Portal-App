var request = require('request');
const EventEmitter = require('events');
var log4js = require("log4js");
const { pathToFileURL } = require('url');
var logger = log4js.getLogger();
logger.level = "debug";
let nodemailer = require("nodemailer");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/JOB_PORTAL";

var jobmodule = {

    createjob: function (req, res, next) {

        if (!req.body.username || !req.body.userid || !req.body.emailid || !req.body.mobileno
            || !req.body.role || !req.body.organisation || !req.body.designation || !req.body.jobdescription
            || !req.body.keyskills || !req.body.yearsofexp || !req.body.organisationid || !req.body.location) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');
                var jobid = uuidv4();
                var savetodb = [{
                    userid: userid,
                    username: req.body.username,
                    password: req.body.password,
                    emailid: req.body.emailid,
                    mobileno: req.body.mobileno,
                    jobid: jobid,
                    organisation: req.body.organisation,
                    organisationid: req.body.organisationid,
                    designation: req.body.designation,
                    role: req.body.role,
                    jobdescription: req.body.jobdescription,
                    keyskills: req.body.keyskills,
                    location: req.body.location,
                    yearsofexp: req.body.yearsofexp,
                    CTC: req.body.ctc
                }]
                db.collection('job_details').insert(savetodb, (err, result) => {
                    logger.debug(result);
                    if (err) return logger.debug(err)
                    logger.debug("Number of documents inserted: " + result.insertedCount);
                    logger.debug('saved to database')
                    res.send({ isSuccess: true, message: "Job Saved" });
                })//end of insert

            });//end of mongoclient
        }//end of else
    },
    searchresumesonskillordesignation: function (req, res, next) {

        if (!req.query.data) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            var eventemit1 = new EventEmitter();
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');
                var arr = [];
                db.collection('account_details').find({ keyskills: req.query.data }).toArray(function (err, result) {
                    logger.debug("Lengthof result" + result.length);
                    if (result.length > 0) {
                        eventemit1.emit('searchusingdesignation', result);
                    }
                })//end of find

                eventemit1.on('searchusingdesignation', function (arr) {
                    db.collection('account_details').find({ designation: req.query.data }).toArray(function (err, result) {
                        logger.debug("Lengthof result" + result.length);
                        arr = arr.concat(result);
                        res.send(arr);
                    })//end of find
                })//end of emit

            });//end of mongo client
        }//end of else
    },
    sendmailtoemployee: function(req, res, next){
        
        if (!req.body.emailid || !req.body.password || !req.body.jobdescription) {
            
        }else{

            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "mailUserName",
                  pass: "mailPassword"
                }
              });
              // logger.debug("Value----"+JSON.stringify(obj.EmailID[i].EmailID));
  
              logger.debug("---------------------");
              logger.debug("Running Email Job");
              let mailOptions = {
  
                from: "mailUserName",
                to: req.body.emailid,
                subject: 'Job Requirement',
                html: jobdescription
              };
              logger.debug("mailOptions::" + JSON.stringify(mailOptions));
  
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  // throw error;
                  logger.debug(error + "Email : " + req.body.emailid);
                } else {
                  logger.debug("Email successfully sent!");
                }
              });
        }//end of else
    },
    sendmessage: function (req, res, next) {

        if (!req.body.recruiterid || !req.body.userid || !req.body.jobdescription 
            || !req.body.organisation || !req.body.designation || !req.body.jobdescription
            || !req.body.keyskills || !req.body.yearsofexp || !req.body.organisationid || !req.body.location) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');

                var savetodb = [{
                    userid: userid,
                    jobid: jobid,
                    recruiterid: req.body.recruiterid,
                    organisation: req.body.organisation,
                    organisationid: req.body.organisationid,
                    designation: req.body.designation,
                    jobdescription: req.body.jobdescription,
                    keyskills: req.body.keyskills,
                    location: req.body.location,
                    status: 'contacted',
                    yearsofexp: req.body.yearsofexp,
                    CTC: req.body.ctc
                }]
                db.collection('message_details').insert(savetodb, (err, result) => {
                    logger.debug(result);
                    if (err) return logger.debug(err)
                    logger.debug("Number of documents inserted: " + result.insertedCount);
                    logger.debug('saved to database')
                    res.send({ isSuccess: true, message: "Message Saved" });
                })//end of insert

            });//end of mongoclient
        }//end of else
    },
    viewjobapplications: function (req, res, next) {

        if (!req.query.jobid) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            var eventemit1 = new EventEmitter();
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');
                var arr = [];
                db.collection('appliedjob_details').find({ jobid: req.query.jobid }).toArray(function (err, result) {
                    logger.debug("Lengthof result" + result.length);
                    res.send(result);
                })//end of find
            });//end of mongo client
        }//enf of else
    },
    changestatus: function(req, res, next){
        
        if (!req.body.recruiterid || !req.body.userid || !req.body.jobdescription || req.body.status 
            || !req.body.organisation || !req.body.designation || !req.body.jobdescription
            || !req.body.keyskills || !req.body.yearsofexp || !req.body.organisationid || !req.body.location) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');

                db.collection('appliedjob_details').remove({ userid: req.body.userid, jobid: req.body.jobid }, (err, result) => {
                    logger.debug(result);
                    if (err) return logger.debug(err)
                    logger.debug('deleted a record')

                })//end of remove

                var savetodb = [{
                    userid: userid,
                    jobid: jobid,
                    recruiterid: req.body.recruiterid,
                    organisation: req.body.organisation,
                    organisationid: req.body.organisationid,
                    designation: req.body.designation,
                    jobdescription: req.body.jobdescription,
                    keyskills: req.body.keyskills,
                    location: req.body.location,
                    status: req.body.status,
                    yearsofexp: req.body.yearsofexp,
                    CTC: req.body.ctc
                }]
                db.collection('appliedjob_details').insert(savetodb, (err, result) => {
                    logger.debug(result);
                    if (err) return logger.debug(err)
                    logger.debug("Number of documents inserted: " + result.insertedCount);
                    logger.debug('saved to database')
                    res.send({ isSuccess: true, message: "Message Saved" });
                })//end of insert

            });//end of mongoclient
        }//end of else
    }
}
module.exports = jobmodule;