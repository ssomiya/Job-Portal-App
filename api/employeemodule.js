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

    searchresumesonskillordesignationorloation: function (req, res, next) {

        if (!req.query.data) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            var eventemit1 = new EventEmitter();
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');
                var arr = [];
                db.collection('job_details').find({ keyskills: req.query.data }).toArray(function (err, result) {
                    logger.debug("Lengthof result" + result.length);
                    // if (result.length > 0) {
                        eventemit1.emit('searchusingdesignation', result);
                    // }
                })//end of find

                eventemit1.on('searchusingdesignation', function (arr) {
                    db.collection('job_details').find({ designation: req.query.data }).toArray(function (err, result) {
                        logger.debug("Lengthof result" + result.length);
                        arr = arr.concat(result);
                        // res.send(arr);
                        eventemit1.emit('searchusinglocation', arr);
                    })//end of find
                })//end of emit

                eventemit1.on('searchusinglocation', function (arr) {
                    db.collection('job_details').find({ location: req.query.data }).toArray(function (err, result) {
                        logger.debug("Lengthof result" + result.length);
                        arr = arr.concat(result);
                        res.send(arr);
                    })//end of find
                })//end of emit

            });//end of mongo client
        }//end of else
    },
    applyjob: function (req, res, next) {

        if (!req.body.recruiterid || !req.body.userid || !req.body.jobdescription 
            || !req.body.organisation || !req.body.designation || !req.body.jobdescription
            || !req.body.keyskills || !req.body.yearsofexp || !req.body.organisationid || !req.body.location) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');

                db.collection('appliedjob_details').remove({ userid: req.body.userid }, (err, result) => {
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
                    status: 'applied',
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