//INFO: bajar audios desde la ultima marca
GrpName= 'XPrueba';
GrpName= global.GrpName || 'PodemosAprender radio';
var MARCA='El robot de PodemosAprender guardó hasta acá';
stop= false;

var MARCA_NEW= 'You created this group';

//if (global.radioRunning) { return } radioRunning= true;

var miP= await open_p('wa','https://web.whatsapp.com/');

L("WARadio "+GrpName+" start");
await miP.waitForXPath('//*[text()="'+GrpName+'"]',{timeout:120000}); //A: esperamos hasta 2min

var isGroupSelected= false;
var xb= await miP.$x('//*[text()="'+GrpName+'"]');
for (var i=0; i<xb.length; xb++) {
	var up3= await up_e(xb[i],3);
	L("Elegir grupo "+i+" "+up3);
	if (!up3) continue;
	var tag= await tag_e(up3);
	L("Elegir grupo "+i+" tag "+tag);
	if (tag=='DIV') { //TODO: asi distingo del header, y si hay mas?
		xb[i].click(); //A: elegi grupo radio
		L("Grupo elegido ...");
		isGroupSelected= true;
	}
}
if (!isGroupSelected) { L("ERROR: no encontre grupo"); return; }

var m= await scrollUp_x(miP,[x_t(MARCA),x_t(MARCA_NEW)],null,2); 
if (m[0]==1) { MARCA= MARCA_NEW; } //A: grupo nuevo, no habia MARCA
L("Mark",MARCA,m);
//A: subi a la marca que puse la ultima vez que baje

var msgX= x_t(MARCA)+x_class('message-','*','/following::');
L("Buscando", msgX);
var msgEs= await miP.$x(msgX);
var msgt= await outerHTML(miP,msgEs);
console.log("MSG: "+msgt.length);
set_file_json('xmsgh',msgt);

var whoPrev='unknown';
var timePrev= null; //A: el primero que aparece ya tiene la fecha
var msg= msgt.map(t => {
	var r= {};
	r.m= t.match(/>[^<]+</g).map(c => c.replace(/[><]/g,''));
	var a= t.match(/<audio .*?src="([^"]*)/);	
	if (a) { r.a= a[1];}

	if (t.match(/message-out/)) { r.who="Mauricio Cap"; }
	else if (r.m.length>2) { r.who= r.m[1].trim(); r.who2= r.m[0].trim(); }
	else { r.who= whoPrev; }
	whoPrev= r.who;

	var m= t.match(/data-pre-plain-text="\[(\d+):(\d+), (\d+)\/(\d+)\/(\d+)\] ([^:]+):/);
	if (m) {
		r.time= new Date(m[5],m[3]-1,m[4],m[1],m[2]);
		r.who2= m[6].trim() ;
	}
	else {
		var m= r.m[r.m.length-1].match(/(\d+):(\d+)/); //A: el ultimo es la hora
		var h= parseInt(m[1]);
		r.time= td(timePrev, 
			(((m< timePrev.getHours()) ? 24 : 0)+h)*60*60 + //A: si pasamos de dia
			m[2]*60);
	}
	timePrev= r.time;
	return r;
});
set_file_json('xmsg',msg);

await Promise.all(msg.map(async (m,i) => {
	if (m.a) {
		var url= m.a;
		var fname= 'audio'+sprintf('%02d',i)+'_'+fname_safe(m.who)+'.ogg';
		console.log("Audio URL: "+i+' '+fname+' '+url);
		return downloadUrl(miP,fname,url); 
	}
}));
console.log("done");

if (false) {
	await type(miP, MARCA+'\nPara la fecha '+ts()+'\nEscuchalo en https://www.podemosaprender.org/data_radio/#/radio/'+TS+'\n');
	await sleep(5000); //A: esperamos que suba
}

L("WARadio "+GrpName+" done");
