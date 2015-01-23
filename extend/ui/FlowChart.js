define(['jquery','underscore'],function($,_){
    var defaults = {
        labelColor:"#5ab3ff",
        labelBorderColor:"#5ab3ff",
        labelDisabledColor:"#8e99a1",
        fontsize:14,
        maxLevel:5
    };

    function FlowChart(options){
        this.init(options);
    }

    function preprocess(children){
        var tmp;
        var list = _.chain(children).map(function(item,index){
            var obj = {};
            obj.name = index;
            obj.value = item;
            return obj;
        }).reject(function(item){
            return item.name == 'Exited App';
        }).sortBy(function(item){return -item.value;}).value();
        if(list.length<=4){
            list.push({
                name:'Exited App',
                value:children['Exited App']
            });
            tmp = _.sortBy(list,function(item){return -item.value;});
        }else{
            var data = _.max(list.slice(4),function(item){
                return item.value;
            }).value||0;
            tmp = list.slice(0,4);
            tmp.push({
                name:'Exited App',
                value:children['Exited App']
            });
            tmp = _.sortBy(tmp,function(item){return -item.value;});
            tmp.push({
                name:'Others',
                value:data
            });
        }
        return tmp;
    }

    FlowChart.prototype.init = function(options,data){
        var params = this.params = _.extend({},defaults,options);
        if(!params.renderTo)throw new Error('no root to render!');
        var render_root = $('<div class="flowchart-container"></div>');
        $(params.renderTo).append(render_root);
        this.root = render_root;
        var canvas = $('<canvas class="line-canvas" width="900" height="800"></canvas>').appendTo(render_root);
        this.canvas = canvas.get(0);
        if(data)this.render(data,params);
    };

    FlowChart.prototype.render = function(data,params){
        if(data.length==0){
            throw new Error('data is broken!');
        }
        this.data = data;
        var rootdata = _.find(data,function(item){
            return item.root == true;
        });
        if(!rootdata)return;
        this.renderRoot(rootdata,params||{});
        this.bindEvent();
    };

    FlowChart.prototype.renderFull = function(data,params){
        if(data.length==0){
            throw new Error('data is broken!');
        }
        this.data = data;
        var rootdata = _.find(data,function(item){
            return item.root == true;
        });
        if(!rootdata)return;
        this.renderRoot(rootdata,params||{});
        this.bindEvent();
        while(true){
            var node = this.root.find('.line:last>.activity:eq(0)');
            if(!node.hasClass('disabled')){
                var data = this.getData(node.attr('data-value'));
                if(data&&data.out){
                    this.renderChild(node,data.out,params||{});
                }
            }else{
                break;
            }
        }
    };

    FlowChart.prototype.renderRoot = function(dataline,params){
        this.clearAll();
        var rootName = dataline.activity;
        var rootline = $('<div class="root line"></div>').appendTo(this.root);
        var rootNode = $('<div class="activity root" data-percent=100 data-value="'+rootName+'">'+rootName+'</div>').appendTo(rootline);
        var childNode = dataline.out;
        this.renderChild(rootNode,childNode,params||{});
    };

    FlowChart.prototype.renderChild = function(parent,children,params){
        var render_data = preprocess(children);
        var level = this.root.find('.line').length;
        if(level>=defaults.maxLevel){
            //parent.addClass('disabled');
            return;
        }
        var line = $('<div class="line"></div>').appendTo(this.root);
        var self = this;
        _.forEach(render_data,function(item){
            var node = $('<div class="activity" data-value="'+item.name+'">'+item.name+'</div>').appendTo(line);
        });
        var dataline = this.getData(parent.attr('data-value'));
        var rootPercent = parent.attr('data-percent');
        line.children('.activity').each(function(){
            var name = $(this).attr('data-value');
            var child_value = Math.round(dataline.out[name]*10000)/100;
            var value = rootPercent*child_value/100;
            if(value<0.1||name=="Exited App"||name=="Others"||level>=defaults.maxLevel-1){
                $(this).addClass('disabled');
            }
            $(this).attr('data-percent',value);
            var display_value = Math.round(value*100)/100+'%';
            self.drawLine(parent.get(0),this,display_value,params||{});
        });
    };

    FlowChart.prototype.clearChild = function(root){
        var line = root.parent();
        line.nextAll().remove();
        var c = this.canvas;
        var b = c.getContext("2d");
        var node = root.get(0);
        b.clearRect(0,node.offsetTop+node.offsetHeight/2, c.width, c.height);
    };

    FlowChart.prototype.clearAll = function(){
        var root = this.root;
        root.find('.line').remove();
        var c = this.canvas;
        var b = c.getContext("2d");
        b.clearRect(0, 0, c.width, c.height);
    };

    FlowChart.prototype.drawLine = function(startNode,endNode,data,params){
        var c = this.canvas;
        var start = {
            x:startNode.offsetLeft+startNode.offsetWidth/2,
            y:startNode.offsetTop+startNode.offsetHeight
        };
        var end = {
            x:endNode.offsetLeft+endNode.offsetWidth/2,
            y:endNode.offsetTop
        };
        var color;
        if($(endNode).hasClass('disabled')){
            color = params.labelDisabledColor||defaults.labelDisabledColor;
        }else{
            color = params.labelColor||defaults.labelColor;
        }
        var b = c.getContext("2d");
        b.save();
        b.lineWidth = 1;
        b.strokeStyle = color;
        b.beginPath();
        b.moveTo(start.x,start.y);
        b.lineTo(end.x,end.y);
        b.closePath();
        b.stroke();
        b.restore();
        b.fillStyle = color;
        b.beginPath();
        b.rect((start.x+end.x)/2-22,(end.y+start.y)/2-11,44,22);
        b.closePath();
        b.fill();
        b.restore();
        b.textAlign = "center";
        b.fillStyle = "#ffffff";
        b.fillText(data,(start.x+end.x)/2,(end.y+start.y)/2+5);
        b.restore();
    };

    FlowChart.prototype.getData = function(name){
        var dataline = _.find(this.data,function(item){
            return item.activity == name;
        });
        return dataline?dataline:false;
    };

    FlowChart.prototype.bindEvent = function(){
        var self = this;
        this.root.off('click.activity').on('click.activity','.activity',function(){
            var root = $(this);
            if($(this).hasClass('disabled'))return;
            self.clearChild(root);
            var data = self.getData(root.attr('data-value'));
            if(data&&data.out){
                self.renderChild($(this),data.out);
            }
        });
    };

    return FlowChart;
});