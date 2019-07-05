// pages/message/list.js
const API = require('../../common/constant');
const util = require('../../utils/util');
const app = getApp();
Page({
  data: {
    pageIndex: 1,
    pageIndexOne:1,
    pageCount: '',
    indicatorDots: false,
    autoplay: true,
    interval: 300,
    duration: 1000,
    noMoreShow: true,
    vertical:true,
    loading: true,
    scrollHeight: '',
    list: [],
    currentTab: 0,
    isActive: 0,
    listData: [],
    userData: {},
    listMsgData:[],
    messageData: [
      {
        name: '黄依依',
        conent: '哇，张可太棒了，下周继续加油'
      },
      {
        name: '洪丽',
        conent: '哇，张家俊太棒了，下周继续加油'
      },
      {
        name: '张可',
        conent: '哇，张一山太棒了，下周继续加油'
      },
      {
        name: '张佳俊',
        conent: '哇，张可太棒了，下周继续加油'
      },
      {
        name: '张一山',
        conent: '哇，张家俊太棒了，下周继续加油'
      }
    ]
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
    this.geTListMseeage();
    wx.getSystemInfo({
      success: (res) => {
        this.getList();
        this.setData({
          scrollHeight: parseInt(res.windowHeight)
        })
      }
    });
    setInterval(() => {
      this.setData({
        pageIndex: this.data.pageIndex + 1
      });

      this.geTListMseeage()
    }, 5000);


  },
  clickTab: function (e) {
    wx.showLoading({
      title: '加载中......'
    });
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
      })
    }
    this.setData({
     list:[]
    })
    this.getList()
  },

  goAddMsg() {
    wx.navigateTo({
      url: '/pages/messageAdd/messageAdd',
    })
  },
  getList() {
    wx.showLoading({
      title: '加载中......'
    });
    let url = API.URL.Ranking.RankingList;
    let data = {
      pageIndex: this.data.pageIndexOne,
      pageSize: 10,
    }
    if (this.data.currentTab == '0') {
      data.truePointDESC = true;
      data.pageSize=10;
    }
    if (this.data.currentTab == '1') {
      data.fakePointDESC = true;
      data.pageSize = 23;
    }
    util.http({
      url: url,
      data: data,
      success: (res) => {
        if (res.code == 200) {
          setTimeout(() => {
            wx.hideLoading();
          }, 1000);
          let bussData = res.data.bussData,
            pageCount = res.data.pageCount;
          let list = this.data.list.concat(bussData);
          console.log(list[0].name,'list')
          this.setData({
            list: this.data.pageIndexOne <= pageCount ? list : this.data.list,
            pageCount: pageCount,
            pageIndex: this.data.pageIndexOne,
            loading: true
          })
          if (this.data.list.length == 0) {
            // this.setData({
            //   scrollHeight: 'auto'
            // })
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
  seeDetail(e) {
    wx.navigateTo({
      url: `/pages/message/detail?id=${e.currentTarget.dataset.id}`,
    })
  },
  geTListMseeage(){
    let url = API.URL.Message.ListMseeage;
    let data = {
      pageIndex: this.data.pageIndex,
      pageSize: 5,
    }
    util.http({
      url: url,
      data: data,
      success: (res) => {
        if (res.code == 200) {
          let bussData = res.data.bussData,
            pageCount = res.data.pageCount;
          this.setData({
            listMsgData: this.data.pageIndex <= pageCount ? bussData : this.data.list,
            pageCount: pageCount,
            pageIndex: this.data.pageIndex,
            loading: true
          })
          if (res.data.bussData.length < 5) {
            this.setData({
              pageIndex: 1
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
        this.geTListMseeage();
      }
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
    this.geTListMseeage();
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