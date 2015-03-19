define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore'
],function(EditorCore,Dispatcher,$,_){
    function Fixed(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args, scope);
        _.extend(this, {
            init:function(){
                scope.input = $("<INPUT type=text class='editor-text' readonly />")
                    .appendTo(args.container)
                    .bind("keydown.nav", function (e) {
                        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    });
                setTimeout(function(){
                    scope.input.focus().select();
                },0);
            },
            isValueChanged:function(){
                return (!(scope.input.val() == "" && scope.defaultValue == null)) && (scope.input.val() != scope.defaultValue);
            },
            loadValue:function(item){
                if(args.column.type=="Date"){
                    var value = item[args.column.field];
                    var iso = value;
                    scope.defaultValue = moment(iso.substring(0,iso.length-5)).format("YYYY-MM-DD hh:mm:ss")||"";
                    scope.input.val(scope.defaultValue);
                }else{
                    scope.defaultValue = item[args.column.field]||"";
                    scope.input.val(scope.defaultValue);

                }
            }
        });
        this.init();
    }

    return Fixed;
});