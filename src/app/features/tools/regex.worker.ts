/// <reference lib="webworker" />
import { regexMatches } from '../../shared/utils/regex';

addEventListener(
  'message',
  ({ data }: MessageEvent<{ pattern: string; flags: string; input: string }>) => {
    try {
      postMessage({
        output: JSON.stringify(regexMatches(data.pattern, data.flags, data.input), null, 2),
      });
    } catch (error: unknown) {
      postMessage({ error: error instanceof Error ? error.message : String(error) });
    }
  },
);
