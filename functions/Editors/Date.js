define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore',
    'moment',
    'datetimepicker'
],function(EditorCore,Dispatcher,$,_,moment){
    function Date(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args, scope);
        _.extend(this, {
            init: function () {
                scope.input = $("<input type='text' class='app-calendar' data-date-format='MM/DD/YY HH:mm:ss'>");
                scope.input.appendTo(args.container);
                scope.input.datetimepicker({
                    useCurrent: true,
                    icons:{
                        time: 'fa fa-lg fa-clock-o',
                        date: 'fa fa-lg fa-calendar',
                        up:   'fa fa-chevron-up',
                        down: 'fa fa-chevron-down'
                    }
                });
                scope.input.focus().select();
            },
            loadValue:function(item){
                var value = item[args.column.field]||{};
                var iso = value.iso||"";
                scope.defaultValue = moment(iso.substring(0,iso.length-5)).format("MM/DD/YY HH:mm:ss")||"";
                scope.input.val(scope.defaultValue);
                if(scope.defaultValue){
                    scope.input.data('DateTimePicker').setDate(scope.defaultValue);
                }
            },
            destroy:function(){
                scope.input.data('DateTimePicker').destroy();
                scope.input.remove();
            },
            applyValue: function (item, state) {
                var row = args.grid.getActiveCell().row;
                var model = args.grid.getData()[row];
                var data = {};
                var date = moment(state, "MM/DD/YY HH:mm:ss").format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
                item[args.column.field] = {
                    __type: "Date",
                    iso: date
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

    return Date;
});