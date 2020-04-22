function Validator(rules) {
	this.errors = {};
	this.isValid = true;
	this.setRules = function(rules) {
		if (typeof rules === 'string') {
			rules = lib.make_rules(rules);
		}
		this.rules = rules;
	};
	this.setError = function(key, message) {
		if (!this.errors[key]) this.errors[key] = [];
		this.errors[key].push(message);
		this.isValid = false;
		return false;
	};
	this.setRules(rules);
}

Validator.prototype.run = function(obj) {
	if (!obj) return this.setError(0, "Object is undefined!");
	for (var field in this.rules) {
		for (var key in this.rules[field]) {
			var value = obj[field];
			if (this.rules[field].optional && value === undefined) {
				continue;
			}
			if (value === undefined) {
				this.setError(field, field + " is undefined!");
				break;
			}
			switch (key) {
			case 'type':
				var type = this.rules[field][key];
				var typeMatches = true;
				if (value != undefined) {
					if (type == 'email') {
						var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
						var email_result = re.test(value);
						if (false === email_result) {
							typeMatches = false;
						}
					} else if (type === 'array') {
						if (false === Array.isArray(value)) typeMatches = false;
					} else if (type === 'number') {
						if (isNaN(value)) typeMatches = false;
					} else if (type !== typeof value) {
						typeMatches = false;
					}
				}
				if (!typeMatches) {
					this.setError(field, "" + field + " is expected " + type);
				}
				break;
			case 'minlength': // TODO #1: it should only applied to string/numeric classes.
				var minlength = this.rules[field][key];
				if (value.length < minlength) {
					this.setError(field, "" + field + " is should be at least " + minlength + " character long");
				}
				break;
			case 'maxlength': // TODO #1^
				var maxlength = this.rules[field][key];
				if (value.length > maxlength) {
					this.setError(field, "" + field + " is should be at most " + maxlength + " character long");
				}
				break;

			case 'minvalue': // TODO #2 it should only applied to numeric classes.
				var minvalue = this.rules[field][key];
				if (value < minvalue) {
					this.setError(field, "" + field + " should be more then " + minvalue);
				}
				break;
			case 'maxvalue': // TODO #2^
				var maxvalue = this.rules[field][key];
				if (value > maxvalue) {
					this.setError(field, "" + field + " should be less then " + maxvalue);
				}
				break;
			case 'equal':
				var other_value = obj[this.rules[field][key]];
				if (value != other_value) {
					this.setError(field, "" + field + " should be equal to " + other_value);
				}
				break;
			case 'not_equal':
				var other_value = obj[this.rules[field][key]];
				if (value == other_value) {
					this.setError(field, "" + field + " should not be equal to " + other_value);
				}
				break;
			case 'validator_fn':
				var fn = this.rules[field][key];
				var error = fn(value);
				if (error) this.setError(field, error);
				break;
			default:
				console.log('warning: ' + key + ' is not a valid key');
				break;
			}
		}
	}
	return this.isValid;
};

module.exports = Validator;