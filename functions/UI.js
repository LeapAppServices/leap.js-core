define([
    'app',
    'U',
    'i18n',
    'Logger',
    'jquery',
    'underscore',
    'bootstrap'
], function (AppCube,U,i18n,Logger,$,_) {
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
        initDialog: function () {
            $(document).on('hide.bs.modal', '#app-dialog', function (e) {
                var view = $('#app-dialog').data('dialog-view');
                if (view)view.destroy();
            });
        },
        showDialog: function (title, message, option) {
            $('#app-dialog .modal-title').html(title);
            if (option.footer == false) {
                $('#app-dialog .modal-footer').hide();
            } else {
                $('#app-dialog .modal-footer').show();
            }
            if (option && option.initialize)option.initialize();
            $('#app-dialog').off('.dialog').on('keydown.dialog', function (e) {
                if (e.keyCode == 13) {
                    $('#app-dialog .btn-primary').click();
                }
            });
            $('#app-dialog .btn-primary').unbind().bind('click', function () {
                if (option && option.success) {
                    option.success($('#app-dialog').data('dialog-view'));
                }
            });
            $('#app-dialog .btn-default').unbind().bind('click', function () {
                if (option && option.error) {
                    option.error($('#app-dialog').data('dialog-view'));
                }
            });
            if (!$('#app-dialog').find('.modal-body').length) {
                $('#app-dialog .modal-header').after('<div class="modal-body"><div class="col-sm-12"></div></div>');
            }
            if (typeof message == 'string') {
                $('#app-dialog .modal-body>div').html(message);
            } else {
                var view = new message({
                    el: "#app-dialog .modal-body"
                });
                $('#app-dialog').data('dialog-view', view);
                view.render(option);
            }
            $('#app-dialog').modal('show');
        },
        hideDialog: function () {
            $('#app-dialog').modal('hide');
        },
        bindUploader:function(elems,preview,callback){
            elems.each(function(index,button){
                var uploader = $('<input type="file" style="display:none" />').insertAfter($(button));
                $(button).on('click',function(){
                    uploader.trigger('click');
                });
                if(preview){
                    uploader.change(function(){
                        var reader = new FileReader();
                        var file = ($(this).get(0).files)[0]||{type:""};
                        if(U.isImage(file)){
                            reader.readAsDataURL(file);
                            reader.onloadend = function(e) {
                                $(preview).css('opacity',1);
                                $(preview).css("background-image", "url("+e.target.result+")");
                            }
                        }
                        if(callback)callback();
                    });
                }else{
                    uploader.change(function(){
                        if(callback)callback();
                    });
                }
            });
        },
        removeStatus: function (input) {
            $(input).removeClass('success error');
            $(input).siblings('.error-msg').remove();
        },
        toggleSuccess: function (input) {
            this.removeStatus(input);
            this._toggleStatus(input, 'success');
        },
        toggleError: function (input, message) {
            this._toggleStatus(input, 'error');
            this._showMessage(input, message);
        },
        _showMessage: function (input, message) {
            if($(input).hasClass('logger-msg')){
                Logger.error(i18n.t(message));
            }else{
                if ($(input).siblings('.error-msg').length == 0) {
                    $(input).after('<span class="error-msg">' + i18n.t(message) + '</span>');
                } else {
                    $(input).siblings('.error-msg').text(i18n.t(message));
                }
            }
        },
        _toggleStatus: function (input, status) {
            $(input).removeClass('error success').addClass(status);
        },
        _visible: function (input) {
            return (document.body.scrollTop < input.offset().top);
        },
        initLangSelect: function (options) {
            options.storeName = options.storeName || "Store:Lang";
            options.placeholder = options.placeholder || "Language";
            this.initSingleSelect(options);
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
            b.beginPath();
            b.arc(87,87,80,0,Math.PI*2);
            b.closePath();
            b.clip();
            b.clearRect(0,0,174,174);
            b.restore();
            b.fillStyle = "#000000";
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
        }
    }//return done
});