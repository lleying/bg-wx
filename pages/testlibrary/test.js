// pages/testlibrary/test.js
const app = getApp()
const API = require('../../common/constant.js');
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sessionId: '',               //sessionId
    libId: 0,
    index: 0,
    second: 10,                  //倒数秒数， int， 固定为10
    timer: null,                 //倒数计时器， 默认为null
    startRotate: false,          //是否开始旋转倒计时进度条, bool, 默认为false
    fadeIn: false,               //是否渐入展示题目, bool, 默认为false
    myBottom: -560,              //我的分数进度条填充高度， int， 默认为-560
    delta: 0,                    //每题所占份额
    socketOpen: false,           //socket接口是否成功
    msgTimer: null,              //socket心跳包定时器
    option: '',                  //提交的选项 A B C D ''
    quizData: {},                //题目信息
    currentIndex: 0,             //当前做到第几题
    correctAnswer: '',           //正确答案
    myChoice: '',                //我的选择
    startChoose: false,          //是否可以点击选项
    hasChoose: false,            //是否已选择选项
    finishShow: false,           //是否显示做完题库弹窗
    firstFetch: true,            //是否是第一次获取进度
    optionsArr: ['A', 'B', 'C', 'D'], 

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
    console.log(options);
    let libId = options.libId,
    sessionId = wx.getStorageSync('sessionId'),
    userInfo = {};
    app.globalData.lastLibIndex = options.index;
    userInfo.head = app.globalData.headImg;
    userInfo.nickName = app.globalData.nickName;
    this.setData({
      sessionId,
      libId,
      userInfo
    });
    this.practice();
    // this.countDown();
  },


  /**
   * 监听页面卸载
   */
  onUnload: function () {
    let socketOpen = this.data.socketOpen;
    if (socketOpen) {
      wx.closeSocket({
        code: 1001,
        reason: 'shut down manually'
      })
      wx.showModal({
        title: '您中途退出了练习',
        content: '练习进度将被保存',
        showCancel: false,
        success (res) {
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }
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
            milliSecond = milliSecond - 200;
            if (milliSecond <= 0) {
              milliSecond = 1000;
              second = second - 1;
              if (second < 0) {
                second = 0;
                if (!this.data.myChoice) {
                  console.log(1);
                  this.submitAnswer('e', true);
                  clearInterval(timer);
                  setTimeout(() => {
                    this.setData({
                      timer: null,
                      fadeIn: false,
                      startRotate: false,
                      second
                    })
                  }, 1500)
                  // this.countDown();
                  return
                }
                console.log(2);
                this.setData({
                  timer: null,
                  fadeIn: false,
                  startRotate: false,
                  second
                })
                // this.countDown();
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
   *  题库练习
   */
  practice () {
    let socketOpen = this.data.socketOpen,
    sessionId = this.data.sessionId,
    that = this;
    // 连接socket端口
    wx.connectSocket({
      url: 'wss://yo.huayou.me/api/mini/game/practice',
    });
    // 连接成功
    wx.onSocketOpen((res)=>{
      // 连接成功后进入房间
      this.enterRoom(res);
    });
    // 收到服务器返回信息
    wx.onSocketMessage(function(res){
      let data = JSON.parse(res.data);
      console.log(data);
      //gameStatus == 'ON_READY'： 已就绪
      if (data.command == 'ROOM_USER_CHANGE' && data.gameDTO.gameStatus == 'ON_READY') {
        // 请求题目
        that.startPractice();
        // 服务端推送题目
      } else if (data.command == 'PUSH_QUESTION' && data.gameDTO.gameStatus == 'ON_GOING') {
        // 开始做题
        that.startChoose(data);
        // 服务端推送结束信息
      } else if (data.command == 'ROOM_USER_CHANGE' && data.gameDTO.gameStatus == 'FINISHED') {
        // 结束练习
        that.endPractice();
      }
    });
    // 连接关闭
    wx.onSocketClose((res) => {
      this.setData({
        socketOpen: false
      });
    });
  },
  // 发送socket指令
  sendSocketMessage(msg) {
    let socketOpen = this.data.socketOpen;
    console.log('send', msg);
    if (socketOpen) {
      wx.sendSocketMessage({
        data: msg
      })
    }
  },
  // 进入房间
  enterRoom (res) {
    let sessionId = this.data.sessionId,
    libId = this.data.libId,
    index = app.globalData.lastLibIndex;
    console.log('连接成功', res, this.data);
    this.setData({
      socketOpen: true
    }, () => {
      this.sendSocketMessage('{"command":"INTO_ROOM","sessionId":"' + sessionId + '","gameId":"' + libId + '", "curretQuestionIndex": "' + index + '"}');
    })
  },
  // 开始做题
  startPractice() {
    let sessionId = this.data.sessionId,
        socketOpen = this.data.socketOpen;
    if (socketOpen) {
      this.sendSocketMessage('{"command": "START_GAME", "sessionId": "' + sessionId + '"}')
    }
  },

  // 开始选择
  startChoose (data) {
    // 渲染页面
    let quizData = data.gameDTO.currentQuestion.question,
        currentIndex = data.gameDTO.curretQuestionIndex,
        index = app.globalData.lastLibIndex,
        questionCount = data.gameDTO.questionCount,
        correctAnswer = quizData.correct;
    if (!this.data.firstFetch) {
      this.addScore(delta)
    }
    if (this.data.firstFetch) {
      var delta = index / questionCount;
      this.setData({
        firstFetch: false,
        delta: 1 / questionCount
      })
      this.addScore(delta);
    }
    this.setData({
      quizData,
      currentIndex,
      correctAnswer,
    }, () => {
      // 启动定时
      this.countDown();
    })
  },

  // 提交本题答案
  submitAnswer (e, overTimeFlag=false) {
    if (overTimeFlag) {
      let sessionId = this.data.sessionId;
      this.setData({
        startChoose: false,
        hasChoose: true,
        myChoice: '',
      })
      setTimeout(() => {
        this.setData({
          hasChoose: false,
          myChoice: '',
          fadeIn: false,
        }, () => {
          this.sendSocketMessage('{ "command": "SUBMIT_ANSWER", "answer": "-1", "answerTime": "10000", "sessionId": "' + sessionId + '"}')
        })
      }, 2000);
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
    setTimeout(() => {
      this.setData({
        hasChoose: false,
        myChoice: '',
        fadeIn: false
      }, () => {
        this.sendSocketMessage('{ "command": "SUBMIT_ANSWER", "answer": "' + option + '", "answerTime": "' + answerTime + '", "sessionId": "' + sessionId + '"}')
      })
    }, 2000);
  },

  // 结束练习
  endPractice () {
    this.setData({
      finishShow: true
    }, () => {
      wx.closeSocket({
        code: '1000'
      })
    });

  },


  /**
   * @author Hejus
   * @function 分数累加
   * @param delta: 每题所占份额
   * @return none
   */
  addScore (delta) {
    let _delta = delta ? delta : this.data.delta,
      deltaBottom = _delta * 560,
        myBottom = this.data.myBottom + deltaBottom;
    if (myBottom > 0) {
      return
    }
    this.setData({
      myBottom: myBottom
    })
  },
   
  navigate2Page (e) {
    var page = e.currentTarget.dataset.src;
    if (page == 'tier') {
      wx.redirectTo({
        url: `/pages/index/index?target=tier`,
      });
    } else {
      wx.navigateBack({
        delta: 1
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