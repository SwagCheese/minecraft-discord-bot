const config = {
  prefix: '!', // the symbol used when telling the discord bot to do something
  serverDirectory: 'SERVER_DIRECTORY', // folder where the server is stored
  serverStartCommand: `cd ${this.serverDirectory} && SERVER START COMMAND`, // command to start the server (I recommended putting nogui at the end of the command to remove the server dashboard)
  // without "cd ${this.serverDirectory}", the server config files and world were being created in the same folder as the discord bot
  serverStartTimeout: 300, // after this many seconds, the bot will give up on waiting for the server to start
  serverIp: 'IP', // the server ip
  serverPort: 25565, // the server port
  token: 'TOKEN', // your bot's token
  rcon_port: 25575, // the port that rcon is running on
  rcon_password: '1234', // the password used to connect to rcon
  backup_dir: '/backup/directory', // the directory that your backup files will end up in
  dirs_to_backup: [ `${this.serverDirectory}/world`, `${this.serverDirectory}/world_nether`, `${this.serverDirectory}/world_the_end`, ], // the directories that you want to back up
  operators: [ 'USER_ID' ], // an array of user ids that can send commands to the server (not including start + stop)
  // see https://youtu.be/ZPROrf4Fe3Q for more information on how to get users ids
}

module.exports = config; // don't edit this line