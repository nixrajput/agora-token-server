var express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

var PORT = process.env.PORT || 8080;

if (!(process.env.APP_ID && process.env.APP_CERTIFICATE)) {
    throw new Error('You must define an APP_ID and APP_CERTIFICATE');
}
var APP_ID = process.env.APP_ID;
var APP_CERTIFICATE = process.env.APP_CERTIFICATE;

const expirationTimeInSeconds = 3600; // 1 hour

const currentTimestamp = Math.floor(Date.now() / 1000);

const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

const Rtcrole = RtcRole.PUBLISHER;

var app = express();

function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

var generateAccessToken = function (req, resp) {
    resp.header('Access-Control-Allow-Origin', "*")

    var channel = req.query.channel;
    if (!channel) {
        return resp.status(500).json({ 'error': 'channel name is required' });
    }

    var uid = req.query.uid;
    if (!uid) {
        uid = 0;
    }

    var expiredTs = req.query.expiredTs;
    if (!expiredTs) {
        expiredTs = privilegeExpiredTs;
    }

    var role = req.query.role;
    if(!role){
        role=RtcRole;
    }

    const tokenA = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channel, uid, role, expiredTs);
    return resp.json({ 'token': tokenA });
};

app.get('/access_token', nocache, generateAccessToken);

app.listen(PORT, function () {
    console.log('Service URL http://127.0.0.1:' + PORT + "/");
    console.log('Channel Key request, /access_token?uid=[user id]&channel=[channel name]&role=[RtcRole.PUBLISHER]');
    console.log('Channel Key with expiring time request, /access_token?uid=[user id]&channel=[channel name]&expiredTs=[expire ts]');
});
