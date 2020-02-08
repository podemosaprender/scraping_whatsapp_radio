MARCA='El robot de PodemosAprender guardo hasta aca';
var puppeteer= require('puppeteer');
var fs= require('fs');
var sprintf= require('sprintf');

userData= 'datos_nav';

(async () => {
  Browser = await puppeteer.launch({
		headless: false,
		args: [`--user-data-dir=${userData}`],
		});
  Whatsapp_page = await Browser.newPage();
  await Whatsapp_page.goto('https://web.whatsapp.com/');
	console.log('ESPERANDO COMANDOS');
})();

var stdin = process.openStdin();

function logValue(element) {
	if (element._remoteObject) {
		console.log(element._remoteObject.value);
	}
}

function downloadUrl(page, fname, url) {
	return page.evaluate((url) =>
	{
			var reval= fetch(url, { credentials: 'include' })
				.then(r => r.blob())
				.then(dblob => {
					var reader= new FileReader();
					var rp= new Promise((onData) => {
						reader.onloadend= () => { onData(reader.result); }
					});
					reader.readAsBinaryString(dblob);
					return rp;
				});
			return reval;
	}, url)
	.then( d => { console.log("Download "+fname+" "+url+" DATA:" + d.length); fs.writeFileSync(fname,d,'binary'); });
}

function elementSrcFor(page, selector) {
	return page.evaluate((selector) => {
		xs= document.querySelectorAll(selector);
		r= []; for (i=0; i<xs.length; i++) { r.push(xs[i].src); }
		return r;
	}, selector);
}

stdin.addListener("data", function(d) {
	ctl= d.toString().trim();
	console.log("you entered: [" + ctl + "]");

	if (ctl == 'u') {
		Whatsapp_page.keyboard.press('Home');
	}
	else if (ctl == 'f') {
		Whatsapp_page.focus('[tabindex="0"]');
	}
	else if (ctl == 'd') {
		Whatsapp_page.$x('//*[text()[contains(.,"Download")]]')
		.then(x => x.map(e =>{ e.click(); }));
	}
	else if (ctl == 'x') {
		Whatsapp_page.$x('//*[text()[contains(.,"radio")]]')
		.then(x => x.map(e =>{ e.getProperty('innerText').then( v => logValue(v)); e.click(); }));
	}
	else if (ctl == 'n') {
		var page= Browser.newPage().then(p => p.goto('https://github.com'));
	}
	else if (ctl=='q') {
		Browser.close() // close by api
		process.exit();
	}
	else if (ctl=='G') {
		elementSrcFor(Whatsapp_page,'audio')
		.then( urls => { console.log("Audio URLS: "+ urls.join(", "));
			urls.map( (u,i) => downloadUrl(Whatsapp_page,sprintf('audio%02d.ogg',i),u));
		})
	}
	else if (ctl=='R') { (async () => {
		await Whatsapp_page.$x('//*[text()[contains(.,"PodemosAprender radio")]]')
		.then(x => x.map(e =>{ e.getProperty('innerText').then( v => logValue(v)); e.click(); }));
		//A: elegi grupo radio

		var focused= false;
		while (!focused) {
			try { await Whatsapp_page.focus('[tabindex="0"]'); focused= true; }
			catch (ex) { console.log("Wait focus"); await new Promise(r => setTimeout(r, 1000)); }
		}	

		
		while (true) {
			var x= await Whatsapp_page.$x('//*[text()="'+MARCA+'"]');
			if (x.length>0) { break; }
			console.log("Buscando ...");
			Whatsapp_page.keyboard.press('Home');
			await new Promise(r => setTimeout(r, 5000)); //A: esperar 5s que cargue! 
		}

		var audios= await Whatsapp_page.$x('//*[text()="'+MARCA+'"]/following::audio')
		console.log("Audios len=" + audios.length);
		var urls= audios.map(async (a,i) => {
			var url= await a.getProperty("src");
			console.log("Audio URL: "+ url);
			downloadUrl(Whatsapp_page,sprintf('audio%02d.ogg',i),url); 
		});

		await Whatsapp_page.keyboard.type(MARCA);
		await Whatsapp_page.keyboard.press('Enter');
		await Whatsapp_page.keyboard.type('Para la fecha '+(new Date().toISOString()));
		await Whatsapp_page.keyboard.press('Enter');

	})(); }
	else if (ctl=='W') { (async () => {
		await Whatsapp_page.keyboard.type(MARCA);
		await Whatsapp_page.keyboard.press('Enter');
		await Whatsapp_page.keyboard.type('Para la fecha '+(new Date().toISOString()));
		await Whatsapp_page.keyboard.press('Enter');

	})(); }
	else { eval(ctl); }
	
});
