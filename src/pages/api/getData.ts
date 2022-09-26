/* eslint-disable no-console */
import { NextApiRequest, NextApiResponse } from 'next';
import { Knex } from 'knex';
import cheerio from 'cheerio';
import { getTescoItems } from './store_helpers/Tesco';
import { getAsdaItems } from './store_helpers/Asda';
// import { getOcadoItems } from './store_helpers/Ocado';
// import { getAldiItems } from './store_helpers/Aldi';
// import { getMorrisonsItems } from './store_helpers/Morrisons';

const config: Knex.Config = {
	client: 'sqlite3',
	connection: {
		filename: 'supermarket.db',
	},
	useNullAsDefault: true,
};

const tables = ['items', 'prices', 'stores'];

// eslint-disable-next-line @typescript-eslint/no-var-requires
const knexInstance = require('knex')(config) as Knex;

const createData = async (knexInstance: Knex, table: string) => {
	if (table === 'items') {
		return await knexInstance.schema.createTable(table, (table) => {
			table.integer('id').primary;
			table.string('item_name');
		});
	} else if (table === 'prices') {
		return await knexInstance.schema.createTable(table, (table) => {
			table.integer('id').primary;
			table.integer('item_id');
			table.integer('store_id');
			table.string('store_link');
			table.integer('price');
			table.integer('special_price');
		});
	} else if (table === 'stores') {
		return await knexInstance.schema.createTable(table, (table) => {
			table.integer('id').primary;
			table.string('name');
			table.string('url');
			table.string('site_map');
		});
	}
};

// check tables exist ONCE outside any request to prevent performance loss
tables.map(async (table) => {
	console.log('checking for table info:');
	console.log(table);
	const exists = await knexInstance.schema.hasTable(table);

	if (!exists) {
		await createData(knexInstance, table);
	}
});

export type Item = {
	item_name: string;
	GTIN: number;
	[key: string]: number | string;
};

const initialPopulation = async (res: NextApiResponse) => {
	// 1. knex to get site map, Go to site map (fetch), iterate through the product urls
	// 2. Fetch the product urls, and populate the item table
	// 3. Find the price and quantity of the item and populate the prices table
	const site_maps = await knexInstance('store_sitemaps').select('store_id', 'site_map');

	console.log(site_maps);

	site_maps.map(async (site: { store_id: number; site_map: string }) => {
		const response = await fetch(site.site_map, {
			method: 'GET',
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
				cache: 'no-cache',
			},
		});
		const body = await response.text();
		const $ = cheerio.load(body);
		const full = $('loc').get() as never[];

		if (site.store_id === 1) {
			await getTescoItems(full, site, knexInstance);
		} else if (site.store_id === 3) {
			await getAsdaItems(full, site, knexInstance);
		} else if (site.store_id === 4) {
			// TODO ocado doesn't work due to redirects?
			// await getOcadoItems(full, site, knexInstance);
		} else if (site.store_id === 5) {
			// TODO aldi seems very inconsistent, with many items no longer on sale
			// await getAldiItems(full, site, knexInstance);
		} else if (site.store_id === 6) {
			// TODO also gets redirect error
			// await getMorrisonsItems(full, site, knexInstance);
		}
	});

	res.send('');
};

const getData = async (query: string, res: NextApiResponse) => {
	// EASY: knex query for each item id (return prices from each store).
	// HARDER: if the item has not been updated in a while, fetch the item url and
	// 	update it. Return this new price.
	console.log(query);
	res.send('');
};

const getInitialData = async (res: NextApiResponse) => {
	// use knex to return the items so the react-search can go through them
	// just names of items, into a json thing
	res.send(JSON.stringify([{ value: 'bananas', label: 'Bananas' }]));
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.query.type === 'getInitial') {
		// For populating react-select so the user can search through the items
		console.log('Handler in API called, getting initial data.');
		getInitialData(res);
	} else if (req.query.type === 'query') {
		// After a user has submitted a list
		console.log('Handler in API called with query:');
		console.log(req.query);
		if (typeof req.query.query === 'string') {
			getData(req.query.query, res);
		}
	} else if (req.query.type === 'populateInitial') {
		// Initial submit
		console.log('Populate initial db');
		initialPopulation(res);
	} else {
		res.statusMessage = 'invalid query types';
		res.status(400).end();
	}
};

export default handler;
