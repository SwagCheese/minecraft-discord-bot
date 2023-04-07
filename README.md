**!! THIS SERVER MUST BE HOSTED ON YOUR LOCAL MACHINE FOR THIS TO WORK. !!**

Try modifying this code using [selenium webdriver](https://www.npmjs.com/package/selenium-webdriver) if you are using a server hosting website

### SETUP:
1) [set up a minecraft server.](https://youtu.be/7SClg1-GsLg) This tutorial should work for most versions
2) clone or download this git repo
3) create a new bot on the [discord developer portal](https://discord.com/developers). Tutorial 
    * when giving the bot permissions, select `Read Messages/View Channels` and `Send Messages`
    * in the `Bot` tab, enable `Message Content Intent`
4) on your machine run the command `npm install` in the terminal. Make sure to install node.js if you haven't already
5) in your minecraft server's server.properties file: 
   * set the enable-rcon property to true 
   * set the rcon-password property to your desired password
6) edit the variables in the `config.js` file to your liking

### USAGE:
#### Starting the bot:
1) open a terminal in the directory where you installed the bot (use `cd <directory>` to navigate)
2) run the command `node .`
#### Commands:
* {prefix}start: starts the server 
* {prefix}stop: stops the server 
* {prefix}execute: executes a command on the server. Your user id must be in the operators array in the `config.js` file for this to work
* {prefix}exec: alias for {prefix}execute
* {prefix}backup: makes a backup of the server to the specified directory. Your user id must be in the operators array in the `config.js` file  for this to work