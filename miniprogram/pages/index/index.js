//index.js
import TIM from 'tim-wx-sdk';
import GenerateTestUserSig from './GenerateTestUserSig'
const app = getApp()
const promisify = require('./promisify')
let tim, usersig,userid='456'
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    inputVal:''
  },

  onLoad: function() {
    let options = {
      SDKAppID: 1400302408 // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
    };
    tim = TIM.create(options); 
    tim.setLogLevel(0);
  this.productUsSig()
    this.initEvents()
    this.login()
  },
  productUsSig() {
    usersig = GenerateTestUserSig.genTestUserSig(userid)
  },
  async login() {
    let logInfo = await tim.login({ userID: userid, userSig: usersig.userSig });
    console.log('login result', logInfo)
  },
  initEvents(){
    let onSdkReady = function (event) {
      wx.showToast({
        title: 'sdk ready'
      })
      // let message = tim.createTextMessage({ to: 'user1', conversationType: 'C2C', payload: { text: 'Hello world!' } });
      // tim.sendMessage(message);
    };
    tim.on(TIM.EVENT.SDK_READY, onSdkReady);
    let onSdkNotReady = function (event) {
      // 如果想使用发送消息等功能，接入侧需驱动 SDK 进入 ready 状态，重新调用 login 接口即可，如下所示：
      // tim.login({userID: 'your userID', userSig: 'your userSig'});
    };
    tim.on(TIM.EVENT.SDK_NOT_READY, onSdkNotReady);
    let onMessageReceived = function (event) {
      // event.data - 存储 Message 对象的数组 - [Message]
      console.log('登录后接收到的缓存数据',event)
    };
    tim.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);
    let onMessageRevoked = function (event) {
      // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isRevoked 属性值为 true
    };
    tim.on(TIM.EVENT.MESSAGE_REVOKED, onMessageRevoked);
    let onConversationListUpdated = function (event) {
      console.log('on conversation lists update:',event.data); // 包含 Conversation 实例的数组
    };
    tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, onConversationListUpdated);
    let onGroupListUpdated = function (event) {
      console.log('群组列表更新:',event.data);// 包含 Group 实例的数组
    };
    tim.on(TIM.EVENT.GROUP_LIST_UPDATED, onGroupListUpdated);
    let onGroupSystemNoticeReceived = function (event) {
      const type = event.data.type; // 群系统通知的类型，详见 群系统通知类型常量及含义
      const message = event.data.message; // 群系统通知的消息实例，详见 Message
      console.log(message.payload); // 消息内容. 群系统通知 payload 结构描述
    };
    tim.on(TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED, onGroupSystemNoticeReceived);
    let onProfileUpdated = function (event) {
      console.log(event.data); // 包含 Profile 对象的数组
    };
  },
  packageMessage(msg){
    return [{
      "alias": "user1",
      "role": "2",
      "timestamp": "1572518618080_17",
      "userid": userid,
      "product": "120",
      "data":
      {
        "type": "text",
        "data": msg
      }
    }
    ]
  },
  inputvalue(e){
    this.setData({
      inputVal:e.detail.value
    })
  },
 async sendTo(){
    // 发送文本消息，Web 端与小程序端相同
    // 1. 创建消息实例，接口返回的实例可以上屏
    let self=this
   let packageMsg = JSON.stringify(self.packageMessage(self.data.inputVal)) 
   let message = tim.createCustomMessage({
      to: '100000',
      conversationType: TIM.TYPES.CONV_GROUP,
      payload: {
        data:packageMsg
      }
    });
    // 2. 发送消息
    let sendResult =await tim.sendMessage(message);
    console.log('sendmessage result',sendResult)
  },
  async joinGroup(){
    let groupInfo = await tim.joinGroup({ groupID: '100000', type: TIM.TYPES.GRP_PUBLIC });
    console.log('join group success',groupInfo)
  },
  async createGroup(){
    // 创建私有群
    let promise =await tim.createGroup({
      groupID:'100000',
      type: TIM.TYPES.GRP_PUBLIC,
      joinOption: TIM.TYPES.JOIN_OPTIONS_FREE_ACCESS,
      name: 'youyou',
      // memberList: [{ userID: 'user1' }, { userID: 'user2' }] // 如果填写了 memberList，则必须填写 userID
    });
    console.log('创建群的消息',promise)
    // promise.then(function (imResponse) { // 创建成功
    //   console.log(imResponse.data.group); // 创建的群的资料
    // }).catch(function (imError) {
    //   console.warn('createGroup error:', imError); // 创建群组失败的相关信息
    // });
  },
 async watchchatLists(){
   let chatLists = await tim.getMessageList({ conversationID: "GROUP100000", count: 10 });
    console.log('chatLists',chatLists)
  }

})
