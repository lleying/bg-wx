// pages/quizchoose/index.js
//获取应用实例
const app = getApp();
//获取api与请求方法
const API = require('../../common/constant');
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ruleContent: '1.每天都可以到社区去找星瞳进行答题, 答对的题目越多, 奖励就越丰厚。不仅如此, 遇到样式。具体后台编辑'
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
    this.getRule();
  },

  
  nevigatePage (e) {
    var url = ''
    if (e.currentTarget.dataset.src == 'tier') {
      url = '/pages/tierrace/tierselect';
    } else {
      url = '/pages/testlibrary/list';
    }
    wx.navigateTo({
      "url": url
    })
  },
  getRule () {
    let url = API.URL.GAME.FINDRULE;
    util.http({
      url: url,
      success: (res) => {
        if (res.code == 200) {
          let resData = res.data.bussData;
          this.setData({
            ruleContent: resData
          })
        }
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000 });
      },
      revertBack: () => {
        this.getUserAdress();
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