// const host = 'https://answer.icebartech.com';
const host = 'https://intest.icebartech.com';
//const host = 'https://yo.huayou.me';
const api = `${host}/api/mini/`;
module.exports = {
  WX: {                                               //用户信息相关
    SAVE: api + 'user/saveMiniUserInfo',              //保存用户信息
    LOGIN: api + 'user/weixin_login1',              //授权登录
    LOGIN2: api + 'user/weixin_login2',              //授权登录2
    FINDUSERINFO: api +'user/findUserInfo',           //查询用户信息
    FINDBAG: api +'user/findBackpack',                //查询用户背包信息
    FINDSHOP: api +'user/findGameTool',               //查询商城信息
    FINDMOBILE: api + 'user/findMobile',              //获取用户绑定手机号
    FINDADDRESS: api + 'user/findAddress',            //获取用户收货地址
    ADDADDRESS: api + 'user/addAddress',              //保存用户收货地址
    DELADDRESS: api + 'user/delAddress',              //删除用户收货地址
    FINDMOBILE: api + 'user/findMobile',              //小程序获取用户绑定的手机号
    FINDMOBILECODE: api + 'user/findMobileCode',      //小程序获取手机验证码
    UPDATEMOBILE: api + 'user/updateMobile',          //小程序修改绑定手机号码
    UPDATEREWARD: api + 'user/updateReward',          //小程序领取奖励
    FINDREFIONS:api + 'user/findRegions',             //获取地区列表
    FINDREWARD: api + 'user/findReward',              //获取奖励信息

    // 获取消息列表 及 详情
    FINDMESSAGELISTBYPAGE: api +'message/findPage',   // 获取消息列表
    FINDMESSAGEdETAIL: api +'message/findDetail',     // 获取消息详情
  },
  GAME: {
    FINDRULE: api + 'sysvar/find_rule',                //获取对战规则
    FINDPAGE: api + 'item/find_page',         //获取题库列表
    FINDfake: api + 'sysvar/find_enable_fake',           //获取开启三九内经（0-关闭 1-开启）
    FINDtrue: api + 'sysvar/find_enable_true',           //获取开启答题竞赛（0-关闭 1-开启)
  },
  // 英雄榜
  Ranking:{
    RankingList: api + 'user/find_page'           //获取英雄榜
  },
  // 留言
  Message: {
    AddMseeage: api + 'feedback/insert',         //添加留言
    ListMseeage: api + 'feedback/find_page'           //留言列表
  },
  
}