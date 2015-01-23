define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore'
],function(EditorCore,Dispatcher,$,_){
    function Integer(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args,scope);
        _.extend(this,{
            afterInit:function(){
                scope.input.bind('keyup.slick',function(){
                    if(scope.validate().valid==true){
                        scope.input.parent('.slick-cell').removeClass('error');
                    }else{
                        scope.input.parent('.slick-cell').addClass('error');
                    }
                });
            },
            validate:function(){
                if (isNaN(scope.input.val())) {
                    return {
                        valid: false,
                        msg: "error.integer"
                    };
                }
                return {
                    valid: true,
                    msg: null
                };
            },
            serializeValue:function () {
                return parseFloat(scope.input.val()) || 0;
            }
        });
        this.init();
    }

    return Integer;
});