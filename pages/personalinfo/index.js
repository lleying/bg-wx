// pages/personalinfo/index.js
import * as echarts from '../../ec-canvas/echarts';
const app = getApp();
function initChart(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  chart.setOption(app.option);
  return chart;
}

const API = require('../../common/constant');
const util = require('../../utils/util');
Page({
  data: {
    ec: {
      onInit: initChart
    },
    userInfo:{},
    gameDistrib: [],
    romeArr: ['I', 'II', 'III', 'IV', 'V'],
    danStar: 0
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
    this.getselfInfo()
  },
  getselfInfo() {
    let url = API.URL.WX.FINDUSERINFO;
    util.http({
      url: url,
      success: (res) => {
        if (res.status == 200) {
          let resData = res.data.bussData;
          let list = resData.gameDistrib;
          let gameDistrib = resData.gameDistrib,
          danStar = resData.danStar;
          if (danStar <= 5) {
            danStar = this.data.romeArr[danStar];
            resData.danName = resData.danName + danStar;
          } else if (danStar > 5) {
            resData.danName = resData.danName + danStar;
          }
          list.forEach((item,index)=>{
            let rate = item.totalCount == 0 ? 0 : ( item.winCount / item.totalCount)*100;
            gameDistrib[index].rate = rate.toFixed(2);
          })
          console.log(gameDistrib)
          this.setData({
            userInfo: resData,
            gameDistrib: gameDistrib,
            danStar
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
  navigate2Options () {
    wx.navigateTo({
      url: '/pages/personalinfo/options',
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