define([
        'basic/Object',
        'Logger',
        'C',
        'Q',
        'jquery',
        'underscore',
        'pace'
    ],
    function(CObject,Logger,C,Q,$,_,pace){
        var defaults = ['params','method','header','url','timeout','formatter','buffer','next'];
        var INIT = 0,PENDING = 1,SUCCESS = 2,ERROR = 3;

        var Task = CObject.extend({
            initialize:function(options){
                this._configure(options);
                this.result = {};
                this.state = INIT;
                this.defer = Q.defer();
                return true;
            },
            _configure:function(options){
                if (this.options) options = _.extend({}, _.result(this, 'options'), options);
                this.options = _.pick(options, defaults);
            },
            start:function(){
                var data;
                var self = this;
                if(this.state == PENDING){
                    return this.defer.promise;
                }else if(this.state == SUCCESS||this.state == ERROR){
                    this.defer = Q.defer();//Update defer
                }

                var method = this.options.method||'GET';
                var params = this.options.params;
                var url = this.options.url||'';
                var timeout = this.options.timeout||C.get('Ajax.TIMEOUT');
                var header = _.extend({},C.get('Ajax.HTTPHEADER'),this.options.header);
                try{
                    data = (method.toUpperCase() == 'GET')?params:JSON.stringify(params);
                }
                catch(e){
                    console.log('Task: params format error');
                }

                this.state = PENDING;
                pace.restart();

                Q($.ajax({
                    url:url,
                    type:method,
                    dataType:'json',
                    contentType:'application/json',
                    data:data,
                    timeout:timeout,
                    headers:header
                })).then(function(response){
                    self.state = SUCCESS;
                    return response;
                },function(e){
                    Logger.error(e);
                    self.state = ERROR;
                    if(self.options.buffer){
                        return self.options.buffer;
                    }else{
                        //todo return xhr
                        return e.responseText;
                    }
                }).done(function(data){
                    if(self.options.formatter&&typeof self.options.formatter == 'function'){
                        var tmp_result = self.options.formatter(data,self.options);
                        if(typeof tmp_result.done == 'function'){
                            tmp_result.done(function(res){
                                self.result = res;
                                self.defer.resolve(self.result);
                            });
                            return;
                        }else{
                            self.result = tmp_result;
                        }
                    }else{
                        self.result = data;
                    }
                    self.defer.resolve(self.result);
                });
                return self.defer.promise;
            }
        });

        Task.create = function(options){
            var ret = new Task();
            if(ret.initialize(options)==false){
                return false;
            }
            return ret;
        };

        return Task;
    });