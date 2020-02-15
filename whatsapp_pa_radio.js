//INFO: bajar audios desde la ultima marca
MARCA='El robot de PodemosAprender guardo hasta aca';
stop= false;
(async () => {
	if (global.radioRunning) { return } radioRunning= true;

	if (!global.Whatsapp_page) {
		Whatsapp_page= await Browser.newPage();
		await Whatsapp_page.goto('https://web.whatsapp.com/');
	}

	await Whatsapp_page.waitForXPath('//*[text()="PodemosAprender radio"]',{timeout:120000}); //A: esperamos hasta 2min

	var isGroupSelected= false;
	var xb= await Whatsapp_page.$x('//*[text()="PodemosAprender radio"]');
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
		console.log("Buscando ...");
		Whatsapp_page.keyboard.press('Home'); //A: no la encontre, apreto "home" para subir un poco
	}

	var audios= await Whatsapp_page.$x('//*[text()="'+MARCA+'"]/following::audio')
	//A: consigo los audios DESPUES de la marca, usando xpath <3 <3 <3
	console.log("Audios len=" + audios.length);
	await Promise.all(audios.map(async (a,i) => {
		var url= await a.getProperty("src");
		console.log("Audio URL: "+ url);
		return downloadUrl(Whatsapp_page,sprintf('audio%02d.ogg',i),url); 
	}));

	console.log("done");
	if (! global.dontExit) { process.exit(); }
	return ;

	await Whatsapp_page.keyboard.type(MARCA);
	await Whatsapp_page.keyboard.press('Enter');
	await Whatsapp_page.keyboard.type('Para la fecha '+(new Date().toISOString()));
	await Whatsapp_page.keyboard.press('Enter');
})();
