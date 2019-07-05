// pages/backpack/list.js
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
    tabShow: 2,
    maskShow: false,
    bagInfo: [],
    currentItem: {},
    userInfo: {},
    gold: 0,
    diamond: 0
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
    this.getBagInfo();
    this.getselfInfo();
    let userInfo = {};
    userInfo.head = app.globalData.headImg;
    userInfo.nickName = app.globalData.nickName;
    this.setData({
      userInfo
    });
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(res) {
    var that = this,
      roomKey = this.data.roomKey
    wx.showShareMenu({
      withShareTicket: true
    });
    return {
      title: '不要发呆了，快来做题！',
      path: `/pages/index/index`,
      imageUrl: `/images/share-poster.png`,
      success(res) {
      }
    }
  },
  switchTab (e) {
    this.setData({
      tabShow: e.currentTarget.dataset.tab
    })
  },
  hideMask (e) {
    if (e.target.id) {
      this.setData({
        maskShow: false
      })
    }
  },
  showMask (e) {
    let imgUrl = e.currentTarget.dataset.img,
    desc = e.currentTarget.dataset.desc;
    let item = {
      url: imgUrl,
      desc: desc
    }
    this.setData({
      currentItem: item,
      maskShow: true
    })
  },
  getBagInfo () {
    let url = API.URL.WX.FINDBAG;
    util.http({
      url: url,
      success: (res) => {
        if (res.status == 200) {
          let resData = res.data.bussData;
          console.log(resData);
          this.setData({
            bagInfo: res.data.bussData
          })
        }
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000});
      },
      revertBack: () => {
        this.getBagInfo();
      }
    })
  },

  getselfInfo() {
    let url = API.URL.WX.FINDUSERINFO;
    util.http({
      url: url,
      success: (res) => {
        if (res.status == 200) {
          let resData = res.data.bussData,
              gold = resData.gardenGold,
              diamond = resData.gardenDiamond;
          this.setData({
            gold,
            diamond
          })
        }
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000 });
      },
      revertBack: () => {
        this.getselfInfo();
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