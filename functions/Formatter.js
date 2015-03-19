define([
    'moment',
    'underscore'
], function (moment, _) {
    return {
        AnalyticsTask:function(res,options){
            var dates = [];
            var stats = [];
            var tmp_stats = {};
            var tmp,range;
            var start_moment = moment(options.params.start_date,'YYYY-MM-DDHH');
            var end_moment = moment(options.params.end_date,'YYYY-MM-DDHH');
            var timeunit = options.params.time_unit;
            var unix = start_moment.unix();
            _.forEach(res.stats,function(item){
                tmp_stats[item.date+''] = item;
            });
            if(timeunit == 'hourly'){
                range = (end_moment.diff(start_moment,'days')+1)*24;
                while(range>0){
                    tmp = parseInt(moment.unix(unix).format('YYYYMMDDHH'));
                    dates.push(tmp);
                    stats.push(tmp_stats[tmp]?tmp_stats[tmp]:{date:tmp});
                    unix+=3600;
                    range--;
                }
            }else if(timeunit=='daily'){
                range = end_moment.diff(start_moment,'days')+1;
                var day_moment = start_moment.clone();
                while(range>0){
                    tmp = day_moment.format('YYYYMMDD');
                    dates.push(tmp);
                    stats.push(tmp_stats[tmp]?tmp_stats[tmp]:{date:tmp});
                    day_moment.subtract(-1,'days');
                    range--;
                }
            }else if(timeunit=='weekly'){
                range = end_moment.diff(start_moment,'weeks')+1;
                var week_moment = start_moment.clone();

                if(start_moment.day()==1){
                }else if(start_moment.day()==0){
                    week_moment = week_moment.day(1);
                }else{
                    week_moment = week_moment.subtract(-7,'days').day(1);
                }

                while(range>0){
                    tmp = week_moment.format('YYYYMMDD');
                    dates.push(tmp);
                    stats.push(tmp_stats[tmp]?tmp_stats[tmp]:{date:tmp});
                    week_moment.subtract(-7,'days');
                    range--;
                }
            }else if(timeunit=='monthly'){
                range = end_moment.diff(start_moment,'months')+1;
                var month_moment = start_moment.clone();
                if(start_moment.date()!=1){
                    month_moment = month_moment.subtract(-1,'month').date(1);
                }

                while(range>0){
                    tmp = month_moment.format('YYYYMMDD');
                    dates.push(tmp);
                    stats.push(tmp_stats[tmp]?tmp_stats[tmp]:{date:tmp});
                    month_moment.subtract(-1,'month').date(1);
                    range--;
                }
            }
            res.dates = dates;
            res.stats = stats;
            res.chart_name = options.params.start_date+' - '+options.params.end_date;
            return res;
        },
        Float2Percent:function(row, cell, value, columnDef, dataContext){
            if(typeof value == 'number'){
                return Math.round(value*10000)/100+'%';
            }else{
                return value;
            }
        },
        TotalPercent:function(row, cell, value, columnDef, dataContext){
            var rate = Math.round(dataContext[columnDef.field+'_rate']*10000)/100+'%';
            return value +' ('+rate+')';
        },
        DateFormat:function(row, cell, value, columnDef, dataContext){
            if((value+'').length==10){
                return moment(value,'YYYYMMDDHH').format('YYYY/MM/DD HH:mm');
            }else if((value+'').length==9){
                var unit = value.charAt(value.length-1);
                var start = moment(value,'YYYYMMDDHH').format('YYYY/MM/DD');
                var end = '';
                if(unit=='W'){
                    end = moment(value,'YYYYMMDD').subtract(-7,'days').format('YYYY/MM/DD');
                }else{
                    var tmp = moment(value,'YYYYMMDD');
                    var tmp_moment = (tmp.date()==1)?tmp:tmp.subtract(-1,'month');
                    end = tmp_moment.subtract(-1,'month').subtract(1,'days').format('YYYY/MM/DD');
                }
                return start+' - '+end;
            }else{
                return moment(value,'YYYYMMDDHH').format('YYYY/MM/DD');
            }
        },
        NormalDateFormat:function(row, cell, value, columnDef, dataContext){
            return moment(value).format('YYYY/MM/DD HH:mm');
        },
        StringFormat: function (row, cell, value, columnDef, dataContext) {
            return (typeof value == 'string') ? value : '';
        },
        NumberFormat: function (row, cell, value, columnDef, dataContext) {
            return (typeof value == 'number') ? value : 0;
        },
        ActionAllFormat:function(row, cell, value, columnDef, dataContext){
            return '<i class="action edit icon"></i><i class="action trash icon"></i>';
        },
        ActionDeleteFormat:function(row, cell, value, columnDef, dataContext){
            return '<i class="action trash icon"></i>';
        }
    }
});