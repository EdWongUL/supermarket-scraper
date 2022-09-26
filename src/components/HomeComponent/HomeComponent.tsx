/* eslint-disable no-console */
import styles from './HomeComponent.module.scss';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

export type HomeComponentProps = {
	emptyProp?: string;
};

const HomeComponent: React.ComponentType<HomeComponentProps> = ({}) => {
	const [submit, setSubmit] = useState(false); // flag for submitting selection
	const [query, setQuery] = useState(''); // selected items to be queried
	const [allItems, setAllItems] = useState<{ value: string; label: string }[]>([]); // array of many items for react-select
	const [results, setResults] = useState(''); // output of fetching results (items, store and respective prices)

	// get the initial items from the db
	useEffect(() => {
		const getItems = async () => {
			console.log('getting initial data for react-select');
			const res = await fetch('/api/getData?type=getInitial');
			const blobbed = await res.blob();
			const text = await blobbed.text();
			const items = JSON.parse(text);
			// I think this should be a JSON object?
			console.log(items);
			setAllItems(items);
		};

		setQuery('');

		const populate = async () => {
			console.log('Populating initial data');
			await fetch('/api/getData?type=populateInitial');
		};

		populate();
		// getItems();
	}, []);

	useEffect(() => {
		// fetch from the api here
		// fetch(query);

		const getData = async () => {
			const res = await fetch(`/api/getData?query=${query}`);
			const blobbed = await res.blob();
			const text = await blobbed.text();
			console.log(text);
			setResults(text);
		};

		if (query !== '') {
			getData();
		}
	}, [query]);

	// after submitted an actual query
	useEffect(() => {
		// fetch from the api here
		// fetch(query);

		const getData = async () => {
			const res = await fetch(`/api/getData?query=${query}`);
			// console.log(res);
			const blobbed = await res.blob();
			const text = await blobbed.text();
			console.log(text);
			setResults(text);
		};

		if (submit) {
			getData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [submit]);

	return (
		<div className={styles.container}>
			{allItems?.length === 0 ? (
				<div className={styles.loading}> LOADING </div>
			) : (
				<>
					<div className={styles.header}>HEADER GOES HERE</div>
					<div className={styles.form}>
						<Select
							options={allItems}
							onChange={(e) => {
								// TODO update setters when select has a change.
								console.log(e);
							}}
							isMulti
							placeholder={'placeholder'} //TODO add a placeholder at some point
						/>
						<button
							onClick={() => {
								console.log('submitting the current selection');
								setSubmit(true);
							}}
						>
							SUBMIT
						</button>
					</div>

					<div className={styles.results}>{results}</div>
				</>
			)}
		</div>
	);
};

export default HomeComponent;
