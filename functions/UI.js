define([
    'app',
    'U',
    'i18n',
    'Logger',
    'jquery',
    'underscore',
    'bootstrap',
    'visualcaptcha.jquery',
    'introJs',
    'Storage',
    'semanticui_modal',
    'semanticui_checkbox'
], function (AppCube,U,i18n,Logger,$,_,bootstrap,visualcaptcha,introJs,Storage,semanticui_modal) {
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.oRequestAnimationFrame
            || window.msRequestAnimationFrame || function() {
            //return setTimeout(arguments[0], 1000 / 60);
            return -1;
        }
    })();

    window.cancelRequestAnimFrame = (function() {
        return window.cancelAnimationFrame
            || window.webkitCancelRequestAnimationFrame
            || window.mozCancelRequestAnimationFrame
            || window.oCancelRequestAnimationFrame
            || window.msCancelRequestAnimationFrame || function() {
            return -1;
        }
    })();

    var animation = null;
    return {
        initPortlet:function(){
            $(document).on('click','.portlet .caption>.app-icon',function(e){
                var icon = $(e.currentTarget);
                var body = icon.parents('.portlet').children('.portlet-body');
                var group = icon.parents('.portlet').children('.btn,.btn-group,.pageination');
                if(icon.hasClass('app-icon-close')){
                    icon.removeClass('app-icon-close');
                    icon.addClass('app-icon-open');
                    //body.slideUp('fast');
                    body.hide();
                    group.hide();
                }else{
                    icon.removeClass('app-icon-open');
                    icon.addClass('app-icon-close');
                    //body.slideDown('fast');
                    body.show();
                    group.show();
                }
            });
        },
        showDialog: function (title, message, options) {
            options = options || {};
            options = $.extend({
                specialDialogUI: '',
                btns:{
                    negative:'common.form.cancel',
                    positive:'common.form.apply',
                    others:[]
                }
            }, options);

            var appDialog = options.el || $('#app-dialog');
            appDialog.attr('special-dialog-ui', options.specialDialogUI);
            appDialog.parent().removeClass('hidden');
            appDialog.removeClass('hidden');
            //css size
            var sizes = ["small","medium","large","x-large"]
            _.each(sizes,function(size){
              appDialog.removeClass(size);
            });
            if(options.size){
                appDialog.addClass(options.size);
            }

            //header
            var dialogHeader = appDialog.find('.header');
            dialogHeader.html(title);

            //actions
            var dialogActions = appDialog.find('.actions');
            dialogActions.html('');

            if (options.footer != false) {
                if (options.btns.negative && options.btns.negative !="") {
                    dialogActions.append('<div class="ui button negative">'+i18n.t(options.btns.negative)+'</div>');
                }
                if (options.btns.positive && options.btns.positive !="") {
                    dialogActions.append('<div class="ui button positive">'+i18n.t(options.btns.positive)+'</div>');
                }
                _.each(options.btns.others,function(key){
                    dialogActions.append('<div class="ui primary button">'+i18n.t(key)+'</div>');
                });
            }

            var dialogContent = appDialog.find('.content');
            if (dialogContent.length == 0) {
                dialogHeader.after('<div class="content"></div>');
                dialogContent = appDialog.find('.content');
            }
            if (typeof message == 'string') {
                dialogContent.html(message);
            } else {
                var view = new message({
                    el: appDialog.find(".content")
                });
                appDialog.data('dialog-view', view);
                if(view.init){
                    view.init();
                }
                if(view.beforeShow){
                    view.beforeShow();
                }
                view.render(options);
                if(view.$('.ui.checkbox').length>0){
                    view.$('.ui.checkbox').checkbox();
                }
            }

            var modalOption = _.pick(options,['closable','useCss','transition','duration','easing','allowMultiple']);

            modalOption.transition = modalOption.transition|| 'scale';

            if(options.closable == false){
                modalOption.closable = false;
                appDialog.children('.icon.close').hide();
            }else{
                appDialog.children('.icon.close').show();
            }

            modalOption.onApprove = function(){
                if (options && options.success) {
                    options.success(appDialog.data('dialog-view'));
                }
                return false;
            };

            modalOption.onDeny = function(){
                if (options && options.error) {
                    options.error(appDialog.data('dialog-view'));
                }
            };

            modalOption.onHidden = function(){
                appDialog.removeAttr('special-dialog-ui');
                var view = appDialog.data('dialog-view');
                if(view){
                    if(view.$('.ui.checkbox').length>0){
                        view.$('.ui.checkbox').checkbox('destroy');
                    }
                    if(view.beforeHide)view.beforeHide();
                    view.destroy();
                    appDialog.data('dialog-view',null);
                }
                appDialog.removeClass('hidden');
                appDialog.unbind("keypress.key13");
            };

            modalOption.onVisible =function(){
                //allowMultiple
                if(options.allowMultiple && options.nextModalSelector){
                    $(options.nextModalSelector)
                      .modal({
                        closable:false,
                        allowMultiple: true
                    });
                }else{
                    //回车键

                    appDialog.bind("keypress.key13", function(e) {
                        if((e.keyCode || e.which) == 13){
                            console.log("keypress.key13");
                            modalOption.onApprove();
                        }
                    });
                }
            }

            if(!options.autofocus){
                modalOption.autofocus = false;
            }
            appDialog
            // .modal('destroy')
            .modal(modalOption)
            .modal('show');

            

        },
        hideDialog: function (options) {
            options = options || {};
            if(options.el){
                options.el.modal('hide').removeClass('hidden');
            }else{
                $('#app-dialog').modal('hide').removeClass('hidden');
            }
        },
        bindUploader:function(elems,preview,callback){
            elems.each(function(index,button){
                var uploader = $('<input type="file" style="display:none" />').insertAfter($(button));
                $(button).on('click',function(){
                    uploader.trigger('click');
                });
                if(preview){
                    uploader.change(function(event){
                        var reader = new FileReader();
                        var file = ($(this).get(0).files)[0]||{type:""};
                        if(U.isImage(file)){
                            reader.readAsDataURL(file);
                            reader.onloadend = function(e) {
                                $(preview).css('opacity',1);
                                $(preview).css('background-repeat','no-repeat');
                                $(preview).css("background-image", "url("+e.target.result+")");
                            }
                        }
                        if(callback)callback(event);
                    });
                }else{
                    uploader.change(function(event){
                        if(callback)callback(event);
                    });
                }
            });
        },
        removeStatus: function ($el) {
            $($el).closest('.field').removeClass('success error');
            $($el).closest('.field').children('.error-msg').remove();
        },
        toggleSuccess: function ($el) {
            this.removeStatus($el);
        },
        toggleError: function ($el, message) {
            this.removeStatus($el);
            $el.closest('.field').addClass('error');
            this._showMessage($el, message);
        },
        _showMessage: function (input, message) {
            if($(input).hasClass('logger-msg')){
                Logger.error(i18n.t(message));
            }else{
                if ($(input).siblings('.error-msg').length == 0) {
                    $(input).closest('.field').append('<span class="error-msg"><i class="warning circle icon"></i>' + i18n.t(message) + '</span>');
                } else {
                    $(input).siblings('.error-msg').text(i18n.t(message));
                }
            }
        },
        _visible: function (input) {
            return (document.body.scrollTop < input.offset().top);
        },
        createCaptcha: function (ele) {
            if(!ele || !ele.visualCaptcha) {
                return
            }
            return ele.visualCaptcha({
                imgPath: '/images/prelogin/',
                captcha: {
                    numberOfImages: 6,
                    namespaceFieldName:'appcube',
                    routes:{
                        start:'/insta/visualcaptcha/start',
                        image:'/insta/visualcaptcha/image',
                        audio:'/insta/visualcaptcha/audio',
                        try:'/insta/visualcaptcha/try'
                    },
                    callbacks: {
                        loading: function( captcha ){
                            console.log( 'Captcha is loading.', captcha );
                        },
                        loaded: function( captcha ){
                            console.log( 'Captcha is loading.', captcha );
                        }
                    }
                }
            }).data('captcha');
        },
        //upload
        initIconProgress:function(e){
            var c = $(e).get(0);
            var b = c.getContext("2d");
            b.save();
            b.fillStyle = "#000000";
            b.fillRect(0,0,174,174);
            b.restore();
        },
        startUploadIcon:function(e){
            var c = $(e).get(0);
            var b = c.getContext("2d");
            b.save();
            b.beginPath();
            b.arc(87,87,80,0,Math.PI*2);
            b.closePath();
            b.clip();
            b.clearRect(0,0,174,174);
            b.restore();
            this.progressIcon(e,0);
        },
        progressIcon:function(e,final){
            var self = this;
            var percent = $(e).data("percent")||0;
            if(animation){
                cancelRequestAnimationFrame(animation);
            }
            self.progressAnimation(e,percent,final);
        },
        progressAnimation:function(e,percent,final){
            var self = this;
            if(percent>final)percent=final;
            var c = $(e).get(0);
            var b = c.getContext("2d");
            b.save();
            //clip big circle
            b.beginPath();
            b.arc(87,87,80,0,Math.PI*2);
            b.closePath();
            b.clip();
            b.clearRect(0,0,174,174);
            b.restore();
            b.fillStyle = "#000000";
            //draw line
            b.beginPath();
            b.arc(87,87,80,0,Math.PI*2);
            b.closePath();
            b.stroke();
            //draw angle
            b.beginPath();
            if(percent==0){
                b.arc(87,87,60,0,Math.PI*2,true);
            }else{
                b.arc(87,87,60,Math.PI*1.5,Math.PI*(2*percent/100+1.5),true);
            }
            b.lineTo(87,87);
            b.closePath();
            b.fill();
            b.restore();
            $(e).data("percent",percent);
            if(percent<final){
                requestAnimationFrame(function(){
                    self.progressAnimation(e,percent+1,final);
                })
            }else if(percent==100){
                self.completeIcon(e);
            }
        },
        completeIcon:function(e){
            var self = this;
            var c = $(e).get(0);
            var b = c.getContext("2d");
            if(animation){
                cancelRequestAnimationFrame(animation);
            }
            var radius = 80;
            requestAnimationFrame(step);
            function step(){
                radius+=2;
                if(radius>130)radius=130;
                b.save();
                b.beginPath();
                b.arc(87,87,radius,0,Math.PI*2);
                b.closePath();
                b.clip();
                b.clearRect(0,0,174,174);
                b.restore();
                if(radius<130){
                    requestAnimationFrame(step);
                }else{
                    $(e).remove();
                }
            }
        },
        setIntroProps: function(propObj){
            $.each(propObj, function(selector, props){
                props = $.extend(props, {'data-selector': selector});
                $(selector).attr(props);
            });
        },
        doIntro: function(area){
            var vistedIntrosSelector = Storage.get('vistedIntrosSelector') || [];
            $.each(vistedIntrosSelector, function(i, selector){
                $(selector).removeAttr('data-intro');
            });
            var introOptions = {'showStepNumbers': 'false', 'prevLabel': '<', 'nextLabel': '>'};
            if(area){
                introJs(area)
                    .setOptions(introOptions)
                    .start();
            }else{
                introJs()
                    .setOptions(introOptions)
                    .start();
            }
            $('[data-intro]').each(function(i, item){
                vistedIntrosSelector.push($(item).attr('data-selector'));
            });
            Storage.set('vistedIntrosSelector', vistedIntrosSelector);
        }
    }//return done
});