import { Knex } from 'knex';
import { Item } from '../getData';

export const getAsdaItems = async (
	full: { children: { data: string }[] }[],
	site: {
		store_id: number;
		site_map: string;
	},
	knexInstance: Knex
) => {
	for (let i = 0; i < full.length; i++) {
		const itemUrl = full[i].children[0].data;
		const itemUrlArray = itemUrl.split('/');
		const productId = Number(itemUrlArray[itemUrlArray.length - 1]);

		const options = {
			method: 'POST',
			headers: {
				cookie: 'ASDACOOKIECHECK=ASDACOOKIECHECK; akavpau_groceries-asda-main-p0=1663856455~id%3De42c47ce69c03cc8a09cb93dd1bdea34; akavpau_groceries-asda-api-p0=1663937261~id%3D4ede397af23c9b262b43d426853d1293; TS01faa68d=01538efd7c7405af665bb53c6c2b1eb819b7e526137aa2b0b8efcbe7f238c140a95897d7738e5bb86e279e82d05b618c8779be3ad0',
				'cache-control': 'no-cache',
				'content-type': 'application/json',
				origin: 'https://groceries.asda.com',
				'request-origin': 'gi',
				'user-agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
			},
			body: `{"requestorigin":"gi","contract":"web/cms/product-details-page","variables":{"is_eat_and_collect":false,"store_id":"4565","type":"content","page_size":60,"page":1,"request_origin":"gi","ship_date":1663804800000,"payload":{"page_id":"${productId}","page_type":"productDetailsPage","page_meta_info":true}}}`,
		};

		const temp = await fetch('https://groceries.asda.com/api/bff/graphql', options);
		const jsonData = await temp.json();
		const priceTotal = Number(
			jsonData.data.tempo_cms_content.zones[0].configs.products.items[0].price.price_info.price.slice(
				1
			)
		);
		const name =
			jsonData.data.tempo_cms_content.zones[0].configs.products.items[0].item.item_name;
		const gtin = jsonData.data.tempo_cms_content.zones[0].configs.products.items[0].price.upc;

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
		const priceId = await knexInstance('prices').where({ store_link: itemUrl }).select('id');
		if (priceId.length > 0) {
			// exists in price table, update the price
			await knexInstance('prices').where({ store_link: itemUrl }).update({
				price: priceTotal,
			});
		} else {
			const price = {
				item_id: itemId[0].id, //assume for the first one
				store_id: site.store_id,
				store_link: itemUrl,
				price: priceTotal,
			};
			await knexInstance('prices').insert(price);
		}
	}
};
