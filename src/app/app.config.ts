import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
	provideRouter,
	withAutoCleanupInjectors,
	withComponentInputBinding,
	withInMemoryScrolling,
} from '@angular/router';
import { routes } from '@app/app.routes';
import { provideToolboxTransloco } from '@app/core/services/transloco.providers';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideServiceWorker('ngsw-worker.js', {
			enabled: !isDevMode(),
			registrationStrategy: 'registerImmediately',
		}),
		...provideToolboxTransloco(),
		provideRouter(
			routes,
			withComponentInputBinding(),
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
			withAutoCleanupInjectors(),
		),
	],
};
