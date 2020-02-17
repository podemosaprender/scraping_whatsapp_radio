//INFO: bajar audios desde la ultima marca
GrpName= global.GrpName || 'PodemosAprender radio';
MARCA='El robot de PodemosAprender guardó hasta acá';
stop= false;

function fname_safe(s) {
	return (s||'_').replace(/[^A-Za-z0-9_-]+/g,'_');
}

(async () => {
	if (global.radioRunning) { return } radioRunning= true;

	if (!global.Whatsapp_page) {
		Whatsapp_page= await Browser.newPage();
		await Whatsapp_page.goto('https://web.whatsapp.com/');
	}

	await Whatsapp_page.waitForXPath('//*[text()="'+GrpName+'"]',{timeout:120000}); //A: esperamos hasta 2min

	var isGroupSelected= false;
	var xb= await Whatsapp_page.$x('//*[text()="'+GrpName+'"]');
	for (var i=0; i<xb.length; xb++) {
		var up3= await up(xb[i],3);
		L("Elegir grupo "+i+" "+up3);
		if (!up3) continue;
		var tag= (await Whatsapp_page.evaluate( e=> e.tagName , up3));
		L("Elegir grupo "+i+" tag "+tag);
		if (tag=='DIV') { //TODO: asi distingo del header, y si hay mas?
			xb[i].click(); //A: elegi grupo radio
			L("Grupo elegido ...");
			isGroupSelected= true;
		}
	}
	if (!isGroupSelected) { L("ERROR: no encontre grupo"); return; }

	var focused= false;
	while (!focused) { if (stop) { return }
		try { 
			await Whatsapp_page.focus('[tabindex="0"]'); //A: lanza excepcion si no pudo!
			focused= true; //A: si estoy aca es porque pudo, termina el while
		}
		catch (ex) { //A: lanzo ex, esperar y probar de nuevo
			console.log("Wait focus"); 
			await sleep(1000); 
		}
	}	
	console.log("Focused");
	
	while (true) { if (stop) { return }
		var x= await Whatsapp_page.$x('//*[text()="'+MARCA+'"]'); //A: busco la marca que puse la ultima vez que baje
		//TODO: da timeout 30s await Whatsapp_page.waitForNavigation({waitUntil: 'networkidle0'});
		await sleep(10000); //A: esperar 5s que cargue! 
		if (x.length>0) { break; } //A: subi hasta que la encontre, listo otro paso
		console.log("Buscando marca ...");
		Whatsapp_page.keyboard.press('Home'); //A: no la encontre, apreto "home" para subir un poco
	}
	//A: llegue a la ultima marca

	var msgEs= await Whatsapp_page.$x("//*[text()='"+MARCA+"']/following::*[contains(concat(' ',normalize-space(@class),' '),' message-')]");		
	var msgt= await Whatsapp_page.evaluate( (... msgEs) => {
		return msgEs.map(e => e.innerHTML);
	}, ... msgEs);
	console.log("MSG: "+msgt.length);
	fs.writeFileSync('xmsg',JSON.stringify(msgt,null,1),'utf-8');

	var whoPrev='unknown';
	msg= msgt.map(t => {
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
			return downloadUrl(Whatsapp_page,fname,url); 
		}
	}));

	console.log("done");

	if (true) {
	await Whatsapp_page.keyboard.type(MARCA);
	await Whatsapp_page.keyboard.press('Enter');
	await Whatsapp_page.keyboard.type('Para la fecha '+(new Date().toISOString()));
	await Whatsapp_page.keyboard.press('Enter');
	}

	if (! global.dontExit) { await Browser.close(); process.exit(); }
})();
