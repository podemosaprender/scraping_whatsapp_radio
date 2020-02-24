//------------------------------------------------------------
//S: LIBreria de funciones comodas que voy generalizando
TAB0_s= '[tabindex="0"]';
TAB0_x= '//*[@tabindex="0"]';

function ser_json(o,wantsIndent) { return JSON.stringify(o,null,wantsIndent) }

function L(x,y,z) { console.log(x,y||'',z||''); }
function LV(element,msg) { if (element._remoteObject) { console.log(msg||'value',element._remoteObject.value); } }

function ts() {return (new Date().toISOString()); }
function td(d,ofs) { return new Date( (new Date(1900+d.getYear(),d.getMonth(),d.getDate())).getTime()+ofs*1000); }

function fname_safe(s) { return (s||'_').replace(/[^A-Za-z0-9_-]+/g,'_'); }
function set_file_json(fname,o) {
	fs.writeFileSync(fname,JSON.stringify(o,null,1),'utf-8');
}

async function exit() { await Browser.close(); process.exit(); }
async function sleep(t) { return new Promise(r => setTimeout(r, t)); } //U: usar con await para esperar

async function open_p(key,url,wantsForce) {
	if (P[key]) {
		if (P[key].isClosed()) {P[key]= null;}
		else if (wantsForce) { await P[key].close(false); P[key]= null; }
		else { return P[key]; }
	}
	//A: hay que abrirla de nuevo
	P[key]= P[key] || await Browser.newPage();
	await P[key].goto(url);
	return P[key]
}

async function parent_e(e) { return (await e.$x('..'))[0]; }
async function up_e(e,levels) { //U: sube por la jerarquia de parents
	for (var i=0; e && i<levels; i++) { e= await parent_e(e); }
	return e;
}
async function tag_e(xe) { return (await xe.evaluate( e=> e.tagName , xe)); }
async function outerHTML(miP, msgEs) {
	return await miP.evaluate( (... msgEs) => {
		return msgEs.map(e => e.outerHTML);
	}, ... msgEs);
}

async function focus_sel(page, sel, maxSecs) {
	maxSecs= maxSecs || 120;
	var focused= false;
	console.log("Focus ("+maxSecs+") "+sel); 
	while (!focused) { if (stop) { return }
		try { 
			await page.focus(sel); //A: lanza excepcion si no pudo!
			focused= true; //A: si estoy aca es porque pudo, termina el while
		}
		catch (ex) { //A: lanzo ex, esperar y probar de nuevo
			console.log("Focus wait ("+maxSecs+") "+sel); 
			if (maxSecs-- > 0) { await sleep(1000); }
			else { throw("Focus timeout "+sel); }
		}
	}	
	console.log("Focus ok "+sel);
}


function srcFor_sel(page, selector) {
	return page.evaluate((selector) => {
		xs= document.querySelectorAll(selector);
		r= []; for (i=0; i<xs.length; i++) { r.push(xs[i].src); }
		return r;
	}, selector);
}

async function click_x(p,xpath) {
	var es= await P.wa.$x(xpath);
	await es[0].click(); //A: lanza excepcion si no pudo!
}

async function scrollUp_x(miP,marca_xpath,el_xpath, maxTries) {
	maxTries= maxTries || 100;

	var marcas= Array.isArray(marca_xpath) ? marca_xpath : [marca_xpath];
	var i=-1;
	var x;
	el_xpath= el_xpath || TAB0_x;
	while (true) { if (stop) { throw('ScrollUp stopped'); }
		if (maxTries-- < 0) { throw('ScrollUp '+marca_xpath+' not found'); }

		x= [];
		for (i=0;  i<marcas.length; i++) {	
			x= await miP.$x(marcas[i]); //A: busco la marca que puse la ultima vez que baje
			if (x.length>0) break;
		}

		L("ScrollUp "+i+" "+marca_xpath+' '+x.length+' '+maxTries);
		await sleep(10000); //A: esperar 5s que cargue! 
		if (x.length>0) { //A: subi hasta que la encontre, listo otro paso
			L("ScrollUp found "+i+" "+marca_xpath+' '+x.length+' '+maxTries);
			break; 
		} 
		await focus_sel(miP,'[tabindex="0"]'); //A: lanza excepcion si no pudo!
		await click_x(miP,el_xpath); //A: lanza excepcion si no pudo!
		await miP.keyboard.press('Home'); //A: no la encontre, apreto "home" para subir un poco
	}
	//A: llegue a la ultima marca
	L("ScrollUp done "+i+" "+marca_xpath+' '+x.length+' '+maxTries);
	return i<marcas.length ? [i,marcas[i],x] : null;
}

function x_escape(txt) {
	var p= txt.split(/'/);
	if (p.length==1) { return "'"+txt+"'"; } //A: no habia comillas
	return 'concat('+ p.map(t => ( "'"+t+"'")).join(', "\'", ')+')';
}

function x_t(txt,tag,from) { return (from||'//')+(tag || '*')+'[text()='+x_escape(txt)+']'; }
function x_class(cls,tag,from) { return (from||'//')+(tag || '*')+'[contains(concat(" ",normalize-space(@class)," ")," '+cls+'")]'; }

async function type(miP,txt) {
	var p= txt.split(/(\n)/);
	for (var i=0; i<p.length; i++) { var e= p[i];
		if (e=='\n') { await miP.keyboard.press('Enter') }
		else { await miP.keyboard.type(e); }
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


