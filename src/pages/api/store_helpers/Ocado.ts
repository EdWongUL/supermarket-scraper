/* eslint-disable no-console */
import { Knex } from 'knex';
import cheerio from 'cheerio';

export const getOcadoItems = async (
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
			// 'User-Agent':
			// 	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
			// cookie: 'TS01e025bd=0124522aadb529fa1deeb85ec909b84303f3ab141e267fc50bd6cf44326a3c334f95eedd74ecba46f1ce093a9605d22db48253bd64; QueueITAccepted-SDFrts345E-V3_ocadoshoploggedout=EventId%253Docadoshoploggedout%2526QueueId%253D00000000-0000-0000-0000-000000000000%2526RedirectType%253Ddisabled%2526IssueTime%253D1664189122%2526Hash%253D6f567167775d8b1b7fd3a608d85b742bcbe738ead33219dfbfacdc194bad6042; TS014a53e7=018ed4097b0376d32607745e05cdf0834585a52d025cbd203c1aed177fde43a4a6a960ac2acd53552e05b2979e2e0772b1aa17fe63; TS01a15a3c=0124522aadb529fa1deeb85ec909b84303f3ab141e267fc50bd6cf44326a3c334f95eedd74ecba46f1ce093a9605d22db48253bd64; LAST_REQUEST_TIME=1664190103775; W3SESSIONID=D245BCB4158484FBD92B150011A0AB54.OCADO128; BP=12; OCADOSESSIONID=0AC01B9BA8290F2EAA41A64DA13505D3C4CC8A66; TS015e15d7=0124522aadb529fa1deeb85ec909b84303f3ab141e267fc50bd6cf44326a3c334f95eedd74ecba46f1ce093a9605d22db48253bd64',
			// cache: 'no-cache',
		},
		// redirect: 'follow',
		// follow: 50,
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
		}
	}
};
