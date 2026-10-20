(() => {
	let theme =
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
	try {
		const preferences = JSON.parse(localStorage.getItem('toolbox.preferences.v1') ?? 'null');
		if (preferences?.themeMode === 'light' || preferences?.themeMode === 'dark') {
			theme = preferences.themeMode;
		} else if (preferences?.theme === 'dark') {
			theme = 'dark';
		}
	} catch {
		// Browser storage can be unavailable; the system preference is still usable.
	}
	document.documentElement.dataset.theme = theme;
})();
