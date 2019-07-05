//index.js
//获取应用实例  
const app = getApp();
const API = require('../../common/constant.js');
const util = require('../../utils/util');
Page({
  data: {
    options: {},
    userInfo: {},               //用户基本信息 keys:["danName": 角色段位, "gardenGrade": 花园等级, "level": 角色等级]
    rewardInfo: {},
    prizeTabShow: 1,            //奖励领取tab显示, int, 默认为1:登录奖励 2:每日任务
    prizeShow: false,            //领取奖励页, bool, 默认为false, 当用户点击“奖品”或者登录时未领取每日奖励的情况下为true
    loginRewardFlag: 0,           //是否有每日奖励可以领取，用于每次启动检测是否弹窗，0为已领过，1为未领取
    hasTakeLoginReward: false,
    gameRewardFlag: 0,          //是否能领取今日的比赛任务奖励, int, 默认为0, 比赛次数不足且未领取为1, 当比赛次数大于等于3且未领取过的情况下为2
    practiceRewardFlag: 0,      //是否能领取题库练习奖励, int, 默认为0, 练习次数不足且未领取为1, 当题库练习次数大于等于1且未领取过的情况下为2
    dailyRewardArr: [{ name: '第一天' }, { name: '第二天' }, { name: '第三天' }, { name: '第四天' }, { name: '第五天' }, { name: '第六天' }, { name: '第七天' } ],
    romeArr: ['I', 'II', 'III', 'IV', 'V'],
    loginPrizeArr: [2, 2, 2, 2, 2, 2, 2],     //0表示当日，未领取; 1表示已领取; 2表示还未到或已过期 
    hasPrize: false,                     //除每日奖励外是否有其他奖励未领取
  },
  onLoad: function (options) {
    // app.userInfoReadyCallback = resolveUserInfo(resData, options);
    
    this.setData({
      options
    }, () => {
      if (app.globalData.isHide) {
        app.globalData.isHide = false;
        this.getSelfInfo();
        let target = options.target || '',
            roomKey = options.roomKey || '';
        if (target == 'tier') {
          wx.navigateTo({
            url: '/pages/tierrace/tierselect',
          })
        } else if (target == 'friend' && roomKey) {
          wx.navigateTo({
            url: `/pages/pairversus/lobby?roomKey=${roomKey}`
          })
        }
      }
      app.userInfoReadyCallback = (resData) => {
        let options = this.data.options,
            target = options.target || '',
            roomKey = options.roomKey || '',
            danStar = resData.danStar;
        app.globalData.status = resData.status;

        if (target == 'tier') {
          wx.navigateTo({
            url: '/pages/tierrace/tierselect',
          })
        } else if (target == 'friend' && roomKey) {
          wx.navigateTo({
            url: `/pages/pairversus/lobby?roomKey=${roomKey}`
          })
        }
        if (danStar <= 5) {
          danStar = this.data.romeArr[danStar];
          resData.danName = resData.danName + danStar;
        } else if (danStar > 5) {
          resData.danName = resData.danName + danStar;
        }
        this.setData({
          userInfo: resData
        }, () => {
          app.globalData.isLogin = true;

        });
        this.getPrizeInfo();
        // 雷达图
        let answerDistrib = resData.answerDistrib;
        let indicator = [];
        let option = [];
        answerDistrib.forEach((item) => {
          let indicatorItem = {};
          indicatorItem.name = item.categoryName;
          indicatorItem.max = 100;
          let optionItem = 0.00;
          if (item.winCount != 0) {
            optionItem = ((parseInt(item.winCount) / parseInt(item.totalCount)) * 100).toFixed(2);
          }
          indicator.push(indicatorItem);
          option.push(optionItem);
        });
        // console.log(option);
        app.option = this.getRadarOption(option, indicator);
          /**
           * 
           * [
          { name: '命中率', max: 100, },
          { name: '胜率', max: 100 },
          { name: '出手速度', max: 100 },
          { name: '反杀率', max: 100 },
          { name: '一血率', max: 100 }
        ]
           */
      };
    })
  },
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
 
  showPrize () {
    this.setData({
      prizeShow: true
    })
  },
  closePrize (e) {
    if (e.target.id == 'prizeWrap' || e.target.id == 'prizeClose') {
      this.setData({
        prizeShow: false
      })
    }
  },
  getPrizeInfo () {
    let url = API.URL.WX.FINDREWARD;
    util.http({
      url: url,
      success: (res) => {
        if (res.status == 200) {
          let resData = res.data.bussData,
            gameDate = this.timeFormat(resData.gameRewardDate.slice(0, 10)),
            loginDate = this.timeFormat(resData.loginRewardDate.slice(0, 10)),
            practiceDate = this.timeFormat(resData.practiceRewardDate.slice(0, 10)),
            defaultDate = this.timeFormat('1970-01-01'),
            today = this.timeFormat(new Date()),
            gameCount = resData.gameCount,
            loginIndex = resData.loginIndex,
            practiceCount = resData.practiceCount,
            loginDays = resData.loginRewardDays ? resData.loginRewardDays : '',
            loginDaysArr = loginDays.length >= 1 ? loginDays.split(',') : [],
            prizeArr = [2, 2, 2, 2, 2, 2, 2];
          if (loginDate != today) {
              prizeArr[loginIndex - 1] = 0;
              this.setData({
                prizeShow: true
              })
          }
          if (loginDaysArr.length && loginIndex != 1) {
            loginDaysArr.forEach((e, i) => {
              var index = Number(e);
              prizeArr[index - 1] = 1;
            })
          }
          
          // 每日游戏奖励领取情况
          if (today != gameDate && gameCount >= 3) {
            this.setData({
              gameRewardFlag: 2,
              hasPrize: true
            })
          } else if (today == gameDate) {
            this.setData({
              gameRewardFlag: 0
            })
          } else if (today != gameDate && gameCount < 3) {
            this.setData({
              gameRewardFlag: 1
            })
          }
          // 题库练习奖励领取情况
          if (defaultDate == practiceDate && practiceCount >= 1) {
            this.setData({
              practiceRewardFlag: 2,
              hasPrize: true
            })
          } else if (defaultDate == practiceDate && practiceCount < 1) {
            this.setData({
              practiceRewardFlag: 1
            })
          } else if (defaultDate != practiceDate) {
            this.setData({
              practiceRewardFlag: 0
            })
          }
          // console.log(prizeArr);
          this.setData({
            loginPrizeArr: prizeArr,
            loginIndex: loginIndex - 1,
            rewardInfo: resData
          });
        }
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000 });
      },
      revertBack: () => {
        this.getPrizeInfo();
      }
    })
  },
  
  getSelfInfo() {
    let url = API.URL.WX.FINDUSERINFO;
    util.http({
      url: url,
      success: (res) => {
        if (res.status == 200) {
          let resData = res.data.bussData;
          this.setData({
            userInfo: resData
          })
        }
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000 });
      },
      revertBack: () => {
        this.getSelfInfo();
      }
    })
  },
  timeFormat (str) {
    var time = new Date(str),
        str = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDay()}`;
    return str;
  },
  navigate2page(e) {
    var target = e.currentTarget.dataset.src;
    switch (target) {
      case 'message':
        wx.navigateTo({
          url: '/pages/message/list',
        })
        break;
      case 'personalinfo':
        wx.navigateTo({
          url: '/pages/personalinfo/index',
        })
        break;
      case 'quizchoose':
        wx.navigateTo({
          url: '/pages/quizchoose/index',
        })
        break;
      case 'pair':
        wx.navigateTo({
          url: '/pages/pairversus/lobby',
        })
        break;
      case 'shop':
        wx.navigateTo({
          url: '/pages/shop/list',
        })
        break;
      case 'backpack':
        wx.navigateTo({
          url: '/pages/backpack/list',
        })
        break;
      case 'tierrace':
        wx.navigateTo({
          url: '/pages/tierrace/tierselect',
        })
        break;
    }
  },
  switchTab(e) {
    this.setData({
      prizeTabShow: e.currentTarget.dataset.tab
    })
  },  
  takePrize (e) {
    let type = e.currentTarget.dataset.type;
    console.log(type);
    this.updateReward(type);
  },
  updateReward (type) {
    let url = API.URL.WX.UPDATEREWARD,
    data = {
      rewardEnum: type
    };
    util.http({
      url: url,
      data,
      success: (res) => {
        wx.showToast({
          title: '领取成功',
          icon: 'success'
        })
        if (type == 'LOGIN') {
          this.setData({
            hasTakeLoginReward: true
          }, () => {
            this.getPrizeInfo();
            return;
          })
        }
        this.setData({
          hasPrize: false
        }, () => {
          this.getPrizeInfo();
        })
        
      },
      fail: (res) => {
        wx.showToast({ title: res.msg, image: '../../images/warn.png', duration: 1000 });
      },
      revertBack: () => {
        this.updateReward();
      }
    })
  },
  getRadarOption(option_value, indicator) {
    let option = {
      backgroundColor: "#fff",
      color: '#19B377',
      tooltip: {},
      radar: {
        name: {
          textStyle: {
            color: '#000'
          }
        },
        axisLine: {
          lineStyle: {
            color: '#e1e1e1',
            width: 1
          }
        },
        splitLine: {
          lineStyle: {
            color: '#19B377',
            width: 1
          }
        },
        splitArea: {
          areaStyle: {
            color: '#fff',
          }
        },
        indicator:indicator
      },
      series: [{
        type: 'radar',
        itemStyle: {
          normal: {
            areaStyle: {
              color: 'rgba(25,179,119,0.8)',
              backgroundColor: "#fff"
            },
            lineStyle: {
              color: '#e1e1e1',
              width: 0
            }
          }
        },
        data: [{
          value: option_value
        },
        ]
      }]
    };
    return option;
  }
})
