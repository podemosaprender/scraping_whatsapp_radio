#!/bin/sh

IN=$1
OUT=$2
mkdir -p $OUT

for f in $IN/*.ogg ; do 
	xf=`basename $f`
	od=$OUT/audio/${xf:0:6}/${xf:0:8} 
	mkdir -p $od
	of=$od/$xf
	if [ -f $of ] ; then echo "HAVE $of" 
	else
		echo "NORMALIZE $f" 
		ffmpeg-normalize $f -c:a libopus -ext ogg -o $of
	fi	
done

for f in $IN/*.msg.json ; do 
	xf=`basename $f`
	od=$OUT/audio/${xf:0:6}/${xf:0:8} 
	mkdir -p $od
	of=$od/$xf
	cp -v $f $of
done

rm $OUT/index.txt #A: recalculamos los indices cada vez, git se ocupa
rm $OUT/index/*
for f in `find $OUT -iname '*.msg.json' | sort` ; do 
	mkdir -p $OUT/index
	sf=`basename -s .msg.json $f`
	echo $sf >> $OUT/index/${sf:0:6}.txt  
done
for f in `ls $OUT/index/* | sort`; do
	sf=`basename -s .txt $f`
	echo ${sf:0:6} >> $OUT/index.txt; 
done

