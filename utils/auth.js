var util = require('util.js');
var wxApi = require('wxApi.js')
var wxRequest = require('wxRequest.js')
var Api = require('api.js');
var app = getApp();

const Auth = {}

Auth.checkSession = function(appPage, flag) {
  let openid = wx.getStorageSync('openid');
  if (!openid) {
    if ('isLoginNow' == flag) {
      var userInfo = {
        avatarUrl: "../../images/gravatar.png",
        nickName: "登录",
        isLogin: false
      }
      appPage.setData({
        isLoginPopup: true,
        userInfo: userInfo
      });
    }
  }
}
Auth.checkLogin = function(appPage) {
  let wxLoginInfo = wx.getStorageSync('wxLoginInfo');
  wx.checkSession({
    success: function() {
      if (!wxLoginInfo.js_code) {
        Auth.wxLogin().then(res => {
          appPage.setData({
            wxLoginInfo: res
          });
          wx.setStorageSync('wxLoginInfo', res);
          console.log('checkSession_success_wxLogins');
        })
      }
    },
    fail: function() {
      Auth.wxLogin().then(res => {
        appPage.setData({
          wxLoginInfo: res
        });
        wx.setStorageSync('wxLoginInfo', res);
        console.log('checkSession_fail_wxLoginfo');
      })
    }
  })
}
Auth.checkAgreeGetUser = function(e, app, appPage, authFlag) {
  let wxLoginInfo = wx.getStorageSync('wxLoginInfo');
  wxLoginInfo.actUserId = wx.getStorageSync('shareUserId');
  if (wxLoginInfo.js_code) {
    Auth.agreeGetUser(e, wxLoginInfo, authFlag).then(res => {
      if (res.errcode == "") {
        wx.setStorageSync('userInfo', res.userInfo);
        wx.setStorageSync('openid', res.openid);
        appPage.setData({
          openid: res.openid
        });
        appPage.setData({
          userInfo: res.userInfo
        });
      } else {
        var userInfo = {
          avatarUrl: "../../images/gravatar.png",
          nickName: "点击登录",
          isLogin: false
        }
        appPage.setData({
          userInfo: userInfo
        });
        console.log("用户拒绝了授权");
      }
      appPage.setData({
        isLoginPopup: false
      });
    })
  } else {
    console.log("登录失败");
    wx.showToast({
      title: '登录失败',
      mask: false,
      duration: 1000
    });
  }
}

Auth.checkAgreeGetUserPromise = function (e, app, appPage, authFlag) {
  let wxLoginInfo = wx.getStorageSync('wxLoginInfo');
  wxLoginInfo.actUserId = wx.getStorageSync('shareUserId');
  if (wxLoginInfo.js_code) {
    Auth.agreeGetUser(e, wxLoginInfo, authFlag).then(res => {
      if (res.errcode == "") {
        wx.setStorageSync('userInfo', res.userInfo);
        wx.setStorageSync('openid', res.openid);
        appPage.setData({
          openid: res.openid
        });
        appPage.setData({
          userInfo: res.userInfo
        });
        appPage.refreshUserInfo(res.openid);
      } else {
        var userInfo = {
          avatarUrl: "../../images/gravatar.png",
          nickName: "点击登录",
          isLogin: false
        }
        appPage.setData({
          userInfo: userInfo
        });
        console.log("用户拒绝了授权");
      }
      appPage.setData({
        isLoginPopup: false
      });
    })
  } else {
    console.log("登录失败");
    wx.showToast({
      title: '登录失败',
      mask: false,
      duration: 1000
    });
  }
}

Auth.checkAgreeGetTopicPromise = function (e, app, appPage, authFlag) {
  let wxLoginInfo = wx.getStorageSync('wxLoginInfo');
  wxLoginInfo.actUserId = wx.getStorageSync('shareUserId');
  if (wxLoginInfo.js_code) {
    Auth.agreeGetUser(e, wxLoginInfo, authFlag).then(res => {
      if (res.errcode == "") {
        wx.setStorageSync('userInfo', res.userInfo);
        wx.setStorageSync('openid', res.openid);
        appPage.setData({
          openid: res.openid
        });
        appPage.setData({
          userInfo: res.userInfo
        });
        appPage.fetchCategoriesData();
      } else {
        var userInfo = {
          avatarUrl: "../../images/gravatar.png",
          nickName: "点击登录",
          isLogin: false
        }
        appPage.setData({
          userInfo: userInfo
        });
        console.log("用户拒绝了授权");
      }
      appPage.setData({
        isLoginPopup: false
      });
    })
  } else {
    console.log("登录失败");
    wx.showToast({
      title: '登录失败',
      mask: false,
      duration: 1000
    });
  }
}

Auth.agreeGetUser = function(e, wxLoginInfo, authFlag) {
  return new Promise(function(resolve, reject) {
    let args = {};
    let data = {};
    args.jsCode = wxLoginInfo.js_code;
    if (authFlag == '0' && e.detail.errMsg == 'getUserInfo:fail auth deny') {
      args.errcode = e.detail.errMsg;
      args.userInfo = {
        isLogin: false
      }
      args.userSession = "";
      resolve(args);
      return;
    }
    var userInfoDetail = {};
    if (authFlag == '0') //未授权过,通过按钮授权
    {
      userInfoDetail = e.detail;
    } else if (authFlag == '1') //已经授权过，直接通过wx.getUserInfo获取
    {
      userInfoDetail = e;
    }
    if (userInfoDetail && userInfoDetail.userInfo) {
      let userInfo = userInfoDetail.userInfo;
      userInfo.isLogin = true;
      args.avatarUrl = userInfo.avatarUrl;
      args.nickname = userInfo.nickName;
      args.actOpenId = wxLoginInfo.actUserId;
      data.userInfo = userInfo;
      // 微信登录请求地址
      var url = app.globalData.URL + "/minimal/selectJscode2session";
      var postOpenidRequest = wxRequest.postRequest(url, args);
      //获取openid
      postOpenidRequest.then(response => {
        if (response.data.status == '200') {
          console.log(response.data.openid)
          console.log("授权登录获取成功");
          data.openid = response.data.openid;
          data.errcode = "";
          resolve(data);
        } else {
          console.log(response);
          reject(response);
        }
      }).catch(function(error) {
        console.log('error: ' + error);
        reject(error);
      })
    } else {
      args.errcode = "error";
      args.userInfo = {
        isLogin: false
      };
      args.userSession = "";
      resolve(args);
    }
  })
}
Auth.setUserInfoData = function(appPage) {
  if (!appPage.data.openid) {
    appPage.setData({
      userInfo: wx.getStorageSync('userInfo'),
      openid: wx.getStorageSync('openid')
    })
  }
}
Auth.wxLogin = function() {
  return new Promise(function(resolve, reject) {
    wx.login({
      success: function(res) {
        let args = {};
        args.js_code = res.code;
        resolve(args);
      },
      fail: function(err) {
        console.log(err);
        reject(err);
      }
    });
  })

}

module.exports = Auth;