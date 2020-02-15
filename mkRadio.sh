#!/bin/sh

(cd $1; if [ -f _normalized ] ; then echo "Normalized before"; else ffmpeg-normalize *.ogg -c:a libopus -ext ogg; mv normalized/* .; rmdir normalized; touch _normalized; git add *; fi)
echo "normalized"

(cd data_radio; for i in `find -iname *.ogg | sort` ; do echo "<p>$i<br><audio controls><source src=\"$i\" type=\"audio/ogg\"></audio></p>" ; done > programas.html ; git add programas.html ; git commit -m "actualizado $1" ; pagit push)
#actualice el indice en la web

rm x_audio.txt
for f in data_radio/audio/c_in.ogg $1/audio*.ogg data_radio/audio/c_out.ogg; do 
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

ffmpeg -y -loop 1 -i data_radio/img/portada.jpg -i x_audio.ogg -c:v libx264 -tune stillimage -c:a aac -b:a 64k -pix_fmt yuv420p -shortest x_radio.mp4

