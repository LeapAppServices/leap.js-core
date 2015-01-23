define([
    'data/Task',
    'Q',
    'underscore'
], function (Task, Q, _) {
    var INIT = 0, PENDING = 1, SUCCESS = 2, ERROR = 3;

    var ChainTask = Task.extend({
        initialize: function (taskArray) {
            if (!_.isArray(taskArray))throw new Error('ChainTask: ChainTask need a Task Array to initialize');
            this._taskStack = taskArray;
            this.options = taskArray[0]?taskArray[0].options:{};
            this.result = [];
            this.state = INIT;
            this.defer = Q.defer();
            return true;
        },
        _configure: function(options){
            this.options = options;
            this._taskStack[0].options = options;
        },
        start: function () {
            if (this.state == PENDING) {
                return this.defer.promise;
            } else if (this.state == SUCCESS || this.state == ERROR) {
                this.defer = Q.defer();//Update defer
            }
            this.state = PENDING;
            this.result = [];
            var count = 0;
            this.startTask(count);
            return this.defer.promise;
        },
        startTask: function (count, options) {
            var self = this;
            var task = this._taskStack[count];
            if (options){
                var newOptions = _.extend({},task.options,options);
                task._configure(newOptions);
            }
            task.start().done(function (res) {
                self.result.push(res);
                if (count < self._taskStack.length - 1) {
                    var options = task.options.next ? task.options.next(res, task.options) : null;
                    if(options === false){
                        self.state = SUCCESS;
                        self.defer.resolve(self.result);
                    }else{
                        self.startTask(count + 1, options);
                    }
                } else {
                    self.state = SUCCESS;
                    self.defer.resolve(self.result);
                }
            });
        }
    });

    ChainTask.create = function (taskArray) {
        var ret = new ChainTask();
        if (ret.initialize(taskArray) == false) {
            return false;
        }
        return ret;
    };

    return ChainTask;
});