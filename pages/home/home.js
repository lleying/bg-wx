// pages/product/product.js
const utils = require('../../utils/util.js'),
  API = require('../../common/constant.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    dataTrue: 0, //答题竞赛
    dataFake: 0, //三九内经
    openId: '',
    sessionId: '',
    sessionKey: '',
    userData: {}
  },

  bindGetUserInfo(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      // 获取到用户的信息了，打印到控制台上看下

      this.saveUserInfo(this.data.openId, this.data.sessionKey);
      wx.showLoading({
        title: '授权登录中......'
      });
      setTimeout(() => {
        this.setData({
          isHide: false
        });
        wx.hideLoading();
      }, 2000);

      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      // that.setData({
      //   isHide: false
      // });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },

  goUser() {
    wx.navigateTo({
      url: '/pages/user/user',
    })
  },
  navigate2page(e) {
    var target = e.currentTarget.dataset.src;
    console.log(target, 'target')
    switch (target) {
      case 'rule':
        wx.navigateTo({
          url: '/pages/rule/rule',
        })
        break;
      case 'ranking':
        wx.navigateTo({
          url: '/pages/ranking/ranking',
        })
        break;

      case 'quizchoose':
        if (this.data.dataFake == 1) {
          wx.navigateTo({
            url: '/pages/quizchoose/index',
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '当前模块暂未开启',
            showCancel: false,
            confirmColor: '#327A08',
            success: function(res) {
              if (res.confirm) {
              } else if (res.cancel) {}
            }
          })
        }
        break;
      case 'pair':
        if (this.data.dataTrue == 1) {
          wx.navigateTo({
            url: '/pages/pairversus/lobby',
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '当前模块暂未开启',
            showCancel: false,
            confirmColor: '#327A08',
            success: function(res) {
              if (res.confirm) {
              } else if (res.cancel) {
              }
            }
          })
        }
        break;
    }
  },
  login(callback) {
    let that = this;
    // console.log('‘正在登陆’');
    wx.showLoading({
      title: '登录中......'
    });
    // debugger
    wx.login({
      success: res => {
        if (res.code) {
          utils.http({
            url: API.URL.WX.LOGIN,
            dataForm: {
              code: res.code
            },
            success: (res) => {
              let openId = res.data.bussData.openId;
              let sessionKey = res.data.bussData.sessionKey;
              let sessionId = res.data.bussData.sessionId;
              if (sessionId != undefined) {
                wx.hideLoading();
                this.setData({
                  userData: res.data.bussData
                });
                wx.setStorageSync("sessionId", res.data.bussData.sessionId);
                wx.setStorageSync("userData", res.data.bussData);
                return
              }

              wx.setStorageSync("openId", openId);
              wx.setStorageSync("sessionKey", sessionKey);
              this.setData({
                openId: res.data.bussData.openId
              });
              this.setData({
                sessionKey: res.data.bussData.sessionKey
              });
              this.setData({
                isHide: true
              });
              wx.hideLoading()
            },
            fail: (res) => {

              callback && callback()
            },
            revertBack: () => {}
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail: function(res) {
        console.log('用户登录失败！')
        console.log(res);
      },
      complete(res) {}
    })
  },
  saveUserInfo(openId, sessionKey) {
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function(res) {
        let encryptedData = res.encryptedData,
          iv = res.iv;
        wx.request({
          url: API.URL.WX.LOGIN2,
          header: {
            'content-type': 'application/json; charset=utf-8'
          },
          data: {
            openId: openId,
            encryptedData: encryptedData,
            iv: iv,
            sessionKey: sessionKey
          },
          dataType: 'json',
          method: 'POST',
          success: (res) => {
            wx.hideLoading();

            wx.setStorageSync("userData", res.data.data.bussData);
            wx.setStorageSync("openId", res.data.data.bussData.openId);
            wx.setStorageSync("sessionId", res.data.data.bussData.sessionId);
            wx.setStorageSync("sessionKey", sessionKey);
            let wxUserData = res.data.data.bussData
            that.setData({
              userData: wxUserData
            });
            wx.hideLoading();
          }
        })
      },
      fail: function(res) {
        wx.hideLoading()
        if (res.errMsg == 'getUserInfo:fail auth deny') {
          that.getAccess('小程序需要获取用户权限，点击确认前往设置');
        } else {
          console.log(res.errMsg);
        }
      }
    })
  },


  // 获取三九内经是否开启 （0-关闭 1-开启）
  getFake() {
    let url = API.URL.GAME.FINDfake;
    utils.http({
      url: url,
      success: (res) => {
        if (res.code == 200) {
          this.setData({
            dataFake: res.data.bussData
          });
        }
      },
      fail: (res) => {

      },
    })
  },

  // 获取答题竞赛是否开启  （0-关闭 1-开启）
  getTrue() {
    let url = API.URL.GAME.FINDtrue;
    utils.http({
      url: url,
      success: (res) => {
        if (res.code == 200) {
          this.setData({
            dataTrue: res.data.bussData
          });
        }
      },
      fail: (res) => {

      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.login()
    this.getFake()
    this.getTrue()
    this.globalData.url = options.path;

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  globalData: {
    url: '',
    headImg: '',
    nickName: '',
    userId: '',
    isHide: false,
    socketOpen: false,
    msgTimer: null,
    robotTimer: null,
    robotTime: 15,
    lastLibIndex: 0,
    status: 'on'
  }
})