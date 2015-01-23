define([
        'U',
        'underscore',
        'backbone'
    ],
    function (U, _, Backbone) {

        var Dispatcher = {};
        Dispatcher.on = function (event, callback, context, channel) {
            var type;
            var events = event.split('.');
            type = events.length > 1 ? events[0] : 'Event';
            switch (type) {
                case 'Event':
                    Backbone.Wreqr.radio.channel(channel || 'global').vent.on(events[1] || events[0], callback, context);
                    break;
                case 'Command':
                    Backbone.Wreqr.radio.channel(channel || 'global').commands.setHandler(events[1], callback, context);
                    break;
                case 'Request':
                    Backbone.Wreqr.radio.channel(channel || 'global').reqres.setHandler(events[1], callback, context);
                    break;
                default:
                    throw new Error('None support Message Type');
            }
        };

        var _off = function (channel, event) {
            var type;
            var events = event.split('.');
            type = events.length > 1 ? events[0] : 'Event';
            switch (type) {
                case 'Event':
                    Backbone.Wreqr.radio.channel(channel || 'global').vent.off(events[1] || events[0]);
                    break;
                case 'Command':
                    Backbone.Wreqr.radio.channel(channel || 'global').commands.removeHandler(events[1]);
                    break;
                case 'Request':
                    Backbone.Wreqr.radio.channel('global').reqres.removeHandler(events[1]);
                    break;
                default:
                    throw new Error('None support Message Type');
            }
        };

        Dispatcher.off = function (event, channel) {
            if (_.isArray(channel)) {
                _.forEach(channel, function (item) {
                    _off(item, event);
                })
            } else {
                _off(channel || 'global', event);
            }
        };

        Dispatcher.execute = function (event, options, channel) {
            if (_.isArray(channel)) {
                _.forEach(channel, function (item) {
                    Backbone.Wreqr.radio.channel(item).commands.execute(event, options);
                })
            } else {
                Backbone.Wreqr.radio.channel(channel || 'global').commands.execute(event, options);
            }
        };

        Dispatcher.trigger = function (event, options, channel) {
            if (_.isArray(channel)) {
                _.forEach(channel, function (item) {
                    Backbone.Wreqr.radio.channel(item).vent.trigger(event, options);
                })
            } else {
                Backbone.Wreqr.radio.channel(channel || 'global').vent.trigger(event, options);
            }
        };

        Dispatcher.request = function (event, options, channel) {
            return Backbone.Wreqr.radio.channel(channel || 'global').reqres.request(event, options);
        };

        return Dispatcher;
    });