import cheerio from 'cheerio';
import { Knex } from 'knex';
import { Item } from '../getData';

export const getTescoItems = async (
	full: { children: { data: string }[] }[],
	site: {
		store_id: number;
		site_map: string;
	},
	knexInstance: Knex
) => {
	const options = {
		method: 'GET',
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
			cache: 'no-cache',
		},
	};

	for (let i = 0; i < full.length; i++) {
		const itemUrl = full[i].children[0].data;
		const item = await fetch(itemUrl, options);
		const body = await item.text();
		const $ = cheerio.load(body);
		const name = $('h1').text();
		if (name !== '') {
			// go through all the script things until we found the one with
			// attribs: {typs: 'application/ld+json'}
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

			const emptyItem = {} as Item;
			emptyItem.item_name = name;
			emptyItem.GTIN = gtin;

			// select the item from the db
			const itemResult = await knexInstance('items').where(emptyItem).select('id');
			if (itemResult.length === 0) {
				// item does not yet exist
				await knexInstance('items').insert(emptyItem);
			}
			// get the item_id
			const itemId = await knexInstance('items').where(emptyItem).select('id');
			// check price
			const priceId = await knexInstance('prices')
				.where({ store_link: itemUrl })
				.select('id');
			const priceTotal = $('.price-per-sellable-unit .value').text();
			if (priceId.length > 0) {
				// exists in price table, update the price
				await knexInstance('prices')
					.where({ store_link: itemUrl })
					.update({
						price: Number(priceTotal),
					});
			} else {
				const price = {
					item_id: itemId[0].id, //assume for the first one
					store_id: site.store_id,
					store_link: itemUrl,
					price: Number(priceTotal),
				};
				await knexInstance('prices').insert(price);
			}
		}
	}
};
