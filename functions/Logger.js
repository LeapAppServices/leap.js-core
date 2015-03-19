define(
    [
        'language',
        'jquery',
        'pnotify'
    ],
    function (Language, $, PNotify) {

//        var defaults = {
//            "timeOut": "3000",
//            "extendedTimeOut": "1000",
//            "closeButton":  true,
//            "closeHtml":'<button><i class="fa fa-times-circle"></i></button>',
//            "positionClass":"toast-top-right"
//        };
        var Logger = {};

        Logger.info = function (message, options) {
            if(options&&options.doI18n==true){
                message = Language.i18n(message);
            }else{
                message = message || 'Info';
            }
            new PNotify({
                styling: "fontawesome",
                text: message,
                type: 'info',
                delay: 1000
            });
        };

        Logger.warning = function (message, options) {
            if(options&&options.doI18n==true){
                message = Language.i18n(message);
            }else{
                message = message || 'Warning';
            }
            new PNotify({
                styling: "fontawesome",
                text: message,
                type: 'warning',
                delay: 3000
            });
        };

        Logger.success = function (message, options) {
            if(options&&options.doI18n==true){
                message = Language.i18n(message);
            }else{
                message = message || 'Success';
            }
            new PNotify({
                styling: "fontawesome",
                text: message,
                type: 'success',
                delay: 1000
            });
        };

        Logger.error = function (e, options) {
            var message;
            if (e instanceof Error) {
                message = e.message;
            } else if (e.statusText || e.status) {
                if (e.responseText) {
                    try {
                        var json = JSON.parse(e.responseText);
                        message = Language.i18n('error.net.'+json.errorCode)||json.errorMessage;
                    } catch (error) {
                        message = e.status + ' ' + e.statusText
                    }
                } else {
                    if(e.status ==0 && e.statusText == 'timeout'){
                        message = Language.i18n('error.net.0');
                    }else{
                        message = e.status + ' ' + e.statusText
                    }
                }
            } else {
                if(options&&options.doI18n==true){
                    message = Language.i18n(e);
                }else{
                    message = e;
                }
            }
            new PNotify({
                styling: "fontawesome",
                text: message,
                type: 'error',
                delay: 3000
            });
        };
        return Logger;

    });