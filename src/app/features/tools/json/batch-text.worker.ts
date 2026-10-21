/// <reference lib="webworker" />
import { transformBatchText } from '@app/features/tools/json/batch-text-processor';

interface BatchMessage {
	readonly text: string;
	readonly operation: string;
	readonly indent: string;
}

addEventListener('message', (event: MessageEvent<BatchMessage>) => {
	try {
		postMessage({
			output: transformBatchText(event.data.text, event.data.operation, event.data.indent),
		});
	} catch (error: unknown) {
		postMessage({ error: error instanceof Error ? error.message : String(error) });
	}
});
