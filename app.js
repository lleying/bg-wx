//app.js 
import {
  ToastPannel
} from './tools/toastTest';
const utils = require('./utils/util.js'),
  API = require('./common/constant.js');
App({
  ToastPannel,
  onLaunch: function(options) {
    // this.login();
    this.globalData.url = options.path;
   
  },
  onHide() {
    this.globalData.isHide = true;
  },
  // login: function(callback) {
  //   let that = this;
  //   // console.log('‘正在登陆’');
  //   // wx.showLoading({
  //   //   title: '登录中......'
  //   // });
  //   // debugger
  //   wx.login({
  //     success: res => {
  //       console.log(res.code)
  //       if (res.code) {
  //         console.log(res.code, 'res22222222222222222222222222222.code')
  //         utils.http({
  //           url: API.URL.WX.LOGIN,
  //           data: {
  //             code: res.code
  //           },
  //           success: (res) => {
             
  //           },
  //           fail: (res) => {
  //             console.log('登陆成功', res);
  //             console.log(res.msg)
  //             let openId = res.data.bussData.openId;
  //             let sessionId = res.data.bussData.sessionId;
  //             let sessionKey = res.data.bussData.sessionKey;
  //             wx.setStorageSync("openId", openId);
  //             wx.setStorageSync("sessionId", sessionId);
  //             wx.setStorageSync("sessionKey", sessionKey);

              
  //             wx.hideLoading()
  //             callback && callback()
  //             that.saveUserInfo(openId,sessionKey);
  //           },
  //           revertBack: () => {}
  //         })
  //       } else {
  //         console.log('获取用户登录态失败！' + res.errMsg)
  //       }
  //     },
  //     fail: function (res) {
  //       console.log('用户登录失败！')
  //       console.log(res);
  //     },
  //     complete (res) {
  //     }
  //   })
  // },
  saveUserInfo(openId,sessionKey) {
    console.log(openId, 'openIdopenIdopenIdopenIdopenId')
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function(res) {
        console.log(res,'pppooooo')
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
            // that.setSelfInfo();
            console.log('saveUserInfo')
            wx.hideLoading();
          }
        })
      },
      fail: function(res) {
        wx.hideLoading()
        console.log(res.errMsg, res, 'res.errMsgres.errMsgres.errMsg')
        if (res.errMsg == 'getUserInfo:fail auth deny') {
          that.getAccess('小程序需要获取用户权限，点击确认前往设置');
        } else {
          console.log(res.errMsg);
        }
      }
    })
  },
  getAccess: function(text) {
    let that = this;
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userInfo']) {
          wx.showModal({
            title: '提示',
            content: text,
            confirmText: '确认',
            cancelText: '取消',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    if (res.authSetting['scope.userInfo']) {
                      wx.showToast({
                        title: '开启成功',
                        icon: 'success',
                        duration: 1500
                      })
                      wx.reLaunch({
                        url: '../index/index'
                      })
                    } else {
                      that.getAccess('关闭授权可能会无法使用小程序部分功能，可点击确认前往重新开启设置');
                    }
                  }
                });
              }
              // else if (res.cancel) {
              //   wx.showModal({
              //     title: '提示',
              //     content: '您已取消授权,重新授权请重新进入小程序',
              //     showCancel: false
              //   })
              // }
            }
          })
        } else {
          console.log('已获取用户权限');

        }
      }
    })
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