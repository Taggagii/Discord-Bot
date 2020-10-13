const Discord = require('discord.js');
const Canvas = require('canvas');
const client = new Discord.Client();

const ytdl = require('ytdl-core');
const yts = require('yt-search');
const { getInfo } = require('ytdl-core');


require("dotenv").config();
const PREFIX = ".";

const commands = { //command name, passable arguments, discription, minimum permission requirement
    "commands" : {
        ARGS : "",
        DISCRIPTION : "displays a list of the commands that the user has access to",
        MINPERMISSIONS : 0
    },
    "permissions" : {   
        ARGS : "", 
        DISCRIPTION : "displays the permissions level the user has", 
        MINPERMISSIONS : 0
    },
    "shutdown" : {
        ARGS : "", 
        DISCRIPTION : "shuts the bot off", 
        MINPERMISSIONS : 4
    },
    "user" : {
        ARGS : 'blank, (args = {“username”, “discriminator”, “id”})', 
        DISCRIPTION : "displays the message author's user information. Include the arguments: username, discriminator, and/or id to get such information", 
        MINPERMISSIONS : 1
    },
    "kick" : {
        ARGS : "args = {@username/nickname}", 
        DISCRIPTION : "kicks the mentioned user", 
        MINPERMISSIONS : 3
    },
    "ban" : {
        ARGS : "args = {@username/nickname}", 
        DISCRIPTION : "bans the mentioned user", 
        MINPERMISSIONS : 4
    },
    "display" : {
        ARGS : "blank, (args = {@username})", 
        DISCRIPTION : "displays the profile picture, displayname, and usernmae of the given user", //TBC
        MINPERMISSIONS : 2
    },
    "deletePastMessages" : {
        ARGS : "args = number of messages to delete", //maybe add user
        DISCRIPTION : "deletes messages back (to a max of 100) from the message command based on the input argument. The given command is included in the deletion count",
        MINPERMISSIONS : 4
    },
    "tic" : {
        ARGS : "(args = {@username, 'games'})",
        DISCRIPTION : "plays tick tac toe with the chosen user and displays the current games when the 'game' argument is entered",
        MINPERMISSIONS : 2
    },
    "music" : {
        ARGS : "(args = {play {song name, song url}, search {song name}}, queue, pause, resume)",
        DISCRIPTION : "runs the music commands for this bot. Enter the music command followed by a given argument (e.g: play, search) to either play the audio of a video (song) off YouTube, or search to get the url the bot thinks you're asking for and make sure you have the correct name",
        MINPERMISSIONS : 2
    }
}
const commandList = Object.keys(commands);


//music data 
let vol = 5;
let queue = [];
let playing = false;
let dispatcher = '';



//tictactoe data
var games = {};
var boardMessage = '';

async function draw_board(gameData, message)
{
    let outputBoard = `${gameData.slice(0, 3).join('   ')}\n${gameData.slice(3, 6).join('   ')}\n${gameData.slice(6, 9).join('   ')}`;
    var boardMessage = await message.channel.send(outputBoard);
}

function check_win(gameValues, symbol, message)
{
    let gameData = gameValues[0];
    for (var start = 0; start < 3; start++)//checking straights
    {
        if (gameData[start] === symbol && gameData[start + 3] === symbol && gameData[start + 6] === symbol) 
        {
            message.channel.send(`${symbol} has won with a vertical line starting at ${start}`);
            return true;
        }
        
        if (gameData[start * 3] === symbol && gameData[start * 3 + 1] === symbol && gameData[start * 3 + 2] === symbol)
        {
            message.channel.send(`${symbol} has won with a horizontal line starting at ${start * 3}`);
            return true;
        }
    }
    if (gameData[0] === symbol && gameData[4] === symbol && gameData[8] === symbol) //checking two diagonals 
    {
        message.channel.send(`${symbol} has won with a diagonal starting at 0`);
        return true;
    }
    if (gameData[2] === symbol && gameData[4] === symbol && gameData[6] === symbol)
    {
        message.channel.send(`${symbol} has won with a diagonal starting at 2`);
        return true;
    }
    if (!gameData.includes('-')) //checking for full board
    {
        message.channel.send(`The game ends in a tie. Neither player wins`);
        return true;
    }
    return false; //returning false is the game is not over yet

}









const OwnerId = "671090972272230423";

/*
Higher levels have the permissions of all precursory levels
level 0 (no level)           : User can interact with the bot enough to understand that they can't interact with the bot
level 1 (basic level)        : User can perform basic interaction with the bot to get information about themselves and the server, most fun commands are open to basic members
level 2 (intermediate level) : User can do everything fun (for those who aren't sadistic that is)
level 3 (advanced level)     : Users may kick other members 
level 4 (dangerous level)    : Users may ban other members, disconnect members from voice chat
*/
const PermissionsLevel = ["764512693008597052", "764512690566856724", "764512687040233512", "763588921346752513"]; //lowest to highest

function getPermissionsLevel(message)
{
    for (var permissions = PermissionsLevel.length; permissions > 0; permissions--)
    {
        if (message.member.roles.cache.get(PermissionsLevel[permissions]))
        {
            return permissions + 1;
        }
    }
    return 0;
}

function containsAnyOfWord(list, word)
{
    for (var i = 1; i < word.length + 1; i++)
    {
        if (list.includes(word.substring(0, i)))
            return true;
    }
    return false;
}

function containsAny(firstList, secondList)
{
    for (var index = 0; index < secondList.length; index++)
    {
        if (firstList.includes(secondList[index]))
            return true;
    }
    return false;
}


client.on("ready", () => {
    console.log(`${client.user.username} has logged in`);
});

client.on("message", async message => {
    if (message.author.bot)
    {
        return;
    }
    
    if (message.content.startsWith(PREFIX))
    {
        const [command_name, ...args] = message.content //... is the spreader operator and takes in ALL other values
        .trim()
        .substring(PREFIX.length)
        .split(/\s+/);
        
        var membersPermissions = getPermissionsLevel(message);
        let memberHasAccessTo = (command) => {
            if (membersPermissions >= commands[command].MINPERMISSIONS)
                return true;
                message.channel.send(`You do not have high enough permissions to access "${PREFIX}${command}".\nType "${PREFIX}commands" to see commands you have permissions to access.`)
            return false;
        }
        
        switch(command_name)
        {
            case commandList[0]: //commands
                if (memberHasAccessTo(commandList[0]))
                {
                    var outputString = "";
                    Object.keys(commands).forEach(command => {
                        if (membersPermissions >= commands[command].MINPERMISSIONS)
                            outputString += `.${command} | ${commands[command].ARGS} |\n${commands[command].DISCRIPTION}\n\n`
                    });
                    message.channel.send(outputString);
                }
                break;

            case commandList[1]: //permissions
                if (memberHasAccessTo(commandList[1]))
                {
                    if (!membersPermissions)
                        message.channel.send("You do not have a permisions level");
                    else
                        message.channel.send(`You have Level ${membersPermissions} access to this bot`);
                }
                break;

            case commandList[2]: //shutdown
                if (memberHasAccessTo(commandList[2]))
                {
                    if (message.author.id === OwnerId)
                    {
                        message.channel.send("You are authorized. Shutting Down").then(m => {client.destroy();}).then(() => {throw new "SHUTDOWN COMMAND CALLED";});
                    }
                    else
                        message.channel.send("Special permissions are required for this command.")
                }
                break;

            case commandList[3]: //user
                if (memberHasAccessTo(commandList[3]))
                {
                    var outputString = "";
                    if (args.length === 0)
                    {
                        message.reply(`Your username is : ${message.author.username}\nYour discriminator is : ${message.author.discriminator}\nYour id is : ${message.author.id}`);
                        break;
                    }
                    if (args.includes("username"))
                        outputString += `Your username is : ${message.author.username}\n`;
                    if (containsAnyOfWord(args, "discriminator"))
                        outputString += `Your discriminator is : ${message.author.discriminator}\n`;
                    if (args.includes("id"))
                        outputString += `Your id is : ${message.author.id}`;
                    message.reply(outputString);
                }
                break;

            case commandList[4]: //kick
                if (memberHasAccessTo(commandList[4]))
                {
                    if (args.length === 0) return message.reply("A user ID must be provided for this command");
                    var member = message.guild.member(message.mentions.users.first());
                    if (member)
                    {
                        if (message.member.hasPermission("KICK_MEMBERS"))
                        {
                            member.kick()
                            .then((member) => message.channel.send(`${member} was kicked`))
                            .catch((err) => message.channel.send("Bot does not have permissions to kick this member"));
                        }
                        else
                        {
                            message.channel.send("You do not have permissions to kick this member");
                        }
                    }
                    else
                    {
                        message.channel.send("The mentioned user does not exist");
                    }
                }
                break;

            case commandList[5]: //ban
                if (memberHasAccessTo(commandList[5]))
                {
                    if (args.length === 0) return message.reply("A user ID must be provided for this command");
                    var member = message.guild.member(message.mentions.users.first());
                    if (member)
                    {
                        if (message.member.hasPermission("BAN_MEMBERS"))
                        {
                            member.ban()
                            .then((member) => message.channel.send(`${member} was banned`))
                            .catch((err) => message.channel.send("Bot does not have permissions to ban this member"));
                        }
                        else
                        {
                            message.channel.send("You do not have permissions to ban this member");
                        }
                    }
                    else
                    {
                        message.channel.send("The mentioned user does not exist");
                    }
                    
                }
                break;
            
            case commandList[6]: //display
                if (memberHasAccessTo(commandList[6]))
                {
                    if (args.length === 0)
                    {
                        displayedName = message.member.displayName;
                        var displayedUsername = message.author.username;
                        var displayedAvatar = message.member.user.displayAvatarURL({format : 'jpg'});
                    }
                    else
                    {
                        let mentionedMember = message.mentions.users.first();
                        var displayedName = message.mentions.members.first().displayName;
                        var displayedUsername = mentionedMember.username;
                        var displayedAvatar = mentionedMember.displayAvatarURL({format : 'jpg'});
                    }
                    const canvas = Canvas.createCanvas(1200, 250);
                    const context = canvas.getContext('2d');
                    
                    context.font = '60px sans-serif';
                    context.fillStyle = 'yellow';
                    context.fillText(`${displayedName} | ${displayedUsername}`, canvas.width / 2.5, canvas.height / 1.8);
                    
                    context.beginPath();
                    context.arc(125, 125, 100, 0, Math.PI * 2, true);
                    context.closePath();
                    context.clip();
                    
                    const avatar = await Canvas.loadImage(displayedAvatar);
                    context.drawImage(avatar, 25, 25, 200, 200);
                    
                    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'Profile Info Image.png');
                    message.channel.send(attachment);
                } 
                break;

            case commandList[7]: //deletePastMessages
                if (memberHasAccessTo(commandList[7]) && 1 === 2)
                {
                    var deleteBackDistance = 1;
                    if (args.length != 0 && !isNaN(args[0]) && args[0] > 0)
                        deleteBackDistance = args[0];

                    var readMessages = await message.channel.messages.fetch({ limit : deleteBackDistance});
                    message.channel.bulkDelete(readMessages);
                }
                else 
                    message.channel.send("this command is forbidden, fuck off")
                break;

            case commandList[8]: //tic
                if (memberHasAccessTo(commandList[8]))
                {
                    if (args.length != 0 && args[0] === "move")
                    {
                        let player = message.member.id;
                        if (!games[player])
                        {
                            message.reply(`You are not currently in a game, you can start one by typing '${PREFIX}tic args = {@username}'`);
                            break;
                        }
                        if (player !== games[player][1][games[player][2]].id)
                        {
                            message.channel.send("it is not your turn");
                            break;
                        }
                        let symbol = "x";
                        if (games[player][2] === 1)
                            symbol = "o";
                        let moved = true;
                        var location = '';
                        switch (args[1])
                        {
                            case "tl":
                                location = 0;
                                break;
                            case "tm":
                                location = 1; 
                                break;
                            case "tr":
                                location = 2; 
                                break;
                            case "ml":
                                location = 3; 
                                break;
                            case "mm":
                                location = 4; 
                                break;
                            case "mr":
                                location = 5; 
                                break;
                            case "bl":
                                location = 6; 
                                break;
                            case "bm":
                                location = 7; 
                                break;
                            case "br":
                                location = 8; 
                                break;
                            default:
                                message.channel.send("invaild movement : vaild movements are as follows\n(tl, tm, tr, ml, mm, mr, bl, bm, br)");
                                moved = false;
                                break;
                            }
                        if (games[player][0][location] === '-')
                        {
                            games[player][0][location] = symbol;
                        }
                        else
                        {
                            moved = false;
                            message.channel.send("the spot already has a piece in it, please choose a new location");
                        }
                        let gameOver = check_win(games[player], symbol, message);
                        draw_board(games[player][0], message);
                        if (!moved) break;
                        if (gameOver)
                        {
                            let players = games[player][1];
                            delete games[players[0].id];
                            delete games[players[1].id];
                            break;
                        }

                        let nextPlayer = (games[player][2] + 1) % 2;
                        games[player][2] = nextPlayer;
                        games[games[player][1][nextPlayer].id] = games[player];
                        message.channel.send(`<@${games[player][1][nextPlayer].id}> is it your turn`);
                        break;
                    }
                    if (args.includes("games"))
                    {
                        if (Object.keys(games).length === 0)
                        {
                            message.channel.send(`There are currently no games running. Start a game by typing '${PREFIX}tic args = {@username}'`);
                        }
                        for (let game in games)
                        {
                            let currentGame = games[game];
                            message.channel.send(`${currentGame[1][0].displayName} is playing with ${currentGame[1][1].displayName}\n${currentGame[0].slice(0, 3).join('   ')}\n${currentGame[0].slice(3, 6).join('   ')}\n${currentGame[0].slice(6, 9).join('   ')}\nit is currently ${currentGame[1][currentGame[2]]}'s turn`);
                        }
                        break;
                    }
                    if (!message.mentions)
                    {
                        message.channel.send("You must '@' mention the other player to play tic-tac-toe");
                        break;
                    }
                    else
                    {
                        let players = [message.member, message.mentions.members.first()];
                        message.channel.send(`${players[0].displayName} is playing tic-tac-toe with ${players[1].displayName}`)
    
                        let gameData = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];
                        draw_board(gameData, message);
    
                        let firstPlayer = Math.floor(Math.random() * 10) % 2;
                        message.channel.send(`<@${players[firstPlayer].id}> moves first`);
                        games[players[firstPlayer].id] = [gameData, players, firstPlayer];
                        break;
                    }
                    
                    
                }
                break;
            case commandList[9]: //music
                if (memberHasAccessTo(commandList[9]))
                {
                    async function startMusic(voiceChannel)
                    {
                        if (queue.length !== 0)
                        {
                            message.channel.send(`Playing | ${queue[0].title} | ${queue[0].url} |`).then(msg => {
                                msg.suppressEmbeds();
                            });

                            playing = true;
                            voiceChannel.join().then(connection => {
                                dispatcher = connection.play(ytdl(queue[0].url, {filter: "audioonly"}));
                                dispatcher.on("finish", () => {
                                    queue.shift();
                                    startMusic(voiceChannel);
                                });
                            })
                        }
                        else
                        {
                            playing = false;
                            voiceChannel.leave();
                        }
                    }
                    if (args[0] === "play")
                    {
                        const voiceChannel = message.member.voice.channel;
                        if (!voiceChannel)
                        {
                            message.reply("Please join a voice channel to use this bot");
                            break;
                        }
                        //deciding if the person was using a url or a name
                        let stream = "";
                        let song = {
                            title : "name",
                            url : "url",
                            length : "length"
                        };
                        if (!ytdl.validateURL(args[1]))
                        {
                            const {videos} = await yts(args.slice(1).join(" "));
                            if (!videos.length)
                            {
                                message.channel.send("There were no songs with this name or url, please try again");
                                break;
                            }
                            stream = ytdl(videos[0].url, {filter: 'audioonly'});
                            song.title = videos[0].title;
                            song.url = videos[0].url;
                            let songInfo = await ytdl.getInfo(videos[0].url);
                            song.length = songInfo.videoDetails.lengthSeconds;
                        }
                        else
                        {
                            stream = ytdl(args[1], {filter: 'audioonly'});
                            let songInfo = await ytdl.getInfo(args[1]);
                            song.title = songInfo.videoDetails.title;
                            song.url = args[1];
                            song.length = songInfo.videoDetails.lengthSeconds;
                        }
                        queue.push(song);
                        if (!playing)
                            startMusic(voiceChannel);
                        break;
                    }
                    if (args[0] === "search")
                    {
                        const {videos} = await yts(args.slice(1).join(" "));
                        if (!videos.length) return message.channel.send("There we no songs related to this name. Please try a new title");
                        const song = {
                            title : videos[0].title,
                            url: videos[0].url
                        };
                        message.channel.send(song.url);
                        break;
                    }
                    if (args[0] === "queue")
                    {
                        let outputString = ''
                        for (var song = 0; song < queue.length; song++)
                        {
                            let currentSong = queue[song];
                            outputString += `${song + 1}.) ${currentSong.title} | ${currentSong.url}\n`;
                        }
                        message.channel.send(outputString).then(msg => msg.suppressEmbeds());
                        break;
                    }
                    if (args[0] === "skip")
                    {
                        const voiceChannel = message.member.voice.channel;
                        if (!voiceChannel)
                        {
                            message.reply("Please join a voice channel to use this bot");
                            break;
                        }
                        queue.shift();
                        startMusic(voiceChannel);
                        break;
                    }
                    if (args[0] === "pause")
                    {
                        dispatcher.pause();
                        break;
                    }
                    if (args[0] === "resume")
                    {
                        dispatcher.resume();
                        break;
                    }
                    message.channel.send(`The music command requires arguments see '${PREFIX}help music' for more information`);
                }
                break;

            case "..":
                break;

            default:
                message.channel.send(`The command "${PREFIX}${command_name}" was not found. Type "${PREFIX}commands" to see the commands you can use`);
                break;
        }



    }
});


client.login(process.env.DISCORDJS_BOT_TOKEN);