// pages/message/detail.js
const API = require('../../common/constant');
const util = require('../../utils/util');
const app = getApp();
Page({
  data: {
    detail:{}
  },
  onLoad: function (options) {
    if (app.globalData.status == 'off') {
      this.dialogShow('您的账号已被冻结！');
      setTimeout(() => {
        wx.navigateBack({
          delta: 1000
        })
      }, 1000);
      return;
    }
    this.getData(options.id);
  },
  getData(id) {
    let url = API.URL.WX.FINDMESSAGEdETAIL;
    let data = { id : id };
    util.http({
      url: url,
      data:data,
      success: (res) => {
        if (res.status == 200) {
           this.setData({
             detail: res.data.bussData
           })
        }
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000 });
      },
      revertBack: () => {
        this.getList();
      }
    })
  },
  //弹出框
  dialogShow: function (text) {
    this.setData({
      dialogText: text
    })
    wx.hideLoading()
    setTimeout(() => {
      this.setData({
        dialogText: ''
      })
    }, 2000)
  },
})