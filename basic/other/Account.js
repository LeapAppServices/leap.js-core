define([
        'basic/Object',
        'Cookie',
        'C',
        'U',
        'jquery',
        'underscore'
    ],
    function (CObject, Cookie, C, U, $, _) {

        var defaults = [];

        var Account = CObject.extend({
            initialize: function (options) {
                this._configure(options);
                this.checkPassport();
                this.syncAccountInfo();
                return true;
            },
            _configure: function (options) {
                if (this.options) options = _.extend({}, _.result(this, 'options'), options);
                this.options = _.pick(options, defaults);
            },
            checkPassport: function () {
                var sessionToken = Cookie.get('sessionToken');
                var orgId = Cookie.get('orgId');
                if (!sessionToken) {
                    this.logout();
                } else {
                    C.set('User.SessionToken', sessionToken);
                    C.set('User.OrgId', orgId);
                }
            },
            syncAccountInfo: function () {
                //todo create Task
                this.set('username', Cookie.get('username'));
                this.set('email', Cookie.get('email'));
                this.set('userType', Cookie.get('userType'));
            },
            logout: function () {
                Cookie.clear();
                U.jumpTo('/login');
            },
            renderUserInfo: function () {
                var user = this.email || this.username || '';
                $('#info-username').html('<span class="app-icon app-icon-head"></span>' + user + '&nbsp;<i class="fa fa-angle-down"></i>');

            },
            destroy: function () {
            }
        });

        Account.create = function (options) {
            var ret = new Account();
            if (ret.initialize(options) == false) {
                return false;
            }
            return ret;
        };

        return Account;
    });