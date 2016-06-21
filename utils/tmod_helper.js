template.helper('dateFormate', function(timestamps) {
  function formatNum(num) {
    num = Number(num);
    if(num < 10) {
      num = '0' + num;
    }
    return num;
  }

  timestamps = Number(timestamps);

  var originalTime = new Date(timestamps),
      currentTime = (new Date()).getTime(),
      interval = currentTime - timestamps,
      days,
      hours,
      minutes,
      seconds,
      timeHtml = '';

  days = Math.floor(interval / (24 * 3600 * 1000)); //相差天数
  hours = Math.floor(interval / (3600 * 1000)); //相差小时数
  minutes = Math.floor(interval / (60 * 1000)); //相差分钟
  seconds = Math.floor(interval / 1000); //相差秒数

  var adjustedYear = originalTime.getFullYear(),
      adjustedMonth = formatNum(originalTime.getMonth() + 1),
      adjustedDate = formatNum(originalTime.getDate()),
      adjustedHours = formatNum(originalTime.getHours()),
      adjustedMinutes = formatNum(originalTime.getMinutes()),
      adjustedSeconds = formatNum(originalTime.getSeconds());

  var nowTime = new Date();

  if(originalTime.getFullYear() === nowTime.getFullYear() && originalTime.getMonth() === nowTime.getMonth() && originalTime.getDate() === nowTime.getDate()) {
    if(seconds < 60) {
      timeHtml = '刚刚';
    } else if (minutes < 60) {
      timeHtml = minutes + '分钟前';
    } else {
      timeHtml = '今天 ' +
              adjustedHours + ':' +
              adjustedMinutes;
    }
  } else if(originalTime.getFullYear() === nowTime.getFullYear() && originalTime.getMonth() === nowTime.getMonth() && originalTime.getDate() === (nowTime.getDate() - 1)) {
    timeHtml = '昨天 ' +
            adjustedHours + ':' +
            adjustedMinutes;
  } else {
    var yearHtml = '';

    if(adjustedYear !== (new Date()).getFullYear()) {
      yearHtml = adjustedYear + '年';
    }

    timeHtml += yearHtml +
            adjustedMonth + '月' +
            adjustedDate + '日 ' +
            adjustedHours + ':' +
            adjustedMinutes;
  }

  return timeHtml;
});

template.helper('dateFormate1', function (date, format) {
  data = Number(date);

  date = new Date(date);

  var map = {
    'M': date.getMonth() + 1, //月份
    'd': date.getDate(), //日
    'h': date.getHours(), //小时
    'm': date.getMinutes(), //分
    's': date.getSeconds(), //秒
    'q': Math.floor((date.getMonth() + 3) / 3), //季度
    'S': date.getMilliseconds() //毫秒
  };

  format = format.replace(/([yMdhmsqS])+/g, function(all, t){
    var v = map[t];

    if(v !== undefined) {
      if(all.length > 1) {
        v = '0' + v;
        v = v.substr(v.length-2);
      }

      return v;
    } else if(t === 'y') {
      return (date.getFullYear() + '').substr(4 - all.length);
    }

    return all;
  });

  return format;
});
