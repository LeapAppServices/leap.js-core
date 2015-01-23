define(
    [
        'jquery',
        'pnotify'
    ],
    function ($, PNotify) {

//        var defaults = {
//            "timeOut": "3000",
//            "extendedTimeOut": "1000",
//            "closeButton":  true,
//            "closeHtml":'<button><i class="fa fa-times-circle"></i></button>',
//            "positionClass":"toast-top-right"
//        };
        var Logger = {};

        Logger.info = function (message, title, options) {
            message = message || 'Info';
            new PNotify({
                title: title,
                styling: "fontawesome",
                text: message,
                type: 'info',
                delay: 1000
            });
        };

        Logger.warning = function (message, title, options) {
            message = message || 'Warning';
            new PNotify({
                title: title,
                styling: "fontawesome",
                text: message,
                type: 'warning',
                delay: 3000
            });
        };

        Logger.success = function (message, title, options) {
            message = message || 'Success';
            new PNotify({
                title: title,
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
                        message = json.errorMessage;
                    } catch (error) {
                        message = e.status + ' ' + e.statusText
                    }
                } else {
                    message = e.status + ' ' + e.statusText
                }
            } else {
                message = e;
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