define(
    [
        'app',
        'core/functions/UI',
        'config/validate',
        'jquery',
        'underscore'
    ],
    function (AppCube, UI, validateConfig,$, _) {
        function Rules(configs) {
            this.__config = configs;
            this.execute = function (value) {
                var SUCCESS = {result: true, msg: 'success'};
                var ERROR = {result: false, msg: this.__config.msg};

                var rules = this.__config.rules;

                for (var i in rules) {
                    var r = rules[i].execute(value);
                    if (!r.result) {
                        return r;
                    }
                }

                var regex = this.__config.regex;
                if (regex) {
                    if (!regex.test(value))return ERROR;
                }

                var validator = this.__config.validator;
                if (validator && typeof validator == 'function') {
                    if (!validator(value)) {
                        return ERROR;
                    }
                }

                return SUCCESS;
            }
        }

        function Validator() {
            this.__rules = {};
            this.init();
        }

        Validator.prototype.addRules = function (name, options) {
            var self = this;
            var rules = this.__rules;
            var configs = _.extend({}, _.pick(options, 'regex', 'msg', 'validator'));
            if (options.rules) {
                configs.rules = [];
                try {
                    _.forEach(options.rules, function (value) {
                        if (typeof value == 'string' && rules[value]) {
                            configs.rules.push(rules[value]);
                        }
                        else if (typeof value == 'object') {
                            var r = self.addRules('', options);
                            configs.rules.push(r);
                        } else {
                            throw new Error('Error:rule format error');
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
            }
            var tmp = new Rules(configs);
            if (name) {
                rules[name] = tmp;
            }
            return tmp;
        };

        Validator.prototype.removeRules = function (name) {
            rules[name] = "";
            delete rules[name];
        };

        Validator.prototype.init = function () {
            var self = this;
            _.forEach(validateConfig, function (configs, index) {
                self.addRules(index, configs);
            });
        };

        Validator.prototype.validate = function ($el) {
            if (!_.isArray($el)) {
                /\s?validate-(\w+)\s?/.test($el.attr('class'));
                var reg1 = RegExp.$1;
                var tmp = {};
                if (reg1 && this.__rules[reg1]) {
                    tmp = this.__rules[reg1].execute($el.val());
                } else {
                    var validator = $el.attr('data-validator');
                    if (validator) {
                        console.log(typeof validator);
                    } else {
                        throw new Error('No validator matched!!!');
                    }
                }

                if (tmp.result == true) {
                    UI.toggleSuccess($el);
                    return true;
                } else {
                    $el.unbind('.validate');
                    UI.toggleError($el, tmp.msg);
                    return false;
                }
            } else {
                var self = this;
                for (var i in $el) {
                    if (self.validate($el[i]) == false) {
                        return false;
                    }
                }
                return true;
            }
        };

        Validator.prototype.check = function (parent) {
            var result = true;
            var self = this;
            $(parent).find('.validate').each(function (index, e) {
                if (self.validate($(e)) == false) {
                    result = false;
                }
            });
            return result;
        };

        var validator = new Validator();

        return validator;
    });
