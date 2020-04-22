var Validator = require('./Validator');
var waterfall = require('async-waterfall');


function removeDups(array) {
    return array.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
    });
}

function make_rules(str) {
    var chunks = str.split(',');
    var result = {};

    chunks.map(function(chunk) {
        chunk = chunk.split(':');
        var rule_data = {};
        rule_data.type = chunk[1];
        if (chunk[1] == 'string' || chunk[1] == 'number') {
            rule_data.minlength = 1; // default value

        }
        result[chunk[0]] = rule_data;
    });
    return result;
}




module.exports = {
    Validator: Validator,
    removeDups: removeDups,
    make_rules: make_rules,
}