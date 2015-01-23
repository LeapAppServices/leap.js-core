define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore'
],function(EditorCore,Dispatcher,$,_){
    function GeoPoint(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args,scope);
        _.extend(this,{
            init:function(){
                scope.input = $('<div class="editor-geopoint container-flex">' +
                    '<input type="text" class="latitude flex-1"> , ' +
                    '<input type="text" class="longitude flex-1"></div>')
                    .appendTo(args.container);
                scope.input.find('.latitude').focus().select();
            },
            loadValue:function(item){
                var value = item[args.column.field]||"";
                if(value){
                    scope.defaultValue = [value.latitude,value.longitude];
                    scope.input.find('.latitude').val(value.latitude);
                    scope.input.find('.longitude').val(value.longitude);
                }else{
                    scope.defaultValue = ["",""];
                }
            },
            validate:function(){
                var latitude = scope.input.find('.latitude').val();
                var longitude = scope.input.find('.longitude').val();
                if(isNaN(parseFloat(latitude))||isNaN(parseFloat(longitude))){
                    return {
                        valid: false,
                        msg: "Invalid Number error"
                    };
                }
                return {
                    valid: true,
                    msg: null
                };
            },
            getValue:function(){
                var latitude = scope.input.find('.latitude').val();
                var longitude = scope.input.find('.longitude').val();
                return JSON.stringify([latitude,longitude]);
            },
            setValue:function(value){
                scope.input.find('.latitude').val(value[0]);
                scope.input.find('.longitude').val(value[1]);
            },
            isValueChanged:function(){
                var latitude = scope.input.find('.latitude').val();
                latitude = latitude?parseFloat(latitude):"";
                var longitude = scope.input.find('.longitude').val();
                longitude = longitude?parseFloat(longitude):"";
                var o = scope.defaultValue;
                return !((o[0]===latitude)&&(o[1]===longitude));
            },
            serializeValue:function () {
                var latitude = scope.input.find('.latitude').val();
                var longitude = scope.input.find('.longitude').val();
                return [latitude,longitude];
            },
            applyValue:function(item, state){
                var row = args.grid.getActiveCell().row;
                var model = args.grid.getData()[row];
                var data = {};
                item[args.column.field] = {
                    __type:"GeoPoint",
                    latitude:parseFloat(state[0]),
                    longitude:parseFloat(state[1])
                };
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

    return GeoPoint;
});