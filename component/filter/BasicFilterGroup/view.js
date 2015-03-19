define([
    'app',
    'U',
    'tpl!./template.html',
    './childView',
    'jquery',
    'marionette',
    'underscore',
    'i18n'
],function(AppCube,U,template,childView,$,Marionette,_){

    return Marionette.ItemView.extend({
        template:template,
        childViewContainer:'.condition-list',
        events:{
            "click .add-condition":"addItemHandler"
        },
        beforeShow:function(){
        },
        beforeHide:function(){
        },
        initFilter:function(){
            this.childView = this.options.childView||childView;
            this.children = [];
        },
        getChildView:function(){
            return this.childView;
        },
        getValue:function(){
            //todo return collection value
        },
        addItemHandler:function(){
            var item = this.addItem();
            item.init();
            if(item.beforeShow)item.beforeShow();
            item.render();
        },
        addItem:function(){
            var View = this.getChildView();
            var item = new View(this.options.childOptions);
            var node = document.createElement('div');
            item.setElement(node);
            this.$(this.childViewContainer).append(node);
            item.$el.addClass('fields');
            item._parent = this;
            this.children[item.cid]=item;
            return item;
        },
        removeItem:function(index){
            var item = this.children[index];
            if(item){
                if(item.beforeHide)item.beforeHide();
                item.destroy();
                delete this.children[index];
            }else{
                throw new Error("BasicFilterGroup: child("+index+") not exist");
            }
        },
        clearAllItem:function(){
            var self = this;
            _.forEach(_.keys(this.children),function(item){
                self.removeItem(item);
            });
        },
        updateItem:function(index,type,value){
            var item = this.children[index];
            if(item){
                item.renderComponent();
            }else{
                throw new Error("BasicFilterGroup: child("+index+") not exist");
            }
        },
        render:function(){
            Marionette.ItemView.prototype.render.call(this);
            this.$el.i18n();
            this.initFilter();
        }
    });
});
