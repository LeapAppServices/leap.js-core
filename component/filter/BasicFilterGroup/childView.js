define(
    [
        'app',
        'underscore',
        'moment',
        'jquery',
        'marionette',
        'i18n',
        'semanticui_dropdown'
    ],
    function (AppCube,_,moment,$,Marionette,i18n) {
        return Marionette.ItemView.extend({
            events:{
                "click .icon.remove":"removeSelf",
                "click .field .menu>.item":"clickDropdown",
                "keyup .field>input":"keyupInput",
                "blur .date-editor":"changeDate"
            },
            init:function(){
                if(this.options.childTemplate){
                    this.template = _.template(this.options.childTemplate);
                }else{
                    this.template = '';
                }
            },
            beforeHide:function(){
                this.$('.ui.dropdown').each(function(index,e){
                    if($(e).data('moduleDropdown'))$(e).dropdown('destroy');
                });
                this.$('.date-editor').each(function(){
                    var dtp = $(this).data('DateTimePicker');
                    if(dtp) dtp.destroy()
                });
            },
            removeSelf:function(){
                this._parent.removeItem(this.cid);
            },
            renderComponent:function(){
                this.beforeHide();

                this.$el.html(this.template(this));

                this.$('.ui.dropdown').dropdown({
                    action:'hide'
                });
            },
            render:function(data){
                this.data = data;
                this.renderComponent();
                this.$el.i18n();
            },
            clickDropdown:function(e){
                var value = $(e.currentTarget).attr('data-value');
                var column_type = $(e.currentTarget).attr('data-type');
                var type = $(e.currentTarget).closest('.field').attr('data-type');
                this._parent.updateItem(this.cid,type,value,column_type);
            },
            keyupInput:function(e){
                var value = $(e.currentTarget).val();
                var type = $(e.currentTarget).closest('.field').attr('data-type')||'value';
                this._parent.updateItem(this.cid,type,value);
            },
            changeDate:function(e,value){
                var dtp = $(e.currentTarget).data('DateTimePicker');
                var date = dtp?dtp.date:null;
                var type = $(e.currentTarget).parents('.field').attr('data-type')||'value';
                this._parent.updateItem(this.cid,type,{
                    __type:"Date",
                    iso: date.format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
                });
            },
            //helper start
            generateList: function (array) {
                var list = '';
                _.forEach(array,function(e){
                    list+='<div class="item" data-name="'+ e.name+'" data-value="'+ e.value+'">'+ e.name+'</div>';
                });
                return list;
            },
            generateColumnList: function (array) {
                var list = '';
                _.forEach(array,function(e){
                    list+='<div class="item" data-name="'+ e.name+'" data-value="'+ e.name+'" data-type="'+ e.value+'">'+ e.name+'</div>';
                });
                return list;
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
                    return '<input type="text" class="date-editor value-editor" data-date-format="MM/DD/YY HH:mm:ss" value="'+date+'">';
                }else{
                    return '<input type="text" class="value-editor" value="'+(this.data.value?this.data.value:'')+'">';
                }
            },
            isInColumnList:function(array,value,default_value){
                var find = _.find(array,function(item){return item.name==value});
                return find?find.name:i18n.t(default_value);
            },
            isInList:function(array,value,default_value){
                var find = _.find(array,function(item){return item.value==value});
                return find?find.name:i18n.t(default_value);
            },
            isExist:function(value,default_value){
                return value?value:default_value;
            }
            //helper end
        });
    });
