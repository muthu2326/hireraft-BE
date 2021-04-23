const message = require("../service/message.json");
const Session = require('../models/SessionSchema');

exports.authenticate = (req, res, next) => {
    console.log('middleware :: entering authenticate session')
    console.log('req headers', req.headers)

    const token = req.headers.token;
    let flag = false;
    if (!token) {
        res.status(401).jsonp({
            status: 401,
            data: {},
            error: {
                msg: message.authorization_not_found
            }
        });
        return;
    }
    Session.findOne({token: token}, (err, sessionResponse) => {
        if (err) {
            console.log('err in employer getShorlistedCandidates', err)
            console.log('Exiting getShorlistedCandidates')
            res.send({
                status: 500,
                data: {},
                err: {
                    msg: message.something_went_wrong,
                    err: err
                }
            })
            return;
        }
        if(sessionResponse){
            console.log('session found')
                let NOW = new Date()
                console.log('checking current time with token expiry time')
                console.log('NOW ', NOW, 'expiry date', sessionResponse.expiryDate)
                console.log('result :: ', NOW < sessionResponse.expiryDate)
                if (NOW < sessionResponse.expiryDate) {
                    console.log('session is valid')
                    console.log('session data', sessionResponse)
                    req.user_id = sessionResponse.user_id
                    next();
                } else {
                    if(sessionResponse.role == 'employerCampign'){
                        res.status(401).jsonp({
                            status: 401,
                            data: {},
                            error: {
                                msg: message.link_expired
                            }
                        });
                        return;
                    }else{
                        res.status(401).jsonp({
                            status: 401,
                            data: {},
                            error: {
                                msg: message.session_expired
                            }
                        });
                        return;
                    }  
                }
        }else{
            res.status(401).jsonp({
                status: 401,
                data: {},
                error: {
                    msg: message.invalid_authorization
                }
            });
            return;
        }
    })
}