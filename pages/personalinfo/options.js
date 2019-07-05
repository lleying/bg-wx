// pages/personalinfo/edit.js
//获取应用实例
const app = getApp();
//获取api与请求方法
const API = require('../../common/constant.js');
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userMobile: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
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
    this.getUserMobile();
  },

  showBindingDetail (e) {
    if (e.currentTarget.dataset.type == 'phone') {
      wx.navigateTo({
        url: '/pages/editinfo/bindphone',
      })
    } else {
      console.log(1);
      wx.navigateTo({
        url: '/pages/personalinfo/addresslist',
      })
    }
  },
  getUserMobile () {
    let url = API.URL.WX.FINDMOBILE;
    util.http({
      url: url,
      success: (res) => {
        if (res.status == 200) {
          let userMobile = res.data.bussData;
          if (userMobile) {
            userMobile = userMobile.split('');
            userMobile.splice(3, 4, "****");
            userMobile = userMobile.join('');
          }
          this.setData({
            userMobile: userMobile
          })
        }
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000 });
      },
      revertBack: () => {
        this.getUserMobile();
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