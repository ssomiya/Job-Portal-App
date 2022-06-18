var request = require('request');
const EventEmitter = require('events');
var log4js = require("log4js");
const { pathToFileURL } = require('url');
var logger = log4js.getLogger();
logger.level = "debug";
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/JOB_PORTAL";

var AccountModule = {

    register: function (req, res, next) {

        if (!req.body.username || !req.body.password || !req.body.emailid || !req.body.mobileno
            || !req.body.role || !req.body.organisation || !req.body.designation) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {

            var emailid = req.body.emailid;
            var eventemit1 = new EventEmitter();
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');
                db.collection('account_details').find({ emailid: emailid }).toArray(function (err, result) {
                    logger.debug("Lengthof result" + result.length);
                    if (result.length > 0) {
                        res.send({ isSuccess: false, message: "User already exists" });
                    }
                    else {
                        eventemit1.emit('savedetails');
                    }
                })//end of find

                eventemit1.on('savedetails', function () {
                    var userid = uuidv4();
                    var savetodb = [{
                        userid: userid,
                        username: req.body.username,
                        password: req.body.password,
                        emailid: req.body.emailid,
                        mobileno: req.body.mobileno,
                        organisation: req.body.organisation,
                        designation: req.body.designation,
                        role: req.body.role
                    }]
                    db.collection('account_details').insert(savetodb, (err, result) => {
                        logger.debug(result);
                        if (err) return logger.debug(err)
                        logger.debug("Number of documents inserted: " + result.insertedCount);
                        logger.debug('saved to database')
                        res.send({ isSuccess: true, message: "User Created" });
                    })//end of insert

                })//end of eventemit1

            })//end of mongoclient
        }//end of else
    },
    login: function (req, res, next) {

        if (!req.body.data || !req.body.password) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            var eventemit1 = new EventEmitter();
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');
                db.collection('account_details').find({ username: req.body.data, password: req.body.password }).toArray(function (err, result) {
                    logger.debug("Lengthof result" + result.length);
                    if (result.length > 0) {
                        res.send({ isSuccess: true, message: "Successfully Logged In" });
                    }
                    else {
                        eventemit1.emit('findusingemail');
                    }
                })//end of find

                eventemit1.on('findusingemail', function () {
                    db.collection('account_details').find({ emailid: req.body.data, password: req.body.password }).toArray(function (err, result) {
                        logger.debug("Lengthof result" + result.length);
                        if (result.length > 0) {
                            res.send({ isSuccess: true, message: "Successfully Logged In" });
                        }
                        else {
                            res.send({ isSuccess: false, message: "Username/Password is Incorrect" });
                        }
                    })//end of find
                })//end of eventemit1
            })//end of mongoclient
        }//end of else
    },
    updateprofile: function (req, res, next) {
        if (!req.body.userid || !req.body.role) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');
                //remove
                db.collection('account_details').remove({ userid: req.body.userid }, (err, result) => {
                    logger.debug(result);
                    if (err) return logger.debug(err)
                    logger.debug('deleted a record')

                })//end of remove

                if (String(req.body.role).toLowerCase() == "employee") {

                    var pathToFileURL = '/uploads/employee/resume/' + userid + '.pdf'
                    var pathToPhotoURL = '/uploads/employee/photo/' + userid + '.pdf'
                    var savetodb = [{
                        userid: userid,
                        username: req.body.username,
                        password: req.body.password,
                        emailid: req.body.emailid,
                        mobileno: req.body.mobileno,
                        organisation: req.body.organisation,
                        designation: req.body.designation,
                        role: req.body.role,
                        file: pathToFileURL,
                        photo: pathToPhotoURL,
                        keyskills: req.body.skills,
                        employeedetails: req.body.employeedetails,
                        education: req.body.education,
                        yearofexperience: req.body.yearofexperience,
                        languages: req.bod.languages
                    }]
                    db.collection('account_details').insert(savetodb, (err, result) => {
                        logger.debug(result);
                        if (err) return logger.debug(err)
                        logger.debug("Number of documents inserted: " + result.insertedCount);
                        logger.debug('saved to database')

                        res.send({ isSuccess: true, message: "Successfully Updated the Profile" });

                    })//end of insert
                } else {

                    var pathToPhotoURL = '/uploads/recruiter/photo/' + userid + '.pdf'
                    var savetodb = [{
                        userid: userid,
                        username: req.body.username,
                        password: req.body.password,
                        emailid: req.body.emailid,
                        mobileno: req.body.mobileno,
                        organisation: req.body.organisation,
                        designation: req.body.designation,
                        role: req.body.role,
                        photo: pathToPhotoURL,
                        languages: req.bod.languages
                    }]
                    db.collection('account_details').insert(savetodb, (err, result) => {
                        logger.debug(result);
                        if (err) return logger.debug(err)
                        logger.debug("Number of documents inserted: " + result.insertedCount);
                        logger.debug('saved to database')

                        res.send({ isSuccess: true, message: "Successfully Updated the Profile" });

                    })//end of insert
                }
            })//end of mongoclient
        }
    },
    getdetails: function (req, res, next) {
        if (!req.body.userid || !req.body.role) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');
                db.collection('account_details').find({ userid: req.body.userid }).toArray(function (err, result) {
                    logger.debug("Lengthof result" + result.length);
                    if (result.length > 0) {
                        res.send(result[0]);
                    }
                    else {
                        res.send([]);
                    }
                })//end of find
            })//end of mongo client
        }
    },
    deleteaccount: function(req, res, next){
        if (!req.body.userid) {

            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("JOB_PORTAL");
                logger.debug('CONNECTED');
                //remove
                db.collection('account_details').remove({ userid: req.body.userid }, (err, result) => {
                    logger.debug(result);
                    if (err) return logger.debug(err)
                    logger.debug('deleted a record')
                    res.send({ isSuccess: true, message: "Successfully Deleted the Profile" });

                })//end of remove
            })//end of mongoclient
        }
    }

}
module.exports = AccountModule;
