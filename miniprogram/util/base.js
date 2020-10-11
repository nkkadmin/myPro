var showTip = function (msg) {
  wx.showToast({
    icon: 'none',
    title: msg,
    duration: 1000
  })
}
var showLoading = function(msg){
  wx.showLoading({
    title: msg,
  })
}
var hideLoading = function(){
  wx.hideLoading();
}
module.exports = {
  showTip: showTip,
  showLoading: showLoading,
  hideLoading: hideLoading,
}