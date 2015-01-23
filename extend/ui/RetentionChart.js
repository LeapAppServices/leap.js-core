define(['jquery','underscore','d3'],function($,_,d3){
    var defaults = {
        colors:[
            "#d4ede0",
            "#e1f3e9",
            "#e9f7ef",
            "#f1f9ef",
            "#fefce6",
            "#fef9e6",
            "#fff5e0",
            "#ffe9e6"
        ],
        grid:{
            width:120,
            height:30,
            fontsize:14,
            padding:{
                left:20
            }
        },
        border_color:"#dfe1e6",
        label_color:"#f1f3f8",
        ranges:8,
        width:1200,
        date_width:100,
        renderTo:"body",
        label_prefix:" Day later",
        data:[{
            install_period:"",
            total_install:0,
            retention_rate:[]
        }]
    };

    function getRange(data){
        var max = 0;
        var min = 100;
        for(var i in data){
            var d = data[i].retention_rate;
            for(var j in d){
                if(d[j]>max)max = d[j];
                if(d[j]<min)min = d[j];
            }
        }
        return [min,max];
    }

    function checkRange(value,range,n){
        var n = n||8;
        var min = range[0];
        var max = range[1];
        var length = (max-min)/n;
        if(length==0)return 0;
        for(var i=0;i<=8;i++){
            min+=length;
            if(min>value){
                if(i>=7)i=7;
                return i;
            }
        }
    }

    function RetentionChart(options){
        this.initialize(options);
        this.render();
    }

    RetentionChart.prototype.initialize = function(options){
        var params = this.params = _.extend({},defaults,options);
        var height = params.height||(params.data.length+1)*params.grid.height+1;
        var render_root = d3.select(params.renderTo);
        this.root = render_root
            .append('div')
            .attr('style','overflow:hidden;float:left;')
            .append('svg')
            .attr('width',params.date_width+params.grid.width)
            .attr('height',height);

        var content_width = render_root[0][0].offsetWidth-params.date_width-params.grid.width-1;
        this.content = d3.select(params.renderTo)
            .append('div')
            .attr('style','overflow-x:scroll;float:left;width:'+content_width+'px')
            .append('svg')
            .attr('width',params.width-params.date_width-params.grid.width)
            .attr('height',height)
            .attr('style','overflow-x:scroll');
        this.drawTitle();
    };

    RetentionChart.prototype.render = function(){
        var params = this.params;
        this.range = getRange(params.data);
        var height = (params.data.length+1)*params.grid.height+1;
        this.root.attr('height',height);
        this.content.attr('height',height);
        this.clear();
        this.drawLabel();
        this.drawDate();
        this.drawInstall();
        this.drawRetentionRate();
    };

    RetentionChart.prototype.setData = function(data){
        delete this.params.data;
        this.params.data = data;
    };

    RetentionChart.prototype.setRange = function(range){
        switch(range){
            case 'daily':
                this.params.label_prefix = 'Day Later';
                break;
            case 'weekly':
                this.params.label_prefix = 'Week Later';
                break;
            case 'monthly':
                this.params.label_prefix = 'Month Later';
                break;
        }
    };

    RetentionChart.prototype.destroy = function(){
        this.root.remove();
        delete this;
    };

    RetentionChart.prototype.clear = function(){
        this.content.select('.rentention-table-label').remove();
        this.content.select('.rentention-table-label-text').remove();
        this.content.select('.rentention-table-rate').remove();
        this.content.select('.rentention-table-rate-text').remove();
        this.root.select('.rentention-table-install').remove();
        this.root.select('.rentention-table-install-text').remove();
        this.root.select('.rentention-table-date').remove();
        this.root.select('.rentention-table-date-text').remove();
    };

    RetentionChart.prototype.drawTitle = function(){
        var root = this.root;
        var params = this.params;
        var fonty = (params.grid.height+params.grid.fontsize)/2;

        root.append('rect')
            .attr('fill',params.label_color)
            .attr('style','stroke-width:1;shape-rendering:crispedges;')
            .attr('stroke',params.border_color)
            .attr('x',0)
            .attr('y',0)
            .attr('width',params.date_width).attr('height',params.grid.height);

        root.append('text')
            .text('Date')
            .attr('x',params.grid.padding.left)
            .attr('y',fonty)
            .attr('text-anchor','start')
            .attr('font-family','sans-serif')
            .attr('font-size',params.grid.fontsize+'px');

        root.append('rect')
            .attr('fill',params.label_color)
            .attr('style','stroke-width:1;shape-rendering:crispedges;')
            .attr('stroke',params.border_color)
            .attr('x',params.date_width)
            .attr('y',0)
            .attr('width',params.grid.width).attr('height',params.grid.height);

        root.append('text')
            .text('New Users')
            .attr('x',params.grid.padding.left+params.date_width)
            .attr('y',fonty)
            .attr('text-anchor','start')
            .attr('font-family','sans-serif')
            .attr('font-size',params.grid.fontsize+'px');
    };

    RetentionChart.prototype.drawLabel = function(){
        var content = this.content;
        var params = this.params;
        var fonty = (params.grid.height+params.grid.fontsize)/2;
        var length = params.data.length>1?(params.data[0].retention_rate.length||0):0;

        content.attr('width',params.grid.width*length);

        var tmp = new Array(length);

        content.append('g').attr('class','rentention-table-label').selectAll('rect')
            .data(tmp)
            .enter().append('rect')
            .attr('fill',params.label_color)
            .attr('style','stroke-width:1;shape-rendering:crispedges;')
            .attr('stroke',params.border_color)
            .attr('x',function(d,index){return index*params.grid.width;})
            .attr('y',0)
            .attr('width',params.grid.width).attr('height',params.grid.height);

        content.append('g').attr('class','rentention-table-label-text').selectAll('text')
            .data(tmp)
            .enter().append('text')
            .text(function(d,index){return (index+1)+params.label_prefix;})
            .attr('x',function(d,index){return params.grid.width*(index+0.5)})
            .attr('y',fonty)
            .attr('fill','#697f90')
            .attr('text-anchor','middle')
            .attr('font-family','sans-serif')
            .attr('font-size',params.grid.fontsize+'px');
    };

    RetentionChart.prototype.drawDate = function(){
        var root = this.root;
        var params = this.params;
        var fonty = (params.grid.height+params.grid.fontsize)/2;

        root.append('g').attr('class','rentention-table-date').selectAll('rect')
            .data(params.data)
            .enter().append('rect')
            .attr('fill',function(d,index){
                var color = (index%2==0)?"#fff":params.label_color;
                return color
            })
            .attr('style','stroke-width:1;shape-rendering:crispedges;')
            .attr('stroke',params.border_color)
            .attr('x',0)
            .attr('y',function(d,index){return (index+1)*params.grid.height;})
            .attr('width',params.date_width).attr('height',params.grid.height);

        root.append('g').attr('class','rentention-table-date-text').selectAll('text')
            .data(params.data)
            .enter().append('text')
            .text(function(d){return d.install_period;})
            .attr('x',params.grid.padding.left)
            .attr('y',function(d,index){return (index+1)*params.grid.height+fonty;})
            .attr('text-anchor','start')
            .attr('font-family','sans-serif')
            .attr('font-size',params.grid.fontsize+'px');
    };

    RetentionChart.prototype.drawInstall = function(){
        var root = this.root;
        var params = this.params;
        var fonty = (params.grid.height+params.grid.fontsize)/2;

        root.append('g').attr('class','rentention-table-install').selectAll('rect')
            .data(params.data)
            .enter().append('rect')
            .attr('fill',function(d,index){
                var color = (index%2==0)?"#fff":params.label_color;
                return color
            })
            .attr('style','stroke-width:1;shape-rendering:crispedges;')
            .attr('stroke',params.border_color)
            .attr('x',params.date_width)
            .attr('y',function(d,index){return (index+1)*params.grid.height;})
            .attr('width',params.grid.width).attr('height',params.grid.height);

        root.append('g').attr('class','rentention-table-install-text').selectAll('text')
            .data(params.data)
            .enter().append('text')
            .text(function(d){return d.total_install;})
            .attr('x',params.grid.padding.left+params.date_width)
            .attr('y',function(d,index){return (index+1)*params.grid.height+fonty;})
            .attr('text-anchor','start')
            .attr('font-family','sans-serif')
            .attr('font-size',params.grid.fontsize+'px');
    };

    RetentionChart.prototype.drawRetentionRate = function(){
        var content = this.content;
        var params = this.params;
        var range = this.range;
        var fonty = (params.grid.height+params.grid.fontsize)/2;

        var rate_root = content.append('g').attr('class','rentention-table-rate');
        var row = rate_root.selectAll('g')
            .data(params.data)
            .enter().append('g')
            .attr('class','rentention-table-rate-row');
        row.selectAll('rect')
            .data(function(d,index){
                return d.retention_rate;
            })
            .enter().append('rect')
            .attr('fill',function(d){
                var level = checkRange(d,range);
                return params.colors[level];
            })
            .attr('style','stroke-width:1;shape-rendering:crispedges;')
            .attr('stroke',params.border_color)
            .attr('x',function(d,index){
                return index*params.grid.width;
            })
            .attr('y',function(d,x,y){
                return (y+1)*params.grid.height;
            })
            .attr('width',params.grid.width).attr('height',params.grid.height);

        var text_root = content.append('g').attr('class','rentention-table-rate-text');

        var row = text_root.selectAll('g')
            .data(params.data)
            .enter().append('g')
            .attr('class','rentention-table-rate-text-row');

        row.selectAll('text')
            .data(function(d,index){
                return d.retention_rate;
            })
            .enter().append('text')
            .text(function(d){return d+'%';})
            .attr('x',function(d,index){
                return params.grid.width*(index+0.5);
            })
            .attr('y',function(d,x,y){
                return (y+1)*params.grid.height+fonty;
            })
            .attr('text-anchor','middle')
            .attr('font-family','sans-serif')
            .attr('font-size',params.grid.fontsize+'px');
    };


    return RetentionChart;
});