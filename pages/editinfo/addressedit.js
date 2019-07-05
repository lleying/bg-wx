// pages/editinfo/addressedit.js
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
    name: '',                                         //姓名 str 默认为''
    mobile: '',                                       //手机号 int 默认为''
    regionData: ["北京市", "北京市", "东城区"],         //地区信息 str 默认为["广东省", "深圳市", "南山区"]
    detailAddress: '',                                //详细地址 str 默认为''
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

  bindNameInput (e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindMobileInput (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  bindDetailInput(e) {
    this.setData({
      detailAddress: e.detail.value
    })

  },
  bindRegionChange (e) {
    this.setData({
      regionData: e.detail.value
    })
  },
  saveAddress () {
    if (!this.data.name) {
      this.dialogShow('姓名不能为空！')
      return;
    }
    if (!this.data.detailAddress) {
      this.dialogShow('详细地址不能为空！')
      return;
    }
    if (!this.data.mobile) {
      this.dialogShow('手机号不能为空！')
      return;
    }
    if (!(/^1[34578]\d{9}$/.test(this.data.mobile))) {
      this.dialogShow('手机号格式不对！')
      return;
    }
    
    let url = API.URL.WX.FINDREFIONS,
    provinceId = 0,
    cityId = 0,
    areaId = 0;
    util.http({
      url: url,
      data:{
        parentId : 1
      },
      success: (res) => {
        let resData = res.data.bussData;
        console.log('省份',resData);
        let provinceName = this.data.regionData[0];
        provinceName = provinceName.slice(0, provinceName.length - 1);
        for(let i = 0 ; i < resData.length ; i++){
          if (provinceName == resData[i].region_name){
            console.log('provinceId', resData[i].region_id)
              provinceId= resData[i].region_id
            break;
          }
        }
        util.http({
          url: url,
          data: {
            parentId: provinceId
          },
          success: (res) => {
            let resData = res.data.bussData;
            console.log('城市', resData);
            let cityName = this.data.regionData[1];
            cityName = cityName.slice(0, cityName.length - 1);
            for (let i = 0; i < resData.length; i++) {
              if (resData[i].region_name.indexOf(cityName) != -1) {
                cityId = resData[i].region_id;
                break;
              }
            }
            // diqu 
            let url = API.URL.WX.FINDREFIONS;
            util.http({
            url: url,
            data: {
                parentId: cityId
            },
              success: (res) => {
                let resData = res.data.bussData;
                console.log('地区', resData);
                let areaName = this.data.regionData[2];
                areaName = areaName.slice(0, areaName.length -1);
                for (let i = 0; i < resData.length; i++) {
                  if (resData[i].region_name.indexOf(areaName) != -1) {
                    areaId = resData[i].region_id
                    break;
                  }
                }
                let url = API.URL.WX.ADDADDRESS,
                  address = this.data.detailAddress,
                  consignee = this.data.name,
                  mobile = this.data.mobile,
                  data = {address, consignee, mobile, provinceId,cityId,areaId};
                util.http({
                  url: url,
                  data,
                  success: (res) => {
                    let resData = res.data.bussData;
                    wx.showToast({
                      title: '保存成功！',
                      icon: 'success',
                    })
                    setTimeout(() => {
                      wx.navigateBack({
                        delta: 1
                      })
                    }, 1500)
                  },
                  fail: (res) => {
                    wx.showToast({ title: res.msg})
                  },
                  revertBack: () => {
                    this.getCode();
                  }
                });
                var obj = {
                  provinceId,
                  cityId,
                  areaId
                }
                console.log('111',obj);
                return obj;
              },
            //diqu
          })
          },
          fail: (res) => {
            this.dialogShow(res.msg)
          },
          revertBack: () => {
            this.getCode();
          }
        })

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

})