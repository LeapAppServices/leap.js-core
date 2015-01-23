define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore'
],function(EditorCore,Dispatcher,$,_){
    function Array_(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args,scope);
        _.extend(this,{
            init:function(){
                scope.input = $("<input type=text class='editor-text' placeholder='[\"var\",\"foo\",0...]'/>")
                    .appendTo(args.container)
                    .bind("keydown.nav", function (e) {
                        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    })
                    .focus()
                    .select();
                if(scope.afterInit)scope.afterInit();
            },
            loadValue:function(item){
                var value = JSON.stringify(item[args.column.field]);
                scope.defaultValue = value;
                scope.input.val(value);
            },
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
                try{
                    JSON.parse(scope.input.val());
                }
                catch(e){
                    return {
                        valid: false,
                        msg: "JSON parse error"
                    };
                }
                if(!/^\[.*\]$/.test(scope.input.val())){
                    return {
                        valid: false,
                        msg: "Data type must be Array"
                    };
                }
                return {
                    valid: true,
                    msg: null
                };
            },
            applyValue:function(item, state){
                var row = args.grid.getActiveCell().row;
                var model = args.grid.getData()[row];
                var data = {};
                item[args.column.field] = JSON.parse(state);
                if(item.objectId != "" && item.objectId){
                    data[args.column.field] = item[args.column.field];
                    Dispatcher.trigger('update:Class',{model:model,data:data},'Component');
                }else{
                    _.forEach(item,function(value,index){
                        if(index!='objectId'&&index!='createdAt'&&index!='updatedAt'){
                            data[index]=value;
                        }
                    });
                    Dispatcher.trigger('create:Class',{model:model,data:data},'Component');
                }
            }
        });
        this.init();
    }

    return Array_;
});