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
    }
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
        let memberHasAccessTo = (command, message) => {
            if (membersPermissions >= commands[command].MINPERMISSIONS)
                return true;
            message.channel.send(`You do not have high enough permissions to access ".${command}".\nType ".commands" to see command you have permissions to access.`)
            return false;
        }
        
        switch(command_name)
        {
            case commandList[0]: //commands
                if (memberHasAccessTo(commandList[0], message))
                {
                    var outputString = "";
                    Object.keys(commands).forEach(command => {
                        if (membersPermissions >= commands[command].MINPERMISSIONS)
                            outputString += `.${command} ${commands[command].ARGS}\n${commands[command].DISCRIPTION}\n\n`
                    });
                    message.channel.send(outputString);
                }
                break;

            case commandList[1]: //permissions
                if (memberHasAccessTo(commandList[1], message))
                {
                    if (!membersPermissions)
                        message.channel.send("You do not have a permisions level");
                    else
                        message.channel.send(`You have Level ${membersPermissions} access to this bot`);
                }
                break;

            case commandList[2]: //shutdown
                if (memberHasAccessTo(commandList[2], message))
                {
                    if (message.author.id === OwnerId)
                        message.channel.send("You are authorized. Shutting Down").then(m => {client.destroy();});
                    else
                        message.channel.send("Special permissions are required for this command.")
                }
                break;

            case commandList[3]: //user
                if (memberHasAccessTo(commandList[3], message))
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
                if (memberHasAccessTo(commandList[4], message))
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
                if (memberHasAccessTo(commandList[5], message))
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
                if (memberHasAccessTo(commandList[6], message))
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
                    
    //                const background = await Canvas.loadImage('wallpaper.jpg');
                    //context.drawImage(background, 0, 0, canvas.width, canvas.height);
                    //context.strokeStyle = "#74037b";
                    //context.strokeRect(0, 0, canvas.width, canvas.height);
                    
                    context.font = '60px sans-serif';
                    context.fillStyle = 'blue';
                    context.fillText(`${displayedName} | ${displayedUsername}`, canvas.width / 2.5, canvas.height / 1.8);
                    
                    context.beginPath();
                    context.arc(125, 125, 100, 0, Math.PI * 2, true);
                    context.closePath();
                    context.clip();
                    
                    const avatar = await Canvas.loadImage(displayedAvatar);
                    context.drawImage(avatar, 25, 25, 200, 200);
                    
                    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'WHERE THE FUCK IS THE DISPLAY NAME UNDEFINED BITCH.png');
                    message.channel.send(attachment);
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