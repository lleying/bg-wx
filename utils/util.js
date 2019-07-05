const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function http({ url, data = {}, dataForm, method = 'POST', success, fail, revertBack } = {}) {
  const openId = wx.getStorageSync('openId');
  const sessionId = wx.getStorageSync('sessionId');
  let str = '';
  for (var item in dataForm) {
    str = str + '&' + item + '=' + dataForm[item]
  }
  var api = sessionId ? url + '?openId=' + openId + '&sessionId=' + sessionId : url + '?openId=' + openId;
  var url = str ? api + str : api;
  wx.request({
    url: url,
    data: data,
    header: { 'content-type': 'application/json; charset=utf-8','sessionId':sessionId },
    method,
    success: function (res) {
     
      if (res.data.code == '200') {
        success && success(res.data);
      }
      else if (res.data.code == '401') {
        let appInstance = getApp();
        appInstance.login(revertBack);
      }
      else {
        fail && fail(res.data);
      }
    },
    fail: function (res) {
      // 请求失败，错误处理 
      //  errorHandler(res);
    }
  })
}

function errorHandler(res) {}

module.exports = {
  formatTime: formatTime,
  formatNumber: formatNumber,
  http: http,
  errorHandler: errorHandler
}
