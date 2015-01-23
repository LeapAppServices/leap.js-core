define(['underscore', 'jquery'], function (_, $) {


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

        Explode: function (inputstring, separators, includeEmpties) {
            if (typeof inputstring != 'string') {
                throw Error('Utils.Explode: type must be string');
            }
            if (typeof separators == "undefined") {
                separators = " :;";
            }
            var fixedExplode = new Array(1);
            var currentElement = "";
            var count = 0;

            for (var x = 0; x < inputstring.length; x++) {
                var str = inputstring.charAt(x);
                if (separators.indexOf(str) != -1) {
                    if (((includeEmpties <= 0) || (includeEmpties == false)) && (currentElement == "")) {
                    } else {
                        fixedExplode[count] = currentElement;
                        count++;
                        currentElement = "";
                    }
                }
                else {
                    currentElement += str;
                }
            }

            if (( !(includeEmpties <= 0) && (includeEmpties != false)) || (currentElement != "")) {
                fixedExplode[count] = currentElement;
            }
            return fixedExplode;
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

        Transpose: function (data, key, limit) {
            var tmp = [];
            _.forEach(data, function (item, index) {
                if (typeof item[key] != 'undefined') {
                    tmp.push(item[key]);
                }
            });
            if (limit) {
                var sorted = _.sortBy(tmp, function (num) {
                    return num;
                });
                tmp = sorted.slice(0, limit);
            }
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
        }

    }
});