const Discord = require('discord.js');
const Canvas = require('canvas');
const client = new Discord.Client();
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
        DISCRIPTION : "",
        MINPERMISSIONS : 4
    },
    "tic" : {
        ARGS : "",
        DISCRIPTION : "plays tick tac toe",
        MINPERMISSIONS : 2
    }
}

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







const commandList = Object.keys(commands);

const OwnerId = "671090972272230423";

/*
Higher levels have the permissions of all precursory levels
level 0 (no level)           : User can interact with the bot enough to understand that they can't interact with the bot
level 1 (basic level)        : User can perform basic interaction with the bot to get information about themselves and the server, most fun commands are open to basic members
level 2 (intermediate level) : User can get other members information 
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
                message.channel.send(`You do not have high enough permissions to access ".${command}".\nType ".commands" to see commands you have permissions to access.`)
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
                        message.channel.send("You are authorized. Shutting Down").then(m => {client.destroy();});
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
                    if (containsAny(args, ["discriminator", "discrim", "d", "dis", "disc"]))
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
                    message.channel.send("this command is forbidden fuck off")
                break;

            case commandList[8]: //tic
                if (memberHasAccessTo(commandList[8]))
                {
                    if (args.length != 0 && args[0] === "move")
                    {
                        let player = message.member.id;
                        if (!games[player])
                        {
                            message.reply("You are not currently in a game, you can start one by typeing '.tic args = {@username}'");
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
                        break;
                    }
                    if (args.includes("games"))
                    {
                        if (Object.keys(games).length === 0)
                        {
                            message.channel.send("There are currently no games running. Start a game by typing '.tic args = {@username}'");
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
                        message.channel.send(`${players[firstPlayer].displayName} moves first`);                                                                            //FOR TESTING
                        games[players[firstPlayer].id] = [gameData, players, firstPlayer];
                        break;
                    }
                    
                    
                }
                break;
            

            case "..":
                break;

            default:
                message.channel.send(`The command ".${command_name}" was not found. Type ".commands" to see the commands you can use`);
                break;
        }



    }
});


client.login(process.env.DISCORDJS_BOT_TOKEN);