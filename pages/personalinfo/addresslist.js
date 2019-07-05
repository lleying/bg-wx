// pages/personalinfo/addresslist.js
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
    addressList: [],
    addrIdList: [],
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
    wx.showLoading({
      title: '读取中',
    })
    this.getUserAddress();
  },

  navigate2Page () {
    wx.navigateTo({
      url: '/pages/editinfo/addressedit'
    })
  },
  getUserAddress () {
    let url = API.URL.WX.FINDADDRESS;
    util.http({
      url: url,
      success: (res) => {
        if (res.status == 200) {
          let resData = res.data.bussData,
          idList = [];
          if (resData.length) {
            for (let i = 0; i < resData.length; i++) {
              var item = resData[i];
              item.detailAddress = item.province_name + ' ' + item.city_name + ' ' + item.area_name + ' ' + item.address
              idList.push(resData[i]["id"]);
            }
          }
          console.log(resData);
          this.setData({
            addressList: resData,
            addrIdList: idList
          }, () => {
            wx.hideLoading();
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
  removeAddress (e) {
    let url = API.URL.WX.DELADDRESS,
        id = e.currentTarget.dataset.addrid;
    let data = {
      addressId: id
    }
    util.http({
      url: url,
      data: data,
      success: (res) => {
        if (res.status == 200) {
          let addrArr = this.data.addressList,
          idArr = this.data.addrIdList;
          addrArr.splice(idArr.indexOf(id), 1);
          this.setData({
            addressList: addrArr
          }, () => {
            wx.showToast({ title: res.msg, icon: "success", duration: 1000});
          })
          
        }
        
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000 });
      },
      revertBack: () => {
        this.removeAdress();
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