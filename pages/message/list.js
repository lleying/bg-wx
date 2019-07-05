// pages/message/list.js
const API = require('../../common/constant');
const util = require('../../utils/util');
const app = getApp();
Page({
  data: {
    pageIndex: 1,
    pageCount: '',
    noMoreShow: true,
    loading: true,
    scrollHeight: '',
    list:[],
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
    wx.getSystemInfo({
      success: (res) => {
        this.getList();
        this.setData({
          scrollHeight: parseInt(res.windowHeight)
        })
      }
    });
  },
  getList() {
    let url = API.URL.WX.FINDMESSAGELISTBYPAGE;
    util.http({
      url: url,
      dataForm: {
        pageIndex: this.data.pageIndex,
        pageSize: 10,
      },
      success: (res) => {
        if (res.status == 200) {
          let bussData = res.data.bussData,
            pageCount = res.data.pageCount;
          let list = this.data.list.concat(bussData);
          this.setData({
            list: this.data.pageIndex <= pageCount ? list : this.data.list,
            pageCount: pageCount,
            pageIndex: this.data.pageIndex,
            loading: true
          })
          if (this.data.list.length == 0) {
            this.setData({
              scrollHeight: 'auto'
            })
          }
          if (pageCount == 1) {
            this.setData({
              noMoreShow: false,
              loading: true,
            })
          }
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
  onShareAppMessage: function () {
  
  },
  seeDetail (e) {
    wx.navigateTo({
      url: `/pages/message/detail?id=${e.currentTarget.dataset.id}`,
    })
  },
  //分页功能
  searchScrollLower() {
    let { pageIndex, pageCount } = this.data;
    if (!this.data.loading) return false;
    this.setData({
      loading: true
    })
    if (pageCount <= pageIndex) return false;
    this.data.pageIndex++;
    if (this.data.pageIndex == 11) return false;
    this.getList();
    if (pageCount - 1 <= pageIndex) {
      this.setData({
        noMoreShow: false
      })
    }
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