/// <reference lib="webworker" />
import {
	processPdfPages,
	type PdfPagesMessage,
} from '@app/features/tools/text/pdf-pages-processor';

self.addEventListener('message', async (event: MessageEvent<PdfPagesMessage>) => {
	try {
		const result = await processPdfPages(event.data);
		self.postMessage(result, [result.output]);
	} catch (error: unknown) {
		self.postMessage({ error: error instanceof Error ? error.message : 'invalid_pdf' });
	}
});
