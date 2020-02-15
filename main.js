var puppeteer= require('puppeteer');
var fs= require('fs');
var sprintf= require('sprintf');

SessionDataDir= 'datos_nav'; //U: donde se guardan cookies, etc. para que recuerde login, autorizacion, etc.

//------------------------------------------------------------
//S: LIBreria de funciones comodas que voy generalizando
function L(x,y,z) {
	console.log(x,y,z);
}

async function sleep(t) { //U: usar con await para esperar
	return new Promise(r => setTimeout(r, t));
}

function logValue(element) {
	if (element._remoteObject) {
		console.log(element._remoteObject.value);
	}
}

async function parentElement(e) {
	return (await e.$x('..'))[0];
}
	
async function up(e,levels) {
	for (var i=0; e && i<levels; i++) {//U: sube por la jerarquia de parents
		e= await parentElement(e);
	}
	return e;
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
var curCmdFilePath= '';
(async () => {
  Browser = await puppeteer.launch({
		headless: false, //A: mostrar la ventana, asi podemos ir arreglando o probando cosas
		args: [`--user-data-dir=${SessionDataDir}`], //A: para que la sesion sea persistente
	});
	console.log('READY>');

	var stdin= process.openStdin().pipe(require('split')()); //U: para leer comandos de la consola, linea por linea

	stdin.on("data", function(d) {
		ctl= d.toString().trim(); //A: eliminamos espacios antes o despues
		console.log("you entered: [" + ctl + "]");
		js='';
		if (ctl!='' && fs.existsSync(ctl)) { curCmdFilePath= ctl; }
		else { js= ctl; }
		if (js=='' &&  curCmdFilePath) { js= fs.readFileSync(curCmdFilePath,'utf-8'); }

		if (js!='') { try { eval(js); } catch (ex) { console.error(ex); } } //A: si pegas un pedazo de javascript te lo evalua aca mismo
		console.log("READY>");
	});

})();
