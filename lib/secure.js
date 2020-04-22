var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Ef12';
// crypto.DEFAULT_ENCODING = 'hex';

// exports.encrypt = function(text) {
//     var cipher = crypto.createCipher(algorithm, password)
//     var crypted = cipher.update(text, 'utf8', 'hex')
//     crypted += cipher.final('hex');
//     return crypted;
// }

// exports.decrypt = function(text) {
//     var decipher = crypto.createDecipher(algorithm, password)
//     var dec = decipher.update(text, 'hex', 'utf8')
//     dec += decipher.final('utf8');
//     return dec;
// }

exports.hashPassword = function(salt, password) {
    if (salt && password) {
        var hashed = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
        console.log("hashed ????",hashed);
        return hashed;
    } else {
        return password;
    }
};

