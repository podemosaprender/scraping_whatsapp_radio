#!/bin/sh

IN=$1
OUT=$2
mkdir -p $OUT

for f in $IN/*.ogg ; do 
	of=$OUT/`basename $f`
	if [ -f $of ] ; then
		echo "HAVE $f" 
	else
		echo "NORMALIZE $f" 
		ffmpeg-normalize $f -c:a libopus -ext ogg -o $of
	fi	
done

cp -u $IN/*.msg.json $OUT/
(cd $OUT ; for f in *.msg.json ; do echo $f >> index_${f:0:6}.txt ; echo ${f:0:6} >> index.txt; done)

