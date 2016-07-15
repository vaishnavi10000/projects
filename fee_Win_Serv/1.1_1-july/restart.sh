!/bin/bash
kill -9 `ps -ef|grep node|grep fee.js|awk '{print $2}'`
nohup node fee.js 2>&1 &
