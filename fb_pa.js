//INFO: bajar audios desde la ultima marca
stop= false;
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
