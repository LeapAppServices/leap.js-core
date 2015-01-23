define([
    'API',
    'Logger',
    'C',
    'core/functions/UI',
    'U',
    'underscore',
    'jquery'
],function(API,Logger,C,UI,U,_,$){
    var defaults = {
        method:'PUT',
        urlRoot:API.get('Files'),
        onProgress:function(percent){
            console.log(percent);
        },
        onSuccess:function(){
            console.log("success");
        },
        onComplete:function(xhr){
            console.log("complete");
        },
        onError:function(){
            console.log('error');
        },
        onAbort:function(){
            console.log('abort');
        }
    };
    var Uploader = function(options){
        var option = _.extend({},defaults,options);
        if(!option.urlRoot)throw new Error('Need URL to Upload');
        if(!option.$el)throw new Error('Need FileInputNode to Upload');
        this.options = option;
    };

    Uploader.prototype.uploadFile = function(){
        var options = this.options;
        var file = (options.$el.get(0).files)[0]||{type:""};
        if(options.checkImage&&!U.isImage(file)){
            Logger.error('illegal Image File');
            return false;
        }
        var xhr = new XMLHttpRequest();

        function uploadProgress(event){
            var percent = 0;
            if(event.lengthComputable) {
                percent = event.loaded/event.total;
                if(percent>=0.9)percent = 0.9;
                if(options.onProgress){
                    options.onProgress(percent);
                }
            }
        }
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.upload.addEventListener("load", options.onComplete, false);
        xhr.upload.addEventListener("error", options.onError, false);
        xhr.upload.addEventListener("abort", options.onAbort, false);

        xhr.onreadystatechange = function(v){
            if(xhr.readyState==4)
            {
                var res=xhr.response;
                if(xhr.status==200||xhr.status==201)
                {
                    options.onProgress(1);
                    options.onSuccess(res,xhr);
                }else{
                    options.onError(xhr);
                }
            }
        };

        var upload_url = options.url?options.url:options.urlRoot+'/'+encodeURIComponent(file.name);
        xhr.open(options.method,upload_url,true);
        //xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xhr.setRequestHeader('X-ZCloud-AppId', C.get('User.AppId'));
        xhr.setRequestHeader('X-ZCloud-Session-Token', C.get('User.SessionToken'));
        if(!options.key){
            xhr.send(file);
        }else{
            var data = new FormData();
            data.append(options.key,file);
            xhr.send(data);
        }

    };

    return Uploader;
});
