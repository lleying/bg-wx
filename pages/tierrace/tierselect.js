// pages/tierrace/tierselect.js
const app = getApp()
const API = require('../../common/constant.js');
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    maskShow: false,
    userInfo: {},               //用户基本信息 keys:["danName": 角色段位, "gardenGrade": 花园等级, "level": 角色等级],
    dan: 0,                     //用户段位值，1-7表示青铜至大师段位
    danArr: [
      { danName: 'bronze', danChinese: '青铜', danLevel: 0, danStars: [{ index: 0 }, { index: 1 }, {index: 2 }], danCost: 30, danMaxStar: 2  },
      { danName: 'silver', danChinese: '白银', danLevel: 1, danStars: [{ index: 0 }, { index: 1 }, { index: 2 }], danCost: 60, danMaxStar: 2 },
      { danName: 'gold', danChinese: '黄金', danLevel: 2, danStars: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }], danCost: 90, danMaxStar: 3  },
      { danName: 'platinum', danChinese: '铂金', danLevel: 3, danStars: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }], danCost: 150, danMaxStar: 3},
      { danName: 'diamond', danChinese: '钻石', danLevel: 4, danStars: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }], danCost: 300, danMaxStar: 3},
      { danName: 'shining', danChinese: '星耀', danLevel: 5, danStars: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }], danCost: 500, danbg: '/images/shining-tier-bg.png', danMaxStar: 4 },
      { danName: 'challenger', danChinese: '王者', danLevel: 6, danStars: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }], danCost: 800, danbg: '/images/challenger-tier-bg.png' },
    ],                           //段位数据
    currentDanStar: [],           //当前段位星星路径的数组，王者5星以上则为int，表示胜场
    danStar: 0,                   //当前星数 int
    romeArr: ['I', 'II', 'III', 'IV', 'V'],
    userData:{}
  },


  onLoad: function (options) {
    let wxUserData = wx.getStorageSync('userData')
    this.setData({
      userData: wxUserData
    });
  },



  onShow() {
    if (app.globalData.status == 'off') {
      this.dialogShow('您的账号已被冻结！');
      setTimeout(() => {
        wx.navigateBack({
          delta: 1000
        })
      }, 1000);
      return;
    }
    this.getselfInfo();
  },

  
  getCurrentStarArr (currentLevel, currentStar) {
    let dataArr = this.data.danArr,
    arrLength = dataArr[currentLevel]['danStars'].length,
    starArr = [];
    if (currentLevel == 6 && currentStar > 4) {
      return currentStar
    }
    for (let i = 0; i < arrLength; i++) {
      let starObj = {index: i},
          starSrc = i < currentStar + 1 ? '/images/tier-star-full.png' : '/images/tier-star-empty.png';
      starObj.src = starSrc;
      starArr.push(starObj);
    }
    return starArr;
  },
  getselfInfo() {
    let url = API.URL.WX.FINDUSERINFO;
    util.http({
      url: url,
      success: (res) => {
        let resData = res.data.bussData,
          danLevel = resData.danLevel,
          danStar = resData.danStar,
          currentDanStar = this.getCurrentStarArr(danLevel, danStar);
        if (danStar <= 5) {
          let danDesc = this.data.romeArr[danStar];
          resData.danName = resData.danName + danDesc;
        } else if (danStar > 5) {
          resData.danName = resData.danName + danStar;
        }
        this.setData({
          userInfo: resData,
          dan: resData.danLevel,
          currentDanStar,
          danStar
        });
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000});
      },
      revertBack: () => {
        this.getselfInfo();
      }
    })
  },

  hideMask(e) {
    if (e.target.id) {
      this.setData({
        maskShow: false
      })
    }
  },

  enterMatch (e) {
    let coin = this.data.userInfo.gardenGold,
        danLevel = e.currentTarget.dataset.danlevel;
    if (danLevel > this.data.dan) {
      return;
    }
    if (coin < e.currentTarget.dataset.cost) {
      this.setData({
        maskShow: true
      });
      return
    } else {
      wx.navigateTo({
        url: `/pages/versus/index?danLevel=${danLevel}`,
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