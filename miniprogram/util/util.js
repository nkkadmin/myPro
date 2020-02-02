var dateFormat=function(fmt, date) {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}
/**
* 获取本周、本季度、本月、上月的开始日期、结束日期
*/
var now = new Date(); //当前日期
var nowDayOfWeek = now.getDay(); //今天本周的第几天
var nowDay = now.getDate(); //当前日
var nowMonth = now.getMonth(); //当前月
var nowYear = now.getYear(); //当前年
nowYear += (nowYear < 2000) ? 1900 : 0; //

var lastMonthDate = new Date(); //上月日期
lastMonthDate.setDate(1);
lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
var lastYear = lastMonthDate.getYear();
var lastMonth = lastMonthDate.getMonth();

//获得某月的天数
function getMonthDays(myMonth) {
  var monthStartDate = new Date(nowYear, myMonth, 1);
  var monthEndDate = new Date(nowYear, myMonth + 1, 1);
  var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
  return days;
}

//获得本周的开始日期
var weekStartDate = function() {
  var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
  return dateFormat("YYYY-mm-dd",weekStartDate);
}

//获得本周的结束日期
var weekEndDate = function() {
  var weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek));
  return dateFormat("YYYY-mm-dd",weekEndDate);
}

//获得本月的开始日期
var monthStartDate = function() {
  var monthStartDate = new Date(nowYear, nowMonth, 1);
  return dateFormat("YYYY-mm-dd",monthStartDate);
}

//获得本月的结束日期
var monthEndDate = function() {
  var monthEndDate = new Date(nowYear, nowMonth, getMonthDays(nowMonth));
  return dateFormat("YYYY-mm-dd",monthEndDate);
}

module.exports = {
  dateFormat: dateFormat,//日期格式化
  weekStartDate: weekStartDate, //本周开始日期
  weekEndDate: weekEndDate,     //本周结束日期
  monthStartDate: monthStartDate, //本月开始日期
  monthEndDate: monthEndDate     //本月结束日期
}