define([
        'basic/Object',
        'Storage',
        'C',
        'U',
        'jquery',
        'underscore',
        'i18n',
        'semanticui_dropdown'
    ],
    function (CObject, Storage, C, U, $, _, i18n) {

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
                var sessionToken = Storage.get('sessionToken');
                var orgId = Storage.get('orgId');
                if (!sessionToken) {
                    this.logout();
                } else {
                    C.set('User.SessionToken', sessionToken);
                    C.set('User.OrgId', orgId);
                }
            },
            syncAccountInfo: function () {
                //todo create Task
                this.set('username', Storage.get('username'));
                this.set('email', Storage.get('email'));
                this.set('userType', Storage.get('userType'));
            },
            clearUserData:function() {
                var lastUrl = Storage.get('lastUrl');
                var vistedIntrosSelector = Storage.get('vistedIntrosSelector');
                Storage.clear();
                if(lastUrl){
                    Storage.set('lastUrl',lastUrl);
                }
                if(vistedIntrosSelector){
                    Storage.set('vistedIntrosSelector',vistedIntrosSelector);
                }
            },
            logout: function () {
                this.clearUserData();
                U.jumpTo('/login');
            },
            renderUserInfo: function () {
                var user = this.email || this.username || '';
                $('#info-username>.text>.username').text(user);
                $('#info-username').i18n();
                $('#info-username').dropdown({
                    duration:100,
                    action:'nothing'
                });
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