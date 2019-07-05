// pages/editinfo/bindphone.js
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
    codeMsg: '获取验证码',         //获取验证码按钮显示文字, string, 默认为'获取验证码',发送验证码后改为倒计时'xs' 
    mobile: '',                   //用户填写的手机号码
    code: '',                     //用户填写的验证码
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
  },


  mobileBind(e) {
    console.log(e);
    this.setData({
      mobile: e.detail.value
    })
  },
  codeBind(e) {
    this.data.code = e.detail.value;
  },
  sendCode() {
    if (!this.data.mobile) {
      this.dialogShow('手机号不能为空')
      return;
    }
    if (!(/^1[34578]\d{9}$/.test(this.data.mobile))) {
      this.dialogShow('手机号格式不对')
      return;
    }
    if (this.data.codeMsg != '获取验证码') {
      return;
    }
    console.log('enter send', this.data.mobile);
    let time = 60;
    this.getCode()
    setInterval(() => {
      if (time <= 1) {
        this.setData({
          codeMsg: '获取验证码'
        })
        return;
      }
      this.setData({
        codeMsg: time-- + 's'
      })
    }, 1000)
  },
  getCode() {
    console.log('start log');
    let url = API.URL.WX.FINDMOBILECODE;
    util.http({
      url: url,
      dataForm: {
        mobile: this.data.mobile,
        bizType: 'register'
      },
      success: ({ data: { bussData } }) => {
      },
      fail: (res) => {
        this.dialogShow(res.msg)
      },
      revertBack: () => {
        this.getCode();
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
  updateMobile() {
    if (!this.data.mobile) {
      this.dialogShow('手机号不能为空')
      return;
    }
    if (!this.data.code) {
      this.dialogShow('验证码不能为空')
      return;
    }
    let url = API.URL.WX.UPDATEMOBILE,
    param = {
      mobile: this.data.mobile,
      code: this.data.code
    }
    util.http({
      url: url,
      data: param,
      success: (res) => {
        if (res.status == 200) {
          let userMobile = res.data.bussData;
          this.setData({
            userMobile: userMobile
          })
          wx.showToast({
            title: '绑定手机成功',
            icon: 'success',
            success () {
              setTimeout(() => {
                wx.navigateBack({
                  delta: 2
                })
              }, 1500)
            }
          });
          
        }
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000 });
      },
      revertBack: () => {
        this.getUserMobile();
      }
    })
  }
})