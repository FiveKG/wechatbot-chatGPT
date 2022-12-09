import { WechatyBuilder, ScanStatus, log } from "wechaty";
import qrTerminal from "qrcode-terminal";
import { getChatGPTReply } from "./chatgpt.js";

const nameList = ["指针","咸蛋超人（22年版）"]
//指针，猪肠
const roomList = ["Celestia Sui Arb","test"]


// 扫码
function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    // 在控制台显示二维码
    qrTerminal.generate(qrcode, { small: true });
    const qrcodeImageUrl = [
      "https://api.qrserver.com/v1/create-qr-code/?data=",
      encodeURIComponent(qrcode),
    ].join("");
    console.log("onScan:", qrcodeImageUrl, ScanStatus[status], status);
  } else {
    log.info("onScan: %s(%s)", ScanStatus[status], status);
  }
}

// 登录
function onLogin(user) {
  console.log(`${user} has logged in`);
  const date = new Date();
  console.log(`Current time:${date}`);
  console.log(`Automatic robot chat mode has been activated`);
}

// 登出
function onLogout(user) {
  console.log(`${user} has logged out`);
}

// 收到好友请求
async function onFriendShip(friendship) {
//   const frienddShipRe = /chatgpt|chat/;
//   if (friendship.type() === 2) {
//     if (frienddShipRe.test(friendship.hello())) {
//       await friendship.accept();
//     }
//   }
}


// 收到消息
async function onMessage(msg) {
    const contact = msg.talker(); // 发消息人
    const receiver = msg.to(); // 消息接收人
    const content = msg.text(); // 消息内容
    const room = msg.room(); // 是否是群消息
    //   const alias = (await contact.alias()) || (await contact.name()); // 发消息人昵称
    let roomTopic;
    const contactName= await contact.name();
    if (contactName === "rock stone") {
        console.log("🚀🚀🚀 / reply", content);
        return
    }
    if (room) {
        roomTopic = await room.topic();
    }
    const isText = msg.type() === bot.Message.Type.Text; // 消息类型是否为文本
    // TODO 你们可以根据自己的需求修改这里的逻辑，测试记得加限制，我这边消息太多了，这里只处理指定的人的消息
    try {
        switch (true) {
            case roomTopic && roomList.includes(roomTopic) && content.slice(0, 11) === "@rock stone":{//白名单群
                console.log(`白名单群:roomTopic->${roomTopic}`)
                console.log("🚀🚀🚀 / content", content.slice(12));
                let  reply = await getChatGPTReply(content.slice(12));
                await room.say(reply)
                break;
            }
            case roomTopic && !roomList.includes(roomTopic) && nameList.includes(contactName) && content.slice(0, 11) === "@rock stone":{//非白名单群，个人白名单
                console.log(`非白名单群，个人白名单:roomTopic->${roomTopic}, contactName->${contactName}`)
                console.log("🚀🚀🚀 / content", content.slice(12));
                let  reply = await getChatGPTReply(content.slice(12));
                await room.say(reply)
                break;
            }
            case !roomTopic && nameList.includes(contactName) && isText:{ //个人白名单
                console.log(`个人白名单:contactName->${contactName}`)
                console.log("🚀🚀🚀 / content", content);
                let reply = await getChatGPTReply(content);
                await contact.say(reply);
                break;
            }
            case !roomTopic && nameList.includes(contactName) && !isText:{
                console.log("🚀🚀🚀 / content", content);
                await contact.say("只支持文本消息");
                break;
            }
            default:{
                break;
            }
        }
    return
    } catch (error) {
        console.error(error);
    }
}

// 初始化机器人
const bot = WechatyBuilder.build({
  name: "WechatEveryDay",
  puppet: "wechaty-puppet-wechat", // 如果有token，记得更换对应的puppet
  puppetOptions: {
    uos: true,
  },
});

// 扫码
bot.on("scan", onScan);
// 登录
bot.on("login", onLogin);
// 登出
bot.on("logout", onLogout);
// 收到消息
bot.on("message", onMessage);
// 添加好友
bot.on("friendship", onFriendShip);

// 启动微信机器人
bot
  .start()
  .then(() => console.log("Start to log in wechat..."))
  .catch((e) => console.error(e));

