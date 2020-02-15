#!/bin/sh

TS=`date +%Y%m%d` #A: aÃ±o mes dia
AUDIO=data_radio/audio/$TS
rm audio*.ogg
#echo "whatsapp_pa_radio.js" | node main.js #A: bajo los audios
(cd data_radio; pagit pull)
mkdir -p $AUDIO
mv audio* $AUDIO
./mkRadio.sh $AUDIO
(cd $AUDIO ; git add .; git commit -m "AUDIO $TS"; pagit push) #A: agrego audio despues de normalize

