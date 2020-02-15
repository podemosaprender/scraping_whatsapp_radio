MARCA='El robot de PodemosAprender guardo hasta aca';

var puppeteer= require('puppeteer');
var fs= require('fs');
var sprintf= require('sprintf');

SessionDataDir= 'datos_nav'; //U: donde se guardan cookies, etc. para que recuerde login, autorizacion, etc.

(async () => {
  Browser = await puppeteer.launch({
		headless: false, //A: mostrar la ventana, asi podemos ir arreglando o probando cosas
		args: [`--user-data-dir=${SessionDataDir}`], //A: para que la sesion sea persistente
	});
  Whatsapp_page = await Browser.newPage();
  await Whatsapp_page.goto('https://web.whatsapp.com/');
	console.log('ESPERANDO COMANDOS');
})();

//------------------------------------------------------------
//S: LIBreria de funciones comodas que voy generalizando
async function sleep(t) { //U: usar con await para esperar
	new Promise(r => setTimeout(r, t));
}

function logValue(element) {
	if (element._remoteObject) {
		console.log(element._remoteObject.value);
	}
}

function downloadUrl(page, fname, url) {
	return page.evaluate((url) => //A: esto se ejecuta como en la consola del navegador
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

//------------------------------------------------------------
//S: control interactivo
var stdin= process.openStdin(); //U: para leer comandos de la consola
stdin.addListener("data", function(d) {
	ctl= d.toString().trim(); //A: eliminamos espacios antes o despues
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
		.then(x => x.map(e =>{ 
			e.getProperty('innerText').then( v => logValue(v));  //DBG
			e.click(); //A: elegi grupo radio
		}));

		var focused= false;
		while (!focused) {
			try { 
				await Whatsapp_page.focus('[tabindex="0"]'); //A: lanza excepcion si no pudo!
				focused= true; //A: si estoy aca es porque pudo, termina el while
			}
			catch (ex) { //A: lanzo ex, esperar y probar de nuevo
				console.log("Wait focus"); await sleep(1000); 
			}
		}	

		
		while (true) {
			var x= await Whatsapp_page.$x('//*[text()="'+MARCA+'"]'); //A: busco la marca que puse la ultima vez que baje
			if (x.length>0) { break; } //A: subi hasta que la encontre, listo otro paso
			console.log("Buscando ...");
			Whatsapp_page.keyboard.press('Home'); //A: no la encontre, apreto "home" para subir un poco
			await sleep(5000); //A: esperar 5s que cargue! 
		}

		var audios= await Whatsapp_page.$x('//*[text()="'+MARCA+'"]/following::audio')
		//A: consigo los audios DESPUES de la marca, usando xpath <3 <3 <3
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
	else { eval(ctl); } //A: si pegas un pedazo de javascript te lo evalua aca mismo
	
});
