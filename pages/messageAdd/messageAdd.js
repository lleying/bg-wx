// pages/messageAdd/messageAdd.js
const utils = require('../../utils/util.js'),
API = require('../../common/constant.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msgValue: '',
  },
  //获取用户输入的用户名
  msgValueInput: function(e) {
    this.setData({
      msgValue: e.detail.value
    })
  },
  submint() {
    if (this.data.msgValue == '') {
      wx.showToast({
        title:'不能为空',
        image: '../../images/error.png',
        duration: 1000
      })
      return false
    }
    console.log("留言内容" + this.data.msgValue)

    let url = API.URL.Message.AddMseeage,
      message = this.data.msgValue,
      data = JSON.stringify({message});
    utils.http({
      url: url,
      data,
      header: {
        'sessionId': wx.getStorageSync('userData').sessionId, 
      },
      success: (res) => {
        wx.showToast({
          title: '留言成功',
          icon: 'success',
        })
        setTimeout(() => {
          this.setData({
            msgValue: ''
          })
          wx.navigateTo({
            url: '/pages/ranking/ranking',
          })
        }, 1500)
      },
      fail: (res) => {
        wx.showToast({
          title: res.msg
        })
      },
      revertBack: () => {
        this.getCode();
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    console.log(11111111111)
  },

  /**
   * 生命周期函数--监听页面卸载
   */


  onUnload: function () {
  
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

  }
})