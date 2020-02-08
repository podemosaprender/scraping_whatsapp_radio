#!/bin/sh

rm x_audio.txt
for f in pa_radio/c_in.ogg $1/audio*.ogg pa_radio/c_out.ogg; do 
	if ffmpeg -i $f 2>&1 | grep Stream | grep -q opus; then 
		echo "OPUS $f"
		echo "file '$f'" >> x_audio.txt; 
	else
		fok=`dirname $f`/x_`basename $f`
		ffmpeg -y -i $f -c:a libopus $fok
		echo "file '$fok'" >> x_audio.txt; 
	fi
done

ffmpeg -y -f concat -safe 0 -i x_audio.txt -c copy x_audio.ogg
#A: tengo un solo audio

ffmpeg -y -loop 1 -i radio.jpg -i x_audio.ogg -c:v libx264 -tune stillimage -c:a aac -b:a 64k -pix_fmt yuv420p -shortest x_radio.mp4

