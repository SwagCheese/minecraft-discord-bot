const Discord = require('discord.js')
const util = require('minecraft-server-util')
const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
const config = require('./config.js');


const rcon = new util.RCON()

const intents = new Discord.IntentsBitField()
    .add(Discord.IntentsBitField.Flags.Guilds, Discord.IntentsBitField.Flags.GuildMessages, Discord.IntentsBitField.Flags.MessageContent);

const client = new Discord.Client({
    intents: intents,
})

rcon.on("error", error => {
  console.warn(`RCON Error (this is probably because someone ran "${config.prefix}execute stop"):\n${error}`)
})

client.once('ready', async () => {
    console.info(`Logged in as ${client.user.tag}`)
})

client.on('messageCreate', msg => {
    if (!msg.content.startsWith(config.prefix)) return

    msg.content = msg.content.substring(config.prefix.length) // remove prefix from message

    switch (msg.content.substring(0, msg.content.includes(" ") ? msg.content.indexOf(" ") : msg.content.length)) {
        case 'start':
            util.statusLegacy(config.serverIp, config.serverPort).then(() => {
                msg.channel.send('ERROR: Cannot start server because it is already running.')
            }).catch(async () => {
                msg.channel.send('Starting the server...')
                child_process.exec(config.serverStartCommand)

                let counter = 0
                while (counter !== -1) {
                    util.statusLegacy(config.serverIp, config.serverPort).then(() => {
                        rcon.connect(config.serverIp, config.rcon_port).then(() => {
                            console.info('RCON Connected')
                            rcon.login(config.rcon_password).then(() => {
                                console.info('RCON Logged in')
                                msg.channel.send('The server has started.')
                                counter = -1
                            })
                        }).catch(() => {
                            // ignore error (server has not actually fully started)
                        })
                    }).catch(() => {
                        console.info(`The server has not started yet after ~${counter+=5} seconds.`)
                    })

                    if (counter >= config.serverStartTimeout) {
                        msg.channel.send('Error: timed out while waiting for the server to start')
                        break
                    }

                    await new Promise(r => setTimeout(r, 5000))
                }
            })
            break

        case 'stop':
            util.statusLegacy(config.serverIp, config.serverPort).then(status => {
                if (status.players.online === 0 || config.operators.includes(msg.author.id.toString())) {
                    msg.channel.send('Stopping the server...')

                    if (!rcon.isConnected) {
                        console.info('RCON was not connected when attempting to stop server, connecting now.')
                        rcon.connect(config.serverIp, config.rcon_port).then(() => {
                            console.info('RCON Connected')
                            rcon.login(config.rcon_password).then(() => {
                                console.info('RCON Logged in')
                            }).finally(() => {
                                rcon.execute('stop').finally(() => {
                                    rcon.close()
                                    msg.channel.send('Server stopped.')
                                })
                            })
                        }).catch(error => {
                            console.warn(`Error on RCON Connect: ${error}`)
                            msg.channel.send('An error occurred while stopping the server')
                        });
                    } else {
                        rcon.execute('stop').finally(() => {
                            rcon.close()
                            msg.channel.send('Server stopped.')
                        })
                    }
                } else {
                    msg.channel.send('ERROR: You cannot stop the server when there are players online.')
                    console.info('Online players: ' + status.players.online)
                }
            }).catch(error => {
                console.warn(`Error while stopping server. \nThis is most likely because the server is not running: ${error.message}`)
                msg.channel.send(`The server is not running. Use ${config.prefix}start to start it`)
            })
            break

        case 'exec':
        case 'execute':
            if (config.operators.includes(msg.author.id.toString())) {
                msg.content = msg.content.substring(msg.content.indexOf(" ") + 1)

                console.info(`${msg.author.tag} sent command ${msg.content}`)
                util.statusLegacy(config.serverIp, config.serverPort).then(() => {
                    if (!rcon.isConnected) {
                        console.info('RCON was not connected when attempting to run command, connecting now.')
                        rcon.connect(config.serverIp, config.rcon_port).then(() => {
                            console.info('RCON Connected')
                            rcon.login(config.rcon_password).then(() => {
                                console.info('RCON Logged in')
                            }).finally(() => {
                                rcon.execute(msg.content).then(response => {
                                    msg.channel.send(`SERVER: ${response}`)
                                })
                            })
                        }).catch(error => {
                            console.warn(`Error on RCON Connect: ${error}`)
                            msg.channel.send('An error occurred while sending the command')
                        });
                    } else {
                        rcon.execute(msg.content).then(response => {
                            msg.channel.send(`SERVER: ${response}`)
                        })
                    }
                }).catch(error => {
                    msg.channel.send(`The server is offline. Use ${config.prefix}start to start it`)
                    console.warn(`Error while executing command: ${error.message}`)
                })
            } else {
                msg.channel.send("You do not have permission to send commands to the server. If you are the owner, add your user id to the operators array in the config.js file.")
            }
            break

        case 'backup':
            if (config.operators.includes(msg.author.id.toString())) {
                let ms_start = new Date().getMilliseconds()
                let backup_directory = path.join(config.backup_dir, `backup-${ new Date().toISOString().replace('T', '_').substring(0, 19) }`)
                console.time(backup_directory)
                try {
                    fs.mkdirSync(config.backup_dir)
                    fs.mkdirSync(backup_directory)
                } catch (error) {
                    if (error.code !== 'EEXIST') {
                        console.warn(`Error while making backup directories: ${error.message}`)
                        msg.channel.send('The backup directory could not be created. You most likely did not set the server directory properly or need to run the bot as an administrator.')
                    }
                }

                config.dirs_to_backup.forEach(dir => {
                    try {
                        fs.cpSync(dir, backup_directory, { recursive: true, force: true })
                    } catch (error) {
                        console.warn(`Error while backing up files: ${error.message}`)
                        msg.channel.send(`The directory ${dir} could not be backed up. If this persists try editing the dirs_to_backup variable or run the bot as an administrator.`)
                    }
                })
                msg.channel.send(`Done backup. Took ${new Date().getMilliseconds() - ms_start} ms.`)
            } else {
                msg.channel.send("You do not have permission to backup to the server. If you are the owner, add your user id to the operators array in the config.js file.")
            }
            break
    }
})

client.login(config.token).catch(error => {
    console.error(`The bot could not log in. You may still have to edit config.js.\nError Message: ${error.message}`);
})

