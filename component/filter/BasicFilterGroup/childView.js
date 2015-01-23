define(
    [
        'app',
        'underscore',
        'moment',
        'jquery',
        'marionette'
    ],
    function (AppCube,_,moment,$,Marionette) {
        return Marionette.ItemView.extend({
            events:{
                "click .fa-times-circle":"removeSelf",
                "click .dropdown-menu>li":"clickDropdown",
                "keyup input":"keyupInput",
                "blur .date-editor":"changeDate"
            },
            init:function(){
                if(this.options.childTemplate){
                    this.template = _.template(this.options.childTemplate);
                }else{
                    this.template = '';
                }
            },
            changeDate:function(e,value){
                var dtp = $(e.currentTarget).data('DateTimePicker');
                var date = dtp?dtp.date:null;
                var type = $(e.currentTarget).parents('.flex-1').attr('data-type')||'value';
                this._parent.updateItem(this.cid,type,{
                    __type:"Date",
                    iso: date.format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
                });
            },
            clickDropdown:function(e){
                var value = $(e.currentTarget).attr('data-value');
                var column_type = $(e.currentTarget).attr('data-type');
                var type = $(e.currentTarget).parents('.dropdown').attr('data-type');
                this._parent.updateItem(this.cid,type,value,column_type);
            },
            keyupInput:function(e){
                var value = $(e.currentTarget).val();
                var type = $(e.currentTarget).parents('.flex-1').attr('data-type')||'value';
                this._parent.updateItem(this.cid,type,value);
            },
            removeSelf:function(){
                this._parent.removeItem(this.cid);
            },
            //helper start
            generateList: function (array) {
                var list = '';
                _.forEach(array,function(e){
                    list+='<li data-name="'+ e.name+'" data-value="'+ e.value+'"><a href="javascript:void(0)">'+ e.name+'</a></li>';
                });
                return list? '<ul class="dropdown-menu">' +list+ '</ul>':list;
            },
            generateColumnList: function (array) {
                var list = '';
                _.forEach(array,function(e){
                    list+='<li data-name="'+ e.name+'" data-value="'+ e.name+'" data-type="'+ e.value+'"><a href="javascript:void(0)">'+ e.name+'</a></li>';
                });
                return list? '<ul class="dropdown-menu">' +list+ '</ul>':list;
            },
            generateValueEditor: function(){
                var op = this.data.op;
                if(!op){
                    return '';
                }else if(_.contains(['exists','not exists'],op)){
                    return '';
                }else if(_.contains(['before','after'],op)){
                    var date;
                    if(typeof this.data.value == "undefined"||!this.data.value){
                        date = ""
                    }else{
                        date = moment(this.data.value.iso).format("MM/DD/YY HH:mm:ss");
                    }
                    return '<input type="text" class="form-control date-editor value-editor" data-date-format="MM/DD/YY HH:mm:ss" value="'+date+'">';
                }else{
                    return '<input type="text" class="form-control value-editor" value="'+(this.data.value?this.data.value:'')+'">';
                }
            },
            isInColumnList:function(array,value,default_value){
                var find = _.find(array,function(item){return item.name==value});
                return find?find.name:default_value;
            },
            isInList:function(array,value,default_value){
                var find = _.find(array,function(item){return item.value==value});
                return find?find.name:default_value;
            },
            isExist:function(value,default_value){
                return value?value:default_value;
            },
            //helper end
            renderComponent:function(){
                this.$el.html(this.template(this));
            },
            render:function(data){
                this.data = data;
                this.renderComponent();
            }
        });
    });
