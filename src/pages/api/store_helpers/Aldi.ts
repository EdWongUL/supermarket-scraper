/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import cheerio from 'cheerio';
import { Knex } from 'knex';
// import { Item } from '../getData';

export const getAldiItems = async (
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
			cache: 'no-cache',
		},
	};

	for (let i = 0; i < full.length; i++) {
		const itemUrl = full[i].children[0].data;
		const item = await fetch(itemUrl, options);
		// console.log(item);
		const body = await item.text();
		// console.log(body);
		const $ = cheerio.load(body);
		const name = $('h1').text();
		console.log(name);
		if (name !== '') {
			const price = $('span.product-price__value').text();
			console.log(price);
		}
	}
};
