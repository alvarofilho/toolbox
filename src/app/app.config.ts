import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from '@app/app.routes';
import { provideToolboxTransloco } from '@app/core/services/transloco.providers';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		...provideToolboxTransloco(),
		provideRouter(
			routes,
			withComponentInputBinding(),
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
		),
	],
};
