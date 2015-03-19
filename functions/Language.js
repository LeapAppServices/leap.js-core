define([
    "jquery",
    "i18n",
    'Storage'
], function($,i18n,Storage){
    var language = {
        langCodes: {
            "en": "en",
            "en_US": "en",
            "zh": "zh",
            "zh_CN": "zh",
            "zh_SG": "zh",
            "zh_TW": "zh_TW",
            "zh_HK": "zh_TW",
            "ja": "ja",
            "de": "de",
            "ru": "ru",
            "pt": "pt_PT",
            "pt_PT": "pt_PT",
            "pt_BR": "pt_BR",
            "es": "es",
            "es_ES": "es",
            "es_AR": "es_419",
            "es_BO": "es_419",
            "es_CO": "es_419",
            "es_CL": "es_419",
            "es_CR": "es_419",
            "es_DO": "es_419",
            "es_EC": "es_419",
            "es_GT": "es_419",
            "es_HN": "es_419",
            "es_MX": "es_419",
            "es_NI": "es_419",
            "es_PY": "es_419",
            "es_PA": "es_419",
            "es_PE": "es_419",
            "es_PR": "es_419",
            "es_SV": "es_419",
            "es_UY": "es_419",
            "es_VE": "es_419"
        },
        langNames: {
            "en": "English",
            "zh": "中文",
            "zh_CN": "中文简体",
            "zh_TW": "中文繁体",
            "ja": "日本語",
            "de": "Deutsch",
            "ru": "Русский язык",
            "pt": "Português",
            "nl": "Nederlands",
            "it": "Italiano",
            "fr": "Français",
            "es": "Español"
        },
        init:function(callback){
            this.setDefaultLanguage("component",callback);
        },
        i18n:function(key){
            return i18n.t(key) || i18n.t(key+".default")||"";
        },
        _getCurLangCode: function() {
            return (typeof window.navigator.language != "undefined" ? window.navigator.language : window.navigator.browserLanguage);
        },
        getCurLangCode: function() {
            var self = this;
            var storeLang = Storage.get("language");
            if (storeLang) {
                    return storeLang;
                }
            var _langCodes = self.langCodes;
            var _curLangCode = "en_US";
            var _langCode = self._getCurLangCode().replace('-','_');
            if (typeof _langCodes[_langCode] != "undefined") {
                _curLangCode = _langCodes[_langCode]
            } else {
                if (_langCode.indexOf("_") > -1) {
                    _langCode = _langCode.split("_")[0];
                    if (typeof _langCodes[_langCode] != "undefined") {
                        _curLangCode = _langCodes[_langCode]
                    }
                }
            }
            return _curLangCode
        },
        getLangName: function(langCode) {
            return this.langNames[langCode];
        },
//        localize:function () {
//
//            var helpers = {
//                onlyFirstUpper:function (str) {
//                    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
//                },
//                upper:function (str) {
//                    return str.toUpperCase();
//                }
//            };
//
//            // translate dashboard
//            $("[data-localize]").each(function () {
//                var elem = $(this),
//                    toLocal = elem.data("localize").split("!"),
//                    localizedValue = "";
//
//                if (toLocal.length == 2) {
//                    if (helpers[toLocal[0]]) {
//                        localizedValue = helpers[toLocal[0]](jQuery.i18n.map[toLocal[1]]);
//                    } else {
//                        localizedValue = jQuery.i18n.prop(toLocal[0], jQuery.i18n.map[toLocal[1]]);
//                    }
//                } else {
//                    localizedValue = jQuery.i18n.map[elem.data("localize")];
//                }
//
//                if (elem.is("input[type=text]") || elem.is("input[type=password]")) {
//                    elem.attr("placeholder", localizedValue);
//                } else if (elem.is("input[type=button]") || elem.is("input[type=submit]")) {
//                    elem.attr("value", localizedValue);
//                } else {
//                    elem.text(localizedValue);
//                }
//            });
//        },
        setLanguage: function(langCode, name, callback) {
            langCode = langCode || this.getCurLangCode();
            Storage.set("language",langCode);
            $.i18n.init({
                lng:langCode,
                resGetPath: '/front/locales/__lng__/__ns__.json?t='+(new Date().getTime()),
                parseMissingKey:function(str,obj){
                    return ""
                },
                objectTreeKeyHandler:function(){
                    return ""
                },
                ns:name||'component'
            },function(){
                $('body').i18n();
                if(callback && (typeof(callback)== 'function') ){
                    callback();
                }
            });
        },
        setDefaultLanguage: function(name,callback) {
            var curLangCode = this.getCurLangCode() || "en";
            this.setLanguage(curLangCode,name,callback);
        }
    };
    return language;
});