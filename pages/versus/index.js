// pages/testlibrary/test.js
const app = getApp();
//获取api与请求方法
const API = require('../../common/constant.js');
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sessionId: '',               //sessionId
    danLevel: 0,                 //在哪个段位进行比赛
    second: 10,                  //倒数秒数， int， 固定为10
    timer: null,                 //倒数计时器， 默认为null
    robotTime: 15,               //机器人倒计时
    startRotate: false,          //是否开始旋转倒计时进度条, bool, 默认为false
    fadeIn: false,               //是否渐入展示题目, bool, 默认为false
    myBottom: -560,              //我的分数进度条填充高度， int， 默认为-560
    rivalBottom: -560,           //对手分数进度条填充高度， int， 默认为-560
    option: '',                  //提交的选项 A B C D ''
    quizData: {},                //题目信息
    currentIndex: 0,             //当前做到第几题
    correctAnswer: '',           //正确答案
    myChoice: '',                //我的选择
    rivalChoice: '',             //对手的选择
    startChoose: false,          //是否可以点击选项
    hasChoose: false,            //"我"是否已选择选项
    bothChoose: false,           //双方是否都已选择完
    optionsArr: ['A', 'B', 'C', 'D'],
    gameResult: 1,               //游戏结果, int, 默认为1:胜利, 2: 失败, 3: 平局
    currentPage: 1,              //当前所在页数
    userInfo: { nickName: '', userId: 0, head: '' },               //用户信息 包含用户头像和昵称和id
    rivalInfo: { nickName: '', userId: 0, head: '' },               //对手信息 包含对手头像，昵称和id
    myScore: 0,
    rivalScore: 0,
    goldReward: 0,
    expReward: 0,
    isInitiator: false,         //是否是房主，影响比赛结束后点击“继续挑战”的去向
    firstFetch: true,
    userData:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    let wxUserData = wx.getStorageSync('userData')
    this.setData({
      userData: wxUserData
    });
    if (app.globalData.status == 'off') {
      this.dialogShow('您的账号已被冻结！');
      setTimeout(() => {
        wx.navigateBack({
          delta: 1000
        })
      }, 1000);
      return;
    }
    clearInterval(app.globalData.robotTimer);
    clearInterval(app.globalData.msgTimer);
    app.globalData.robotTimer = null;
    app.globalData.msgTimer = null;
    let sessionId = wx.getStorageSync('sessionId'),
        danLevel = options.danLevel,
        userInfo = {};
    userInfo.head = app.globalData.headImg;
    userInfo.nickName = app.globalData.nickName;
    userInfo.userId = app.globalData.userId
    this.setData({
      sessionId,
      userInfo,
      danLevel
    }, () => {
      this.tierRace();
    });
  },


  onUnload() {
    wx.closeSocket({
      code: 1001,
      reason: 'user exit'
    });
    clearInterval(app.globalData.robotTimer);
    clearInterval(app.globalData.msgTimer);
    app.globalData.robotTimer = null;
    app.globalData.msgTimer = null;
  },


  /**
   * 毫秒级倒计时
   */
  countDown() {
    var that = this,
      timer = this.data.timer,
      milliSecond = 1000,
      sessionId = this.data.sessionId,
      second = 10;
    clearInterval(timer);
    this.setData({
      startRotate: false,
      fadeIn: false,
      second
    }, () => {
      this.setData({
        fadeIn: true
      }, () => {
        setTimeout(() => {
          this.setData({
            startRotate: true,
            startChoose: true
          })
          timer = setInterval(() => {
            if (this.data.bothChoose) {
              clearInterval(timer);
              this.setData({
                timer: null,
              })
            }
            milliSecond = milliSecond - 200;
            if (milliSecond <= 0) {
              milliSecond = 1000;
              second = second - 1;
              if (second < 0) {
                second = 0;
                if (!this.data.myChoice) {
                  this.submitAnswer('e', true);
                }
                this.setData({
                  timer: null,
                  second
                })
                clearInterval(timer);
                return
              }
              this.setData({
                second
              })
            }
          }, 200);//每隔200毫秒执行一次
          this.setData({
            timer,
          })
        }, 1500)
      })
    })

  },

  /**
   *  匹配对战
   */
  tierRace() {
    let socketOpen = app.globalData.socketOpen,
      sessionId = this.data.sessionId,
      danLevel = this.data.danLevel,
      that = this;
    if (!socketOpen) {
      // 连接socket端口
      wx.connectSocket({
        url: 'wss://yo.huayou.me/api/mini/game/match',
        success (res) {
          app.globalData.socketOpen = true
        }
      });
    }

    // 连接成功
    wx.onSocketOpen((res) => {
      // 连接成功后进入房间
      this.enterRoom(res);
    });
    // 收到服务器返回信息
    wx.onSocketMessage(function (res) {
      let data = JSON.parse(res.data);
      var robotTime = app.globalData.robotTime;
      console.log('message', data);
      //gameStatus == 'ON_READY'： 已就绪
      if (data.command == 'ROOM_USER_CHANGE' && data.gameDTO.gameStatus == 'ON_READY') {
        if (!that.data.rivalInfo.nickName) {
          let playersArr = data.gameDTO.players;
          playersArr.forEach((e, i) => {
            if (e.minUserId != app.globalData.userId) {
              that.setData({
                rivalInfo: { nickName: e.nickname, userId: e.minUserId, head: e.headimgurl}
              });
            }
          })
        }
        clearInterval(app.globalData.robotTimer);
        clearInterval(app.globalData.msgTimer);
        app.globalData.robotTimer = null;
        app.globalData.msgTimer = null;
        if (that.data.currentPage != 3) {
          that.switch2Race(data);
        }
        if (data.gameDTO.players[0].currentAnswer) {
          // 如果返回了答案，那么代表是已经做过至少一题，首先显示结果
          that.showResult(data);
        } else {
          // 未返回答案，则是在大厅已准备好，直接请求题目
          that.startPractice();
        }
        // 一方已选择
      } else if (data.command == 'ROOM_USER_CHANGE' && data.gameDTO.gameStatus == 'ON_GOING') {
        //  如果为我的答案，就渲染，对手的答案，不渲染对错,只渲染进度条
        that.renderMyAnswer(data)
        // 服务端推送题目
      } else if (data.command == 'PUSH_QUESTION' && data.gameDTO.gameStatus == 'ON_GOING') {
        // 开始做题
        that.startChoose(data);
        // 服务端推送结束信息
      } else if (data.command == 'ROOM_USER_CHANGE' && data.gameDTO.gameStatus == 'FINISHED') {
        clearInterval(app.globalData.robotTimer);
        clearInterval(app.globalData.msgTimer);
        app.globalData.robotTimer = null;
        app.globalData.msgTimer = null;
        // 首先展示分数，然后结束对战
        setTimeout(() => {
          that.showResult(data, true);
        }, 1000)
      } else if (data.status == 500 ) {
        if ( data.msg == '房间已解散') {
          clearInterval(app.globalData.robotTimer);
          clearInterval(app.globalData.msgTimer);
          app.globalData.robotTimer = null;
          app.globalData.msgTimer = null;
          wx.closeSocket({
            code: 1002,
            reason: 'rival exit'
          });
        } else if ( data.msg.indexOf('非') == 0) {
          // 发送心跳包
          app.globalData.msgTimer = setInterval(() => {
            that.sendSocketMessage('{"command":"1"}');
          }, 10000)
          app.globalData.robotTimer = setInterval(() => {
            robotTime = robotTime - 5;
            if (robotTime <= 0) {
              that.sendSocketMessage('{"command":"USE_NPC", "sessionId": "' + sessionId + '", "danLevel": "' + danLevel + '"}');
              clearInterval(app.globalData.robotTimer);
              app.globalData.robotTimer = null;
            }
          }, 5000);
        }
      } 
    });
    // 连接关闭
    wx.onSocketClose((res) => {
      console.log(res);
      app.globalData.socketOpen = false;
      clearInterval(app.globalData.robotTimer);
      clearInterval(app.globalData.msgTimer);
      app.globalData.robotTimer = null;
      app.globalData.msgTimer = null;
    });
  },

  // 进入房间
  enterRoom(res) {
    console.log('连接成功', res);
    let sessionId = this.data.sessionId,
        danLevel = this.data.danLevel;
    this.sendSocketMessage('{"command":"INTO_ROOM","sessionId":"' + sessionId + '", "danLevel": "' + danLevel + '"}');
  
  },

  switch2Race(data) {
    this.setData({
      currentPage: 2
    }, () => {
      setTimeout(() => {
        this.setData({
          currentPage: 3
        })
      }, 2500);
    })
  },

  // 开始做题
  startPractice() {
    let sessionId = this.data.sessionId,
        socketOpen = app.globalData.socketOpen;
    this.sendSocketMessage('{"command": "START_GAME", "sessionId": "' + sessionId + '"}')
    
  },

  renderMyAnswer(data) {
    let playersArr = data.gameDTO.players;
    playersArr.forEach((e, i) => {
      if (e.currentAnswer) {
        if (e.minUserId == this.data.userInfo.userId && e.currentAnswer.answerOption != '-1') {
          let myChoice = e.currentAnswer.answerOption,
            myDelta = e.currentAnswer.score,
            myScore = e.score;
          if (myScore == this.data.myScore) {
            return;
          }
          this.addScore(myDelta, 'me');
          this.setData({
            myChoice,
            myScore,
            hasChoose: true
          })
        } else if (e.minUserId == this.data.rivalInfo.userId && e.currentAnswer.answerOption != '-1') {
          let rivalDelta = e.currentAnswer.score,
            rivalScore = e.score;
          this.addScore(rivalDelta, 'rival');
          this.setData({
            rivalScore
          })
        }
      }
    });
  },

  // 开始选择
  startChoose(data) {
    this.setData({
      myChoice: '',
      rivalChoice: '',
      hasChoose: false,
      bothChoose: false
    }, () => {
      // 渲染页面
      let quizData = data.gameDTO.currentQuestion.question,
        correctAnswer = data.gameDTO.currentQuestion.question.correct;
      this.setData({
        quizData,
        correctAnswer
      }, () => {
        // 启动定时
        if (this.data.firstFetch) {
          setTimeout(()=>{
            this.countDown();
          }, 1500);
          this.setData({
            firstFetch: false
          })
        } else {
          this.countDown();
        }
        
      })
    })
  },

  //显示本题结果
  showResult(data, flag) {
    console.log('showResult');
    let playersArr = data.gameDTO.players,
      rivalChoice = '',
      rivalScore = 0,
      rivalDelta = 0;
    if (flag) {
      console.log(data.gameDTO.winner);
      if (data.gameDTO.winner === this.data.userInfo.nickName) {
        this.setData({
          gameResult: 1
        })
      } else if (data.gameDTO.winner === this.data.rivalInfo.nickName) {
        this.setData({
          gameResult: 2
        })
      } else {
        this.setData({
          gameResult: 3
        })
      }
    }
    playersArr.forEach((e, i) => {
      if (flag) {
        if (e.minUserId == this.data.userInfo.userId) {
          this.setData({
            goldReward: e.goldReward,
            expReward: e.expReward
          }, () => {
            setTimeout(() => {
              this.setData({
                currentPage: 4
              })
            }, 1500);
          })
        }
      }
      if (e.minUserId == this.data.rivalInfo.userId) {
        console.log('calc rival')
        if (e.currentAnswer) {
          let rivalChoice = e.currentAnswer.answerOption == "-1" ? '' : e.currentAnswer.answerOption,
            rivalDelta = e.currentAnswer.score,
            rivalScore = e.score;
          if (rivalScore != this.data.rivalScore) {
            this.addScore(rivalDelta, 'rival');
          }
          this.setData({
            rivalChoice,
            rivalScore,
            bothChoose: true
          }, () => {
            setTimeout(() => {
              this.setData({
                fadeIn: false,
                startRotate: false,
              })
              // 请求题目
              this.startPractice();
            }, 1500)
          })
        }
      }
      else if (e.minUserId == this.data.userInfo.userId) {
        if (e.currentAnswer) {
          if (this.data.myScore != e.score) {
            let myDelta = e.currentAnswer.score;
            this.addScore(myDelta, 'me');
            this.setData({
              myScore: e.score
            })
          }
        }
      }
    })
    if (flag) {
      setTimeout(() => {
        this.endPractice();
      }, 5000);
    }

  },

  // 提交本题答案
  submitAnswer(e, overTimeFlag = false) {
    if (overTimeFlag) {
      let sessionId = this.data.sessionId;
      this.setData({
        startChoose: false,
        hasChoose: true,
        myChoice: '',
      })
      this.setData({
        myChoice: ''
      }, () => {
        this.sendSocketMessage('{ "command": "SUBMIT_ANSWER", "answer": "-1", "answerTime": "10000", "sessionId": "' + sessionId + '"}')
      });
      return
    }
    let startChoose = this.data.startChoose,
      answerTime = (10 - this.data.second) * 1000,
      option = e.currentTarget.dataset.option,
      sessionId = this.data.sessionId;
    if (!startChoose) {
      return
    }
    option = e.currentTarget.dataset.option;

    this.setData({
      startChoose: false,
      hasChoose: true,
      myChoice: option,
    })
    this.sendSocketMessage('{ "command": "SUBMIT_ANSWER", "answer": "' + option + '", "answerTime": "' + answerTime + '", "sessionId": "' + sessionId + '"}');
  },

  // 结束练习
  endPractice() {
    wx.closeSocket({
      code: '1000',
      reason: '比赛正常结束'
    });
  },

  /**
   * @author Hejus
   * @function 分数累加
   * @param delta: 每题所占份额
   * @return none
   */
  addScore(delta, target) {
    var deltaBottom = delta * 0.4;
    if (target == 'me') {
      var myBottom = this.data.myBottom + deltaBottom;
      if (myBottom > 0) {
        return
      }
      this.setData({
        myBottom: myBottom
      })
    } else if (target == 'rival') {
      var rivalBottom = this.data.rivalBottom + deltaBottom;
      if (rivalBottom > 0) {
        return
      }
      this.setData({
        rivalBottom: rivalBottom
      })
    }
  },

  // 发送socket指令
  sendSocketMessage(msg) {
    let socketOpen = app.globalData.socketOpen;
    console.log('send', socketOpen, msg);
    if (socketOpen) {
      wx.sendSocketMessage({
        data: msg
      })
    }
  },

  continueVersus() {
    app.globalData.socketOpen = false;
    wx.closeSocket({});
    wx.navigateBack({
      delta: -1
    });
  },

  goToLib() {
    wx.redirectTo({
      url: '/pages/testlibrary/list',
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(res) {
    var that = this
     if (res.from == 'button' && res.target.id == 'finishShare') {
      let myScore = this.data.myScore;
      wx.showShareMenu({
        withShareTicket: true
      });
      return {
        title: `我在成长赛中获得了${myScore}分,一起来玩吧！`,
        path: `/pages/index/index?target=tier`,
        imageUrl: `/images/share-poster.png`,
        success(res) {
          wx.showToast({
            title: '发送成功',
            icon: 'success'
          })
        }
      }
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