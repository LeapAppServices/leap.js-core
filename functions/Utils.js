define(['underscore', 'jquery','language','Logger'], function (_, $,language,Logger) {


    return {
        Clone: function (obj, preventName) {
            var self = this;
            if ((typeof obj) == 'object') {
                var res = (obj == null || !obj.sort) ? {} : [];
                for (var i in obj) {
                    if (i != preventName)
                        res[i] = self.Clone(obj[i], preventName);
                }
                return res;
            } else if ((typeof obj) == 'function') {
                return (new obj()).constructor;
            }
            return obj;
            /*
             return $.extend(true,{},obj);
             */
        },
        UC_First: function (str) {
            var tmp = str.toLowerCase();
            var result = tmp.replace(/\b\w+\b/g, function (word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            return result;
        },
        jumpTo: function (path) {
            window.location.href = path;
        },
        changeHash:function(options){
            if(options.hash){
                window.location.hash = options.hash;
            }
            if(options.reload){
                location.reload();
            }
        },
        secToHou:function(sec){
            var tmp = Math.floor(sec);
            var hour = Math.floor(tmp/3600);
            var minute = Math.floor((tmp-3600*hour)/60);
            var second = tmp-3600*hour-60*minute;
            return {
                hour:hour,minute:minute,second:second
            }
        },
        formatAxis: function (array) {
            var tmp = [];
            _.forEach(array, function (item) {
                if (/^(\d{4})(\d{2})(\d{2})(\d{2})?$/.test(item)) {
                    if (RegExp.$4) {
                        tmp.push(RegExp.$2 + '/' + RegExp.$3 + ' ' + RegExp.$4 + ':00');
                    } else {
                        tmp.push(RegExp.$2 + '/' + RegExp.$3);
                    }
                } else if (/^(\d{2})$/.test(item)) {
                    tmp.push(RegExp.$1 + ':' + '00');
                } else {
                    tmp.push(item);
                }
            });
            return tmp;
        },
        getLength:function(str){
            var realLength = 0;
            var len = str.length;
            var charCode = -1;
            for(var i = 0; i < len; i++){
                charCode = str.charCodeAt(i);
                if (charCode >= 0 && charCode <= 128) {
                    realLength += 1;
                }else{
                    realLength += 3;
                }
            }
            return realLength;
        },
        forceRender: function () {
            var el = document.body;
            el.style.cssText += ';-webkit-transform:rotateZ(0deg)';
            el.offsetHeight;
            el.style.cssText += ';-webkit-transform:none';
        },
        isImage:function(file){
            return file?/^image\//.test(file.type):false;
        },
        parseUrl:function(url){
            if(/^(http|https):\/\//.test(url)){
                return url;
            }else{
                return "http://"+url;
            }
        },
        strEllip: function(str,n)
        {
            var ilen = str.length;
            if(ilen*2 <= n) return str;
            n -= 3;
            var i = 0;
            while(i < ilen && n > 0)
            {
                if(escape(str.charAt(i)).length>4) n--;
                n--;
                i++;
            }
            if( n > 0) return str;
            return str.substring(0,i)+"...";
        },
        ParseError: function(resp, prefix, type, handlers, options) {
            var self = this;
            if (!resp || !type || !prefix) {
               return Logger.error(language.i18n('error'));
            }
            try {
                var reason = (resp.responseText.charAt(0)!='{')?resp:JSON.parse(resp.responseText);
                if (reason && (reason.errorCode||reason.status)) {
                    reason.errorCode = reason.errorCode?reason.errorCode:reason.status;
                    var key = prefix + '.' + type + '.' + reason.errorCode;
                    var failkey = prefix + '.error';

                    if(resp.status!= 400){
                        reason.errorMessage = 'Sever Error  ' + reason.errorCode;
                    }
                    if(typeof handlers == 'function'){
                        handlers(resp,options);
                    }
                    else if(handlers && reason.errorCode in handlers){
                        handlers[reason.errorCode](resp,options);
                    }
                    else if(handlers && handlers['default']){
                        handlers['default'](resp,options);
                    }
                    else if (language.i18n(key)) {
                        Logger.error(language.i18n(key));
                    }else if(reason.errorMessage) {
                        Logger.error(reason.errorMessage);
                    }else {
                        Logger.error(language.i18n(failkey));
                    }
                } else {
                    Logger.error(text);
                }
            } catch (e) {
                Logger.error(language.i18n('error'));
            }
        },
        goTo:function(action,state,id){
            window.location.hash = action + (state?'/'+state:'') + (id?'/'+id:'');
        },
        normalize:function(key){
            var map = {
                "ios":"iOS",
                "android":"Android",
                "app store":"App Store",
                "google play":"Google Play"
            };
            return map[key.toLowerCase()] || key;
        },
        parseCurrentUrl:function(){
            var urlObj = {
               origin:window.location.origin,
               pathname:window.location.pathname,
               module:"dashboard",
               appId:"",
               hash:window.location.hash,
               url:window.location.href
            };
            var moduleArr = urlObj.pathname.match(/^(.*?)\/(\w+)\/?/);
            if(moduleArr && moduleArr.length>2){
               urlObj.module = moduleArr[2];
            }
            var appIdArr = urlObj.pathname.match(/\/apps\/(\w+)/);
            if(appIdArr && appIdArr.length>1){
               urlObj.appId = appIdArr[1];
            }
            if(
               (urlObj.appId != "") 
               && 
               (!/\/apps\/(\w+)/.test(window.location.href))
               ){
               //补充 appId
               urlObj.url =  urlObj.url.replace(urlObj.module,urlObj.module+"/apps/"+urlObj.appId);
            }

            return urlObj;
        }
    }
});