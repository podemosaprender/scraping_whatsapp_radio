#!/bin/sh
export PATH=$PATH:~/bin
export DISPLAY=:0.0 #A: para el chrome/puppeteer

kill `ps -ef | grep local-chromium | cut -c 9-15` #A: matar chromium si quedo colgado
(echo "sendMark=1;"; sleep 1; echo "wa_radio.js") | node main.js #A: bajo los audios y mensajes
./mkRadio.sh tmp/PodemosAprender_radio data_radio_1
(cd data_radio_1 ; git add .; git commit -m "RADIO AUTO"; pagit push) #A: agrego audio despues de normalize

