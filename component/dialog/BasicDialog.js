define(
    [
        'app',
        'Logger',
        'core/functions/Validator',
        'marionette',
        'jquery',
        'underscore',
        'semanticui_dropdown'
    ],
    function (AppCube, Logger, Validator, Marionette, $, _) {

        return  Marionette.ItemView.extend({
            template: _.template('<div class="ui form"></div>'),
            beforeShow:function(){},
            beforeHide:function(){
                this.$('.dropdown-parts').each(function (index, e) {
                    if($(e).data('moduleDropdown')){
                        $(e).dropdown('destroy');
                    }
                });
            },
            showLoading:function(){
                this.$('.ui.form').addClass('loading');
                $('#app-dialog .ui.primary.button').addClass('disabled');
            },
            hideLoading:function(){
                this.$('.ui.form').removeClass('loading');
                $('#app-dialog .ui.primary.button').removeClass('disabled');
            },
            autoCheck:function(e){
                var field = $(e.currentTarget).closest('.field');
                Validator.check(field);
            },
            isValid:function(){
                return Validator.check(this.$el);
            },
            renderDropdown:function(){
                this.$('.dropdown-parts').each(function(index,e){
                    if(!$(e).data('moduleDropdown')){
                        $(e).dropdown();
                    }
                });
            },
            render:function(){
                Marionette.ItemView.prototype.render.call(this);
                this.renderDropdown();
                this.$el.i18n();
            }
            
        });
    });