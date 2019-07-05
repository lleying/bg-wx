// pages/testlibrary/list.js
const app = getApp()
const API = require('../../common/constant.js');
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
     showItems: [],
     deltaX: 0,
     currentX: 0,
     startIndex: 0,
     endIndex: 0,
     libItems: [{ itemId: 'lib-lv6', title: '六级题库', total: 200, done: 20, id: 1 }, { itemId: 'lib-lv1', title: '一级题库', total: 200, done: 30, id: 2 }, { itemId: 'lib-lv2', title: '二级题库', total: 200, done: 40, id: 3 }, { itemId: 'lib-lv3', title: '三级题库', total: 200, done: 50, id: 4 }, { itemId: 'lib-lv4', title: '四级题库', total: 200, done: 60, id: 5 }, { itemId: 'lib-lv5', title: '五级题库', total: 200, done: 70, id: 6}],
     coordArr: [-290, 85, 460],
     zArr: [[1, 2, 1], [3, 2, 1], [1, 2, 3]],
     zArrIndex: 0,
     scrollLeft: 0,
     currentLibId: 0,
     currentQuestionCount: 0,
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
    var that = this;
    this.getLibInfo();
  },

  onShow () {
    if(this.data.showItems.length) {
      this.getLibInfo();
    }
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
  getLibInfo() {
    let url = API.URL.GAME.FINDPAGE;
    util.http({
      url: url,
      data: {
        pageIndex: 1,
        pageSize: 100
      },
      success: (res) => {
        if (res.code == 200) {
          let resData = res.data.bussData;
          resData.unshift(resData.splice(resData.length - 1, 1)[0]);
          let libItems = resData,
            showItems = libItems.slice(0, 3),
            centerItem = showItems[1];
            let currentLibId = centerItem.id,
            curretQuestionIndex = centerItem.id >= centerItem.questionCount ? 0 : centerItem.id,
            currentQuestionCount = centerItem.questionCount;
          this.setData({
            libItems,
            showItems,
            startIndex: 0,
            endIndex: 3,
            currentLibId,
            curretQuestionIndex,
            currentQuestionCount
          })
        }
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000 });
      },
      revertBack: () => {
        this.getLibInfo();
      }
    })
  },
  startTest (e) {
    let libId = e.currentTarget.dataset.libid,
      currentQuestionIndex = e.currentTarget.dataset.currentindex,
      questionCount = e.currentTarget.dataset.questioncount;
    if (questionCount <= 0) {
      wx.showToast({
        title: '题库暂未添加试题，请选择其他题库',
        icon: 'none'
      });
      return
    }
    wx.showModal({
      title: '提示',
      cancelText:'否',
      confirmText:'是',
      content: '欢迎进入随堂练习，本次答题由XX赞助提供，是否马上开始学习？',
      confirmColor: '#327A08',
      success: function (res) {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/testlibrary/test?libId=${libId}&index=${currentQuestionIndex}`
          })
        } else if (res.cancel) {
          
        }
      }
    })
  },
  switchLibByTap (e) {
    let start = this.data.startIndex,
      end = this.data.endIndex,
      arr = this.data.libItems;
    if (e.currentTarget.dataset.direction == 'left') {
      arr.unshift(arr.pop()); 
    } else {
      arr.push(arr.shift());
    }
    console.log(arr);
    this.setData({
      libItems: arr
    }, () => {
      let showItems = this.data.libItems.slice(start, end),
          centerItem = showItems[1],
          currentLibId = centerItem.id,
          curretQuestionIndex = centerItem.id >= centerItem.questionCount ? 0 : centerItem.id,
          currentQuestionCount = centerItem.questionCount;
      this.setData({
        startIndex: start,
        endIndex: end,
        showItems,
        currentLibId,
        curretQuestionIndex,
        currentQuestionCount
      })
    });
  },
  switchLib (bool) {
    let start = this.data.startIndex,
    end = this.data.endIndex,
    arr = this.data.libItems;
    if (bool) {
      arr.unshift(arr.pop());
    } else {
      arr.push(arr.shift());
    }
    this.setData({
      libItems: arr
    }, () => {
      let showItems = this.data.libItems.slice(start, end),
        centerItem = showItems[1],
        currentLibId = centerItem.id,
        curretQuestionIndex = centerItem.id >= centerItem.questionCount ? 0 : centerItem.id,
        currentQuestionCount = centerItem.questionCount;
      console.log(showItems);
      this.setData({
        startIndex: start,
        endIndex: end,
        showItems,
        currentLibId,
        curretQuestionIndex,
        currentQuestionCount
      })
    });
  },
  recordStart (e) {
    this.setData({
      currentX: e.changedTouches[0].clientX 
    })
  },
  recordEnd(e) {
    if (this.data.deltaX / 2 > 100) {
      this.switchLib(true);
    } else if (this.data.deltaX / 2 < -50) {
      this.switchLib(false);
    }
    this.setData({
      deltaX: 0,
      currentX: 0,
      zArrIndex: 0
    })
  },
  moveItem(e) {
    let delta = e.changedTouches[0].clientX - this.data.currentX,
    zArrIndex = delta > 0 ? 1 : 2;
    if (delta > 145) {
      delta = 145
    } else if (delta < -145) {
      delta = -145
    }
    this.setData({
      deltaX: delta * 2,
      zArrIndex: zArrIndex
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