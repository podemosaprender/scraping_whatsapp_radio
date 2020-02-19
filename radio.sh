#!/bin/sh
export PATH=$PATH:~/bin
export DISPLAY=:0.0 #A: para el chrome/puppeteer
TS=`date +%Y%m%d` #A: aÃ±o mes dia
AUDIO=data_radio/audio/$TS
rm audio*.ogg
kill `ps -ef | grep local-chromium | cut -c 9-15` #A: matar chromium si quedo colgado
(echo "TS='$TS';" ; sleep 1; echo "whatsapp_pa_radio.js") | node main.js #A: bajo los audios
(cd data_radio; pagit pull)
mkdir -p $AUDIO
mv audio* $AUDIO
./mkRadio.sh $AUDIO
(cd $AUDIO ; git add .; git commit -m "AUDIO $TS"; pagit push) #A: agrego audio despues de normalize

