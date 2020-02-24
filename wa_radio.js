//INFO: bajar audios desde la ultima marca
//GrpName= 'XPrueba';
GrpName= global.GrpName || 'PodemosAprender radio';
var MARCA='El robot de PodemosAprender guardó hasta acá';
stop= false;

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

try { await scrollUp_x(miP,x_t(MARCA),null,20); }
catch (ex) { 
	var xs= 'You created this group';
	L("Mark not found. First run?",xs);
	await scrollUp_x(miP,x_t(xs),null,20); 
	MARCA= xs;
	L("Using mark", MARCA);
}
//A: subi a la marca que puse la ultima vez que baje

var msgX= x_t(MARCA)+x_class('message-','*','/following::');
L("Buscando", msgX);
var msgEs= await miP.$x(msgX);
var msgt= await outerHTML(miP,msgEs);
console.log("MSG: "+msgt.length);
set_file_json('xmsg',msgt);

var whoPrev='unknown';
var msg= msgt.map(t => {
	var r= {};
	r.m= t.match(/>[^<]+</g).map(c => c.replace(/[><]/g,''));
	var a= t.match(/<audio .*?src="([^"]*)/);	
	if (a) { r.a= a[1];}
	if (t.match(/message-out/)) { r.who="MauricioCap"; }
	else if (r.m.length>2) { r.who= r.m[1]; }
	else { r.who= whoPrev; }
	whoPrev= r.who;
	return r;
});

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
