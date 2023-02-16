#!/bin/bash

#navigate to working directory where we have all our github files
cd /home/spc-user/rest-api

#add npm and node to path
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # load nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # loads nvm bash completion

#install node modules
npm install

#start our node app in the background
node server.js > server.out.log 2> server.err.log < /dev/null &