//#region 全域變數
const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const auth = require('./JSONHome/auth.json');
const prefix = require('./JSONHome/prefix.json');
const GetGas = require('./Script/GetGas.js');

//存放BaseExcelAPI資料
let BaseExcelData = false;

//#endregion

//#region 登入
client.login(auth.token);

client.on('ready', () => {
    GetGas.getBaseExcel(function(dataED) {
        if (dataED) {
            BaseExcelData = dataED //有資料
        }
        console.log(`🔊Logged in as ${client.user.tag}!`);
    })
});

//#endregion

//#region message事件入口
client.on('message', msg => {
    //前置判斷
    try {
        if (!msg.guild || !msg.member) return; //訊息內不存在guild元素 = 非群組消息(私聊)
        if (!msg.member.user) return; //幫bot值多拉一層，判斷上層物件是否存在
        if (msg.member.user.bot) return; //訊息內bot值為正 = 此消息為bot發送
    } catch (err) {
        return;
    }

    //字串分析
    try {
        let tempPrefix = '-1';
        const prefixED = Object.keys(prefix); //前綴符號定義
        prefixED.forEach(element => {
            if (msg.content.substring(0, prefix[element].Value.length) === prefix[element].Value) {
                tempPrefix = element;
            }
        });

        //實作
        switch (tempPrefix) {
            case '0': //文字回應功能
                BasicFunction(msg, tempPrefix);
                break;
            case '1': //音樂指令
                MusicFunction(msg);
                break;
            case '2': //音樂指令
                LinkFunction(msg);
                break;
            default:
                BaseExcelFunction(msg);
                break;
        }
    } catch (err) {
        console.log('🔊OnMessageError', err);
    }
});

//#endregion

//#region 基本指令系統
function BasicFunction(msg, tempPrefix) {
    const cmd = msg.content.substring(prefix[tempPrefix].Value.length).split(' '); //以空白分割前綴以後的字串
    switch (cmd[0]) {
        case 'help':
            const help = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('EM Bot')
                .setURL('https://discord.com/api/oauth2/authorize?client_id=868424334409097249&permissions=8&scope=bot')
                .setAuthor('By EM', 'https://i.imgur.com/gQOAnhS.jpg', 'https://emsbase.blogspot.com')
                .setDescription('A bot made for EM')
                .setThumbnail('https://i.imgur.com/UpozcmC.png')
                .addFields(
                    { name: 'Function', value: 'Do the thing I do not want to do' },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Regular', value: '.[command] [value]', inline: true },
                    { name: 'Link', value: '.to [command] [value]', inline: true },
                    { name: 'Music', value: '.m', inline: true },
                )
                .addField('Enter .[prefix] help to get full commands', 'More to discover', true)
                .setImage('https://i.imgur.com/UpozcmC.png')
                .setTimestamp()
                .setFooter('Have fun :P', 'https://i.imgur.com/UpozcmC.png');
            msg.channel.send(help);
            break;

        case 'right?':
            msg.reply('yeah');
            break;

        case 'path':
            msg.reply('yeah');
            break;

        case 'dice': 
            var max = msg.content.substring(6).split(' ');
            var ran = Math.floor(Math.random() * max);//亂數產生1~100
            ran+=1
            msg.reply(ran);
            break;
    }
}

//#endregion

//#region 連結系統
//Path

function LinkFunction(msg) {
    //將訊息內的前綴字截斷，後面的字是我們要的
    const content = msg.content.substring(prefix[1].Value.length);
    //指定我們的間隔符號
    const splitText = ' ';
    //用間隔符號隔開訊息 contents[0] = 指令,contents[1] = 參數
    const contents = content.split(splitText);

    switch (contents[0]) {
            //連結
        case 'google':
            sendLink('https://www.google.com/search?q=' , msg, contents);
            break;    
        case 'wiki':
            sendLink('https://zh.m.wikipedia.org/wiki/' , msg, contents);
            break;
        case 'learnet':
            sendLink('https://learnet.space/' , msg, contents);
            break;
        case 'meet':
            sendLink('https://meet.google.com/lookup/' , msg, contents);
            break;
        case 'github':
            sendLink('https://meet.google.com/lookup/' , msg, contents);
            break;
        case 'twitch':
            sendLink('https://twitch.tv/' , msg, contents);
            break;
        case 'jitsi':
            sendLink('https://meet.jit.si/' , msg, contents);
            break;
        case 'embase':
            sendLink('https://edit-mr.github.io/' , msg, contents);
            break;
            //幫助
        case 'help':
            const helpPlay = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Link')
                .setAuthor('By EM', 'https://i.imgur.com/wSTFkRM.png', 'https://emsbase.blogspot.com')
                .setDescription('The function of EM Bot')
                .setThumbnail('https://i.imgur.com/UpozcmC.png')
                .addFields(
                    { name: 'to use, please type -[web] [page]', value: 'EX:-google Discord' },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Github', value: 'Check out all support pages at github', inline: true },
                    { name: 'Contact', value: 'If you have any ideas, please contact Elvis Mao#7765', inline: true },
                )
                .addField('Now playing', '.p np', true)
                .addField('Music List', '.p queue/q', true)
                .addField('Disconnect', '.p disconnect/end', true)
                .addField('Inline field title', 'Some value here', true)
                .setImage('https://i.imgur.com/wSTFkRM.png')
                .setTimestamp()
                .setFooter('Contact Author', 'https://emsbase.blogspot.com/');

            msg.channel.send(msg, helpPlay);
            break;
        default:
            msg.channel.send('sorry, Idk what this is. Please contact Elvis Mao#7765');
            break;
            }
}

//Path
async function playMusic(msg, contents) {
    //定義我們的第一個參數必需是網址
    const urlED = contents[1];
    try {
        //第一個參數不是連結就要篩選掉
        if (urlED.substring(0, 4) !== 'http') return msg.reply('The link is not working.1');
            Path = urlED
    } catch (err) {
        console.log(err, '🔊playMusicError');
    }
}

//Link
async function sendLink(path, msg, contents) {
    const goto = contents[1];
    const messageLink = `${path}${goto}`;
    msg.channel.send(messageLink);
}

//#region 音樂系統
//歌曲控制器
let dispatcher;
//歌曲清單
let musicList = new Array();

function MusicFunction(msg) {
    //將訊息內的前綴字截斷，後面的字是我們要的
    const content = msg.content.substring(prefix[1].Value.length);
    //指定我們的間隔符號
    const splitText = ' ';
    //用間隔符號隔開訊息 contents[0] = 指令,contents[1] = 參數
    const contents = content.split(splitText);

    switch (contents[0]) {
        case 'play':
            //點歌&播放歌曲功能
            playMusic(msg, contents);
            break;
        case 'replay':
            //重播當前歌曲
            replayMusic();
            break;
        case 'np':
            //當前歌曲資訊
            nowPlayMusic(msg.channel.id);
            break;
        case 'queue':
            //歌曲清單
            queueShow(msg.channel.id);
            break;
        case 'skip':
            //中斷歌曲
            skipMusic();
            break;
        case 'disconnect':
            //退出語音頻道並且清空歌曲清單
            disconnectMusic(msg.guild.id, msg.channel.id);
            break;
        case 'help':
            //退出語音頻道並且清空歌曲清單
            const helpPlay = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Play Music')
                .setAuthor('By EM', 'https://i.imgur.com/wSTFkRM.png', 'https://emsbase.blogspot.com')
                .setDescription('The function of EM Bot')
                .setThumbnail('https://i.imgur.com/UpozcmC.png')
                .addFields(
                    { name: 'Remember', value: 'Join Voice Channel Before using command' },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Play Music', value: '.p play/p [url]', inline: true },
                    { name: 'Replay', value: '.p replay/rp', inline: true },
                )
                .addField('Now playing', '.p np', true)
                .addField('Music List', '.p queue/q', true)
                .addField('Disconnect', '.p disconnect/end', true)
                .addField('Inline field title', 'Some value here', true)
                .setImage('https://i.imgur.com/wSTFkRM.png')
                .setTimestamp()
                .setFooter('Contact Author', 'https://emsbase.blogspot.com/');

            msg.channel.send(helpPlay);
            break;
            }
}

//?play
async function playMusic(msg, contents) {
    //定義我們的第一個參數必需是網址
    const urlED = contents[1];
    try {
        //第一個參數不是連結就要篩選掉
        if (urlED.substring(0, 4) !== 'http') return msg.reply('The link is not working.1');

        //透過library判斷連結是否可運行
        const validate = await ytdl.validateURL(urlED);
        if (!validate) return msg.reply('The link is not working.2');

        //獲取歌曲資訊
        const info = await ytdl.getInfo(urlED);
        //判斷資訊是否正常
        if (info.videoDetails) {
            //指令下達者是否在語音頻道
            if (msg.member.voice.channel) {
                //判斷bot是否已經連到語音頻道 是:將歌曲加入歌單 不是:進入語音頻道並且播放歌曲
                if (!client.voice.connections.get(msg.guild.id)) {
                    //將歌曲加入歌單
                    musicList.push(urlED);
                    //進入語音頻道
                    msg.member.voice.channel.join()
                        .then(connection => {
                            msg.reply('Yo, here I am');
                            const guildID = msg.guild.id;
                            const channelID = msg.channel.id;
                            //播放歌曲
                            playMusic2(connection, guildID, channelID);
                        })
                        .catch(err => {
                            msg.reply('Fail joining voice channel, try again');
                            console.log(err, '🔊playMusicError2');
                        })
                } else {
                    //將歌曲加入歌單
                    musicList.push(urlED);
                    msg.reply('I have add this to list');
                }
            } else return msg.reply('Please join a voice channel first');
        } else return msg.reply('The link is not working.3');
    } catch (err) {
        console.log(err, '🔊playMusicError');
    }
}

//?play 遞迴函式
async function playMusic2(connection, guildID, channelID) {
    try {
        //播放前歌曲清單不能沒有網址
        if (musicList.length > 0) {
            //設定音樂相關參數
            const streamOptions = {
                seek: 0,
                volume: 0.5,
                Bitrate: 192000,
                Passes: 1,
                highWaterMark: 1
            };
            //讀取清單第一位網址
            const stream = await ytdl(musicList[0], {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 26214400 //25ms
            })

            //播放歌曲，並且存入dispatcher
            dispatcher = connection.play(stream, streamOptions);
            //監聽歌曲播放結束事件
            dispatcher.on("finish", finish => {
                //將清單中第一首歌清除
                if (musicList.length > 0) musicList.shift();
                //播放歌曲
                playMusic2(connection, guildID, channelID);
            })
        } else disconnectMusic(guildID, channelID); //清空歌單並且退出語音頻道
    } catch (err) {
        console.log(err, '🔊playMusic2Error');
    }
}

//?disconnect
function disconnectMusic(guildID, channelID) {
    try {
        //判斷bot是否在此群組的語音頻道
        if (client.voice.connections.get(guildID)) {
            //清空歌曲清單
            musicList = new Array();
            //退出語音頻道
            client.voice.connections.get(guildID).disconnect();

            client.channels.fetch(channelID).then(channel => channel.send('bye'));
        } else client.channels.fetch(channelID).then(channel => channel.send('ahh, I am not in yet'))
    } catch (err) {
        console.log(err, '🔊disconnectMusicError');
    }
}

//?replay
function replayMusic() {
    if (musicList.length > 0) {
        //把當前曲目再推一個到最前面
        musicList.unshift(musicList[0]);
        //將歌曲關閉，觸發finish事件
        //finish事件將清單第一首歌排出，然後繼續播放下一首
        if (dispatcher !== undefined) dispatcher.end();
    }
}

//?skip
function skipMusic() {
    //將歌曲關閉，觸發finish事件
    if (dispatcher !== undefined) dispatcher.end();
}

//?np
async function nowPlayMusic(channelID) {
    try {
        if (dispatcher !== undefined && musicList.length > 0) {
            //從連結中獲取歌曲資訊 標題 總長度等
            const info = await ytdl.getInfo(musicList[0]);
            //歌曲標題
            const title = info.videoDetails.title;
            //歌曲全長(s)
            const songLength = info.videoDetails.lengthSeconds;
            //當前播放時間(ms)
            const nowSongLength = Math.floor(dispatcher.streamTime / 1000);
            //串字串
            const message = `${title}\n${streamString(songLength,nowSongLength)}`;
            client.channels.fetch(channelID).then(channel => channel.send(message))
        }
    } catch (err) {
        console.log(err, '🔊nowPlayMusicError');
    }
}

//▬▬▬▬▬▬▬▬▬🔘▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
function streamString(songLength, nowSongLength) {
    let mainText = '🔘';
    const secondText = '▬';
    const whereMain = Math.floor((nowSongLength / songLength) * 100);
    let message = '';
    for (i = 1; i <= 30; i++) {
        if (i * 3.3 + 1 >= whereMain) {
            message = message + mainText;
            mainText = secondText;
        } else {
            message = message + secondText;
        }
    }
    return message;
}

//?queue
async function queueShow(channelID) {
    try {
        if (musicList.length > 0) {
            let info;
            let message = '';
            for (i = 0; i < musicList.length; i++) {
                //從連結中獲取歌曲資訊 標題 總長度等
                info = await ytdl.getInfo(musicList[i]);
                //歌曲標題
                title = info.videoDetails.title;
                //串字串
                message = message + `\n${i+1}. ${title}`;
            }
            //把最前面的\n拿掉
            message = message.substring(1, message.length);
            client.channels.fetch(channelID).then(channel => channel.send(message))
        }
    } catch (err) {
        console.log(err, '🔊queueShowError');
    }
}
//#endregion

//#region 對話資料庫系統
function BaseExcelFunction(msg) {
    const messageED = GetBaseExcelData(msg);
    if (messageED) msg.channel.send(messageED);
}

//#endregion

//#region 子類方法
//獲取頭像
function GetMyAvatar(msg) {
    try {
        return {
            files: [{
                attachment: msg.author.displayAvatarURL('png', true),
                name: 'avatar.jpg'
            }]
        };
    } catch (err) {
        console.log('🔊GetMyAvatar,Error');
    }
}

//BaseExcel字串比對
function GetBaseExcelData(msg) {
    try {
        if (BaseExcelData) {
            const userMessage = msg.content;

            e = BaseExcelData.filter(element => {
                return element.NAME === userMessage;
            })

            if (e) return e[0].VALUE;
            else return false;
        }
    } catch (err) {
        console.log('🔊GetBaseExcelDataError', err);
    }
}

//#endregion