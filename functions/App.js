define(['backbone', 'marionette'], function (Backbone, Marionette) {
    var app = new Backbone.Marionette.Application();
    window.Application = app;
    return app;
});