export type SlugPage = {
	id: string;
	attributes: {
		name: string;
		slug: string;
		content: string;
		createdAt: string;
		updatedAt: string;
		publishedAt: string;
	};
	meta: Meta;
	modules: Module[];
};

export type Meta = {
	id: number;
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	canonicalURL?: string;
};

export type Module = {
	id: number;
	__component: string;
};

export type ImageWrapped = {
	id: number;
	attributes: Image;
};

interface ImageFormat {
	ext: string;
	url: string;
	hash: string;
	mime: string;
	name: string;
	path?: string | null;
	size?: number;
	width: number;
	height: number;
}

export type Image = {
	id: number;
	name: string;
	alternativeText?: string;
	caption?: string;
	width: number;
	height: number;
	formats: {
		[name: string]: ImageFormat;
	};
	hash: string;
	ext: string;
	mime: string;
	size: number;
	url: string;
	previewUrl: string | null;
	provider: string;
	provider_metadata?: string | null;
	createdAt: string;
	updatedAt: string;
};

export type MediaFile = {
	name: string;
	alternativeText: string;
	caption: string;
	width: string | null;
	height: string | null;
	formats: string | null;
	hash: string;
	ext: string;
	mime: string;
	size: number;
	url: string;
	previewUrl: string | null;
	provider: string;
	provider_metadata: string | null;
	createdAt: string;
	updatedAt: string;
};

export type BlogCategory = {
	id: number;
	title: string;
	slug: string;
};

export type BlogPost = {
	id: number;
	title: string;
	slug: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	heroImage: Image;
	blogCategories: BlogCategory[];
	excerpt: string;
};

export type StaticBlog = {
	id: number;
	attributes: {
		content: string;
		createdAt: string;
		publishedAt: string;
		updatedAt: string;
		title: string;
		slug: string;
		heroImage?: Image;
	};
};
