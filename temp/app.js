//app.js
var MD5Util = require('utils/MD5.js');
App({
  data: {
    APPID: '',
    SECRET: '',
  },

  //项目全局变量
  globalData: {
    userInfo: null,
    deviceInfo: { windowWidth: '375px' },
    code: '',
    // 登录信息
    DS_URL: '',                    // 请求接口地址

    // 用户信息
    CustomName: '未登录',
    // UserName: '',
    // LoginKey: '',
    // IsBindWeiXin: false,
    Sex: '',
    avatarUrl: '',
    UserKey: '',
    IsWX: true,
    openid: '',
    UnionID: '',


    //接口路由
    apiUrlRoute: {
      // 首页接口路由
        INDEX: 'Index'                             // 

  },

  /*
   * 自定义网络请求函数（返回参数有UserKey）
   */
  dsWxRequestUserKey: function (apiUrl, requestPram, doSuccess, doFailed, requestType = 'GET', requestDataType = 'json') {
    //------ 开始网络请求 ------
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    var that = this
    wx.request({  
      url: that.globalData.DS_URL + apiUrl,   // 请求接口地址  
      data: requestPram,                      // 请求参数  
      method: requestType,                    // 请求方式     
      dataType: requestDataType,              // 数据类型

      // 请求成功回调函数
      success: function (res) {
        // 加载完成关闭加载框
        setTimeout(function () {
          wx.hideLoading()
        }, 0)

        if (res.statusCode == "200") {
          that.globalData.UserKey = res.data.UserKey;
          if (typeof doSuccess == "function") {
            doSuccess(res.data)
          }
        }else {
          wx.showToast({
            title: '网络异常，请重试',
            success: function () {

            }
          })
        }
      },fail: function (res) {

        if (typeof doFailed == "function") {
          doFailed(res)
        }
      }

    })
  },

  /*
   * 自定义网络请求函数（返回参数没有UserKey）
   */
  dsWxRequestNoUserKey: function (apiUrl, requestPram, doSuccess, doFailed, requestType = 'GET', requestDataType = 'json') {
    //------ 开始网络请求 ------
    var that = this
    wx.request({
      url: that.globalData.DS_URL + apiUrl,   // 请求接口地址  
      data: requestPram,                      // 请求参数  
      method: requestType,                    // 请求方式     
      dataType: requestDataType,              // 数据类型

      // 请求成功回调函数
      success: function (res) {
        if (res.statusCode == "200") {
          if (typeof doSuccess == "function") {
            doSuccess(res.data)
          }
        }else {
          wx.showToast({
            title: '网络异常，请重试',
          })
        }
      },fail: function (res) {
        if (typeof doFailed == "function") {
          doFailed(res)
        }
      }

    })
  },

  // 请求微信支付函数  
  dsWxRequestWeChatPay: function (timeStamp, packages, paySign, signType = 'MD5', nonceStr) {
    //------ 开始网络请求 ------
    wx.requestPayment(
      {
        "timeStamp": timeStamp,
        "package": packages,
        "paySign": paySign,
        "signType": "MD5",
        "nonceStr": nonceStr
        , 'success': function (res) { console.log('支付成功') }
        , 'fail': function (res) { console.log(res) },
      })
  },

  //------ 获取APPID和Secret ------
  getAPPID: function () {
    var that = this;
    // 接口名称
    var RequestInfo = {
      DeviceTypeID: '3'
    };
    // 接口名称
    var apiUrl = that.globalData.apiUrlRoute.GET_WECHAT_APPID_AND_SECRET;
    // 调用封装的网络请求函数
    that.dsWxRequestUserKey(apiUrl, RequestInfo, function (resData) {
      if (resData.IsSure) {
        that.setData({
          APPID: resData.WeChatAPPID,
          SECRET: resData.WeChatSecret,
        })
        // 加载完成关闭加载框
        setTimeout(function () {
          wx.hideLoading();
        }, 1000)
      }
    },
      function (resData) { });
  },

  onLaunch: function (options) {
    this.getAPPID();
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },

})
