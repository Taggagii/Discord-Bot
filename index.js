const Discord = require('discord.js');
const client = new Discord.Client();
require("dotenv").config();
const PREFIX = ".";
const commands = ["commands", "permissions", "kick", "ban"]


client.on("ready", () => {
    console.log(`${client.user.username} has logged in`);
});

client.on("message", (message) => {
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
        
        switch(command_name)
        {
            case "commands":
                commands.forEach(name => {
                    message.channel.send(`.${name}`);
                });
                break;
            case "permissions":
                var canUseBot = (message.member.roles.cache.get("763588921346752513"));
                if (canUseBot)
                {
                    message.channel.send("You can use this bot");
                }
                else
                {
                    message.channel.send("You cannot use this bot");
                }
                break;
            case "kick":
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
                break;
            case "ban":
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
                break;
            default:
                message.channel.send(`The command ".${command_name}" was not found. Type ".commands" to see the commands you can use`);
                break;
        }



    }
});


client.login(process.env.DISCORDJS_BOT_TOKEN);