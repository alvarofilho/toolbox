import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const paths: Readonly<Record<string, string>> = {
	box: 'M4 8h16v12H4z M8 8V5h8v3 M4 12h16 M10 12v3h4v-3',
	home: 'm3 10 9-7 9 7 M5 9v12h5v-7h4v7h5V9',
	grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
	star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z',
	clock: 'M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
	search: 'M20 20l-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
	braces: 'M8 3H6v6l-3 3 3 3v6h2 M16 3h2v6l3 3-3 3v6h-2',
	arrows: 'M4 7h16m-4-4 4 4-4 4 M20 17H4m4-4-4 4 4 4',
	spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
	shield: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z m-4 9 3 3 5-6',
	code: 'm8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18',
	type: 'M3 5h12 M9 5v15 M16 12h5 M18.5 12v8 M5 20h8',
	document: 'M14 3H5v18h14V8z M14 3v5h5 M8 12h8 M8 16h5',
	compress: 'M3 8h6V2 M9 8 3 2 M21 16h-6v6 M15 16l6 6',
	diff: 'M3 6h8 M7 2v8 M14 17h8 M3 15h5 M16 4h5 M4 21h5',
	link: 'm10 13 4-4 M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0 M16 8l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
	fingerprint:
		'M5 10a7 7 0 0 1 14 0v4 M8 11a4 4 0 0 1 8 0v5 M11 12v5l-2 4 M5 14v2l-2 3 M14 20l2-2 M19 17v3',
	key: 'M12 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z M12 12h10v4 M18 12v3',
	hash: 'M9 3 7 21 M17 3l-2 18 M3 9h18 M2 15h18',
	scan: 'M8 3H3v5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M7 8h10 M7 12h10 M7 16h6',
	regex: 'M4 17h.01 M10 5v12 M5 8l10 6 M15 8 5 14 M19 16h.01',
	building: 'M4 21V7h9v14 M13 3h7v18 M7 10h3 M7 14h3 M16 7h1 M16 11h1 M16 15h1 M7 21v-3h3v3',
	users:
		'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3 M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M18 3a4 4 0 0 1 0 8 M18 15a4 4 0 0 1 4 4v2',
	'file-code': 'M14 3H5v18h14V8z M14 3v5h5 m-9 3-3 3 3 3 m4-6 3 3-3 3',
	sun: 'M12 3V1 M12 23v-2 M3 12H1 M23 12h-2 M5 5 3 3 M21 21l-2-2 M3 21l2-2 M19 5l2-2 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
	moon: 'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11',
	github:
		'M9 20c-5 1-5-3-7-3 M15 23v-4c0-1 .1-2-.5-2.5 4-.5 7-2 7-6a5 5 0 0 0-1.5-3.5 4 4 0 0 0-.1-3.5s-1.5-.5-4.5 1a15 15 0 0 0-8 0C4.5 3 3 3.5 3 3.5a4 4 0 0 0 0 3.5A5 5 0 0 0 1.5 10.5c0 4 3 5.5 7 6C8 17 8 18 8 19v4',
	arrow: 'M4 12h16 m-6-6 6 6-6 6',
	check: 'm5 12 4 4L19 6',
	menu: 'M4 6h16 M4 12h16 M4 18h16',
	close: 'm6 6 12 12 M6 18 18 6',
	copy: 'M8 8h13v13H8z M16 4V2H2v14h2',
	download: 'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',
	eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
	database:
		'M4 5c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2Z M4 5v14c0 1.1 3.6 2 8 2s8-.9 8-2V5 M4 12c0 1.1 3.6 2 8 2s8-.9 8-2',
	calendar:
		'M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16 M8 14h.01 M12 14h.01 M16 14h.01 M8 18h.01 M12 18h.01',
	globe:
		'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z M3 12h18 M12 3a15 15 0 0 1 0 18 M12 3a15 15 0 0 0 0 18',
	network:
		'M12 12 5 5 M12 12l7-7 M12 12l-7 7 M12 12l7 7 M5 3h.01 M19 3h.01 M5 21h.01 M19 21h.01 M12 12h.01',
	terminal: 'm4 17 5-5-5-5 M12 19h8',
	image: 'M4 4h16v16H4z M8 10h.01 M20 15l-5-5L5 20',
	table: 'M3 4h18v16H3z M3 10h18 M9 4v16 M15 4v16',
	lock: 'M5 10h14v11H5z M8 10V7a4 4 0 1 1 8 0v3 M12 14v3',
	list: 'M9 6h12 M9 12h12 M9 18h12 M4 6h.01 M4 12h.01 M4 18h.01',
	palette:
		'M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.7-3.1 1.7 1.7 0 0 1 1.4-2.6H18a3 3 0 0 0 3-3c0-5.1-4-9.3-9-9.3Z M7.5 11h.01 M10 7.5h.01 M15 8h.01 M17 12h.01',
};
@Component({
	selector: 'app-icon',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './icon.html',
	host: { 'aria-hidden': 'true' },
})
export class Icon {
	readonly name = input('box');
	protected readonly path = computed(() => paths[this.name()] ?? paths['box']);
}
