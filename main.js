var puppeteer= require('puppeteer');
var fs= require('fs');
var sprintf= require('sprintf');

SessionDataDir= 'datos_nav'; //U: donde se guardan cookies, etc. para que recuerde login, autorizacion, etc.
P= {}; //U. paginas que tenemos abiertas

function mainDo(ctl) {
	var js='';
	if (ctl!='' && fs.existsSync(ctl)) { curCmdFilePath= ctl; }
	else { js= ctl; }
	if (js=='' &&  curCmdFilePath) { 
		var js0= '\n'+fs.readFileSync(curCmdFilePath,'utf-8'); 
		js= js0.replace(/\n(async\s+)?function\s+([^\(]+)/g,"\n$2= $1 function $2");
		//DBG console.log(js);
	}

	if (js!='') { try { eval("(async () => {\n" + js + "\n})()"); } catch (ex) { console.error(ex); } } //A: si pegas un pedazo de javascript te lo evalua aca mismo
}

//------------------------------------------------------------
//S: control interactivo
var curCmdFilePath= '';
(async () => {
  Browser= await puppeteer.launch({
		headless: false, //A: mostrar la ventana, asi podemos ir arreglando o probando cosas
		args: [`--user-data-dir=${SessionDataDir}`], //A: para que la sesion sea persistente
	});

	mainDo("lib.js");

	var stdin= process.openStdin().pipe(require('split')()); //U: para leer comandos de la consola, linea por linea

	console.log('READY>');
	stdin.on("data", function(d) {
		ctl= d.toString().trim(); //A: eliminamos espacios antes o despues
		console.log("Cmd [" + ctl + "]");
		mainDo(ctl);
		console.log("READY>");
	});
})();
