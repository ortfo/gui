export interface Collection { "title": ({ [key in (string)]: (string) } | null); "includes": string; "description": ({ [key in (string)]: (string) } | null); "singular": string; "plural": string; }
export interface ColorPalette { "primary": string; "secondary": string; "tertiary": string; }
export interface ContentBlock { "id": string; "type": string; "anchor": string; "index": number; "alt": string; "caption": string; "relativeSource": string; "distSource": string; "contentType": string; "size": number; "dimensions": ImageDimensions; "online": boolean; "duration": number; "hasSound": boolean; "colors": ColorPalette; "thumbnails": ({ [key in (number)]: (string) } | null); "thumbnailsBuiltAt": string; "attributes": MediaAttributes; "analyzed": boolean; "content": string; "text": string; "title": string; "url": string; }
export interface DatabaseMeta { "Partial": boolean; }
export interface DirEntry { "Name": string; "IsDir": boolean; "Type": number; "Info": any; }
export interface ExternalSite { "name": string; "url": string; "purpose"?: string; "username"?: string; }
export interface ImageDimensions { "width": number; "height": number; "aspectRatio": number; }
export interface Link { "text": string; "title": string; "url": string; }
export interface LocalizedContent { "layout": ((string[] | null)[] | null); "blocks": (ContentBlock[] | null); "title": string; "footnotes": ({ [key in (string)]: (string) } | null); "abbreviations": ({ [key in (string)]: (string) } | null); }
export interface Media { "alt": string; "caption": string; "relativeSource": string; "distSource": string; "contentType": string; "size": number; "dimensions": ImageDimensions; "online": boolean; "duration": number; "hasSound": boolean; "colors": ColorPalette; "thumbnails": ({ [key in (number)]: (string) } | null); "thumbnailsBuiltAt": string; "attributes": MediaAttributes; "analyzed": boolean; }
export interface MediaAttributes { "loop": boolean; "autoplay": boolean; "muted": boolean; "playsinline": boolean; "controls": boolean; }
export interface Paragraph { "content": string; }
export interface ProgressInfoEvent { "works_done": number; "works_total": number; "work_id": string; "phase": string; "details": (string[] | null); }
export interface Settings { "theme": string; "surname": string; "projectsfolder": string; "showtips": boolean; "language": string; "portfolioLanguages": (string[] | null); "poweruser": boolean; }
export interface Tag { "singular": string; "plural": string; "description"?: string; "learnMoreAt"?: string; "aliases"?: string[]; "detect"?: { "files"?: string[]; "search"?: string[]; "madeWith"?: string[]; }; }
export interface Technology { "slug": string; "name": string; "by"?: string; "description"?: string; "learnMoreAt"?: string; "aliases"?: string[]; "files"?: string[]; "autodetect"?: string[]; }
export interface UIState { "openTab": string; "rebuildingDatabase": boolean; "editingWorkID": string; "lang": string; "metadataPaneSplitRatio": number; "scrollPositions": ({ [key in (string)]: (number) } | null); }
export interface Work { "id": string; "builtAt": string; "descriptionHash": string; "metadata": WorkMetadata; "content": ({ [key in (string)]: (LocalizedContent) } | null); "Partial": boolean; }
export interface WorkMetadata { "aliases": (string[] | null); "finished": string; "started": string; "madeWith": (string[] | null); "tags": (string[] | null); "thumbnail": string; "titleStyle": string; "colors": ColorPalette; "pageBackground": string; "wip": boolean; "private": boolean; "additionalMetadata": ({ [key in (string)]: (any) } | null); "databaseMetadata": DatabaseMeta; }
export async function analyzeMedia(arg0: string, arg1: Media): Promise<Media>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__analyzeMedia(arg0, arg1);
}
export async function clearThumbnails(): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__clearThumbnails();
}
export async function databaseRead(): Promise<({ [key in (string)]: (Work) } | null)>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__databaseRead();
}
export async function deleteWorks(arg0: (string[] | null)): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__deleteWorks(arg0);
}
export async function extractColors(arg0: string): Promise<ColorPalette>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__extractColors(arg0);
}
export async function fileserverPort(): Promise<number>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__fileserverPort();
}
export async function getBuildProgress(): Promise<ProgressInfoEvent>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__getBuildProgress();
}
export async function getUserLanguage(): Promise<string>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__getUserLanguage();
}
export async function initialize(): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__initialize();
}
export async function listDirectory(arg0: string): Promise<(DirEntry[] | null)>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__listDirectory(arg0);
}
export async function loadState(): Promise<UIState>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__loadState();
}
export async function mediaContent(arg0: string): Promise<string>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__mediaContent(arg0);
}
export async function newDir(arg0: string): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__newDir(arg0);
}
export async function newFile(arg0: string): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__newFile(arg0);
}
export async function openInBrowser(arg0: string): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__openInBrowser(arg0);
}
export async function pickFile(arg0: string, arg1: string, arg2: { "Accept": string; }, arg3: string): Promise<string>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__pickFile(arg0, arg1, arg2, arg3);
}
export async function quit(): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__quit();
}
export async function rawDescription(arg0: string): Promise<string>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__rawDescription(arg0);
}
export async function rebuildDatabase(): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__rebuildDatabase();
}
export async function rebuildWork(arg0: string): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__rebuildWork(arg0);
}
export async function saveState(arg0: UIState): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__saveState(arg0);
}
export async function settingsRead(): Promise<Settings>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__settingsRead();
}
export async function settingsWrite(arg0: Settings): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__settingsWrite(arg0);
}
export async function writeCollection(arg0: (Collection[] | null)): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__writeCollection(arg0);
}
export async function writeExternalSites(arg0: (ExternalSite[] | null)): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__writeExternalSites(arg0);
}
export async function writeRawDescription(arg0: string, arg1: string): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__writeRawDescription(arg0, arg1);
}
export async function writeTags(arg0: (Tag[] | null)): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__writeTags(arg0);
}
export async function writeTechnologies(arg0: (Technology[] | null)): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__writeTechnologies(arg0);
}
export async function writeback(arg0: Work, arg1: string): Promise<void>{
	// @ts-ignore backend__* functions are injected by the Go backend
	return backend__writeback(arg0, arg1);
}