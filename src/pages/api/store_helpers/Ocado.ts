/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Knex } from 'knex';
import cheerio from 'cheerio';

export const getOcadoItems = async (
	full: { children: { data: string }[] }[],
	_site: {
		store_id: number;
		site_map: string;
	},
	_knexInstance: Knex
) => {
	const options = {
		method: 'GET',
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
			'Content-Type': 'text/html; charset=utf-8',
			redirect: 'follow',
		},
		follow: 1000,
	};
	for (let i = 0; i < full.length; i++) {
		console.log(i);
		const itemUrl = full[i].children[0].data;
		console.log(itemUrl);

		const item = await fetch(itemUrl, options);

		const body = await item.text();
		const $ = cheerio.load(body);
		const name = $('header.bop-title h1').text();
		if (name !== '') {
			console.log(name);

			console.log($.html());
			return;

			const allScripts = $('script').get();
			let gtin = 0;
			allScripts.map((scriptObject) => {
				if (scriptObject.attribs.type === 'application/ld+json') {
					const foundScript = JSON.parse(scriptObject.children[0].data);
					foundScript.map((el: { gtin13: null | number }) => {
						if (el.gtin13) {
							gtin = el.gtin13;
						}
					});
				}
			});

			if (gtin === 0) {
				return;
			}

			const priceTotal = $('h2.bop-price__current').text();
			console.log(priceTotal);
		}
	}
};
