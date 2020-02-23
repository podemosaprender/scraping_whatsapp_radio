//INFO: bajar audios desde la ultima marca
stop= false;
async function focus_selector(page, sel) {
	var focused= false;
	while (!focused) { if (stop) { return }
		try { 
			await page.focus(sel); //A: lanza excepcion si no pudo!
			focused= true; //A: si estoy aca es porque pudo, termina el while
		}
		catch (ex) { //A: lanzo ex, esperar y probar de nuevo
			console.log("Wait focus "+sel); 
			await sleep(1000); 
		}
	}	
	console.log("Focused "+sel);
}

function fname_safe(s) {
	return (s||'_').replace(/[^A-Za-z0-9_-]+/g,'_');
}

(async () => {
	if (!global.Fb_p) {
		Fb_p= await Browser.newPage();
		await Fb_p.goto('https://facebook.com/groups/PodemosAprender');
	}

	await focus_selector(Fb_p,'[placeholder="Scrivi qualcosa..."]');
	await Fb_p.keyboard.type('Escuchalo en https://www.podemosaprender.org/data_radio/#/radio/');
	await Fb_p.keyboard.press('Enter');

	await sleep(1000);
	var es= await Fb_p.$x('//*[text()="Pubblica"]');
	console.log(es);
	await es[0].click(); //A: lanza excepcion si no pudo!

	console.log("done");
})();
