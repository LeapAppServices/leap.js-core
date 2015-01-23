define([
    'app',
    'dispatcher',
    'tpl!./template.html',
    'tpl!./childTemplate.html',
    'marionette',
    'jquery',
    'underscore',
    'easing'
], function (AppCube,Dispatcher,template,childTemplate,Marionette, $, _) {
    return Marionette.ItemView.extend({
        template: template,
        childTemplate:childTemplate,
        events: {
            "click .btn-notification":"toggleDisplay",
            "click .notification-body>li":"toggleClose",
            "click .btn-group-notification>label":"toggleType",
            "click":"cancelClick",
            "click .btn-refresh":"refresh"
        },
        init: function(){
            var storeName = this.options.storeName;
            Dispatcher.on('refresh:' + storeName, this.renderComponent, this, 'Component');
        },
        beforeShow: function() {
//            var self = this;
//            $(document).unbind('click.notification').bind('click.notification',function(e){
//                if(e.currentTarget!=self.$el.get(0)){
//                    self.toggleClose();
//                }
//            });
        },
        cancelClick:function(e){
            e.stopPropagation();
        },
        toggleClose:function(e){
            var self = this;
            this.$('.notification-dropdown').removeClass('open');
            this.$('.notification-dropdown').stop(true,true).animate(
                {'opacity':0},200,'linear',
                function(){
                    self.$('.notification-dropdown').css('transform','rotateY(180deg)').hide();
                }
            );
            $('body').unbind('click.notification');
            if(e)e.stopPropagation();
        },
        toggleShow: function(e) {
            $('.dropdown').removeClass('open');
            this.$('.notification-dropdown').addClass('open');
            this.$('.notification-dropdown').show();
            this.$('.notification-dropdown').stop(true,true).animate(
                {'opacity':1},{
                    duration:1400,
                    easing:'easeOutElastic',
                    step:function(now,fx){
                        $(this).css({
                            'transform':'rotateY('+180*(1-now)+'deg)',
                            'opacity':now
                        });
                    }
                }
            );
            //bindClose
            var self = this;
            $('body').unbind('click.notification').bind('click.notification',function(e){
                self.toggleClose();
            });
            if(e)e.stopPropagation();
        },
        toggleType:function(e){
            var type = $(e.currentTarget).attr('data-value');
            this.type = type;
            this.$('.btn-group-notification>label').removeClass('active');
            $(e.currentTarget).addClass('active');
            if(type!='msgs'){
                this.$('.notification-body').hide();
            }else{
                this.$('.notification-body').show();
            }
            e.stopPropagation();
        },
        toggleDisplay:function(e){
            if(!this.$('.notification-dropdown').hasClass('open')){
                this.toggleShow();
            }else{
                this.toggleClose();
            }
            e.stopPropagation();
        },
        render: function() {
            this.type = 'msgs';
            Marionette.ItemView.prototype.render.call(this);
            this.refresh();
        },
        renderComponent:function(res){
            var storeName = this.options.storeName;
            var self = this;
            AppCube.DataRepository.fetch(storeName,this.type).done(function(res){
                self.renderNotificationMsg(res);
            });
        },
        renderNotificationMsg:function(res){
            var list = [];
            _.forEach(res,function(item){
                list.push($(childTemplate(item)));
            });
            this.$('.notification-body').html(list);
            var count = res.length;
            if(count){
                this.$('.btn-notification>.badge').text(count);
                this.$('.btn-group-notification>label:eq(0)').html('' +
                    '<input type="radio" name="activity">Msgs ('+count+')');
            }else{
                this.$('.btn-notification>.badge').hide();
            }
            var self = this;
            if(this.refreshTask)clearTimeout(this.refreshTask);
            setTimeout(function(){
                self.refresh();
            },this.options.refreshInterval||180*1000);
        },
        refresh:function(){
            var storeName = this.options.storeName;
            AppCube.DataRepository.refresh(storeName);
        },
        beforeHide: function() {

        }
    });
});