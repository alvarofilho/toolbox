import { mkdir, writeFile } from 'node:fs/promises';

const repository = 'yannh/kubernetes-json-schema';
const api = await fetch(`https://api.github.com/repos/${repository}/commits/master`);
if (!api.ok) throw new Error(`GitHub: ${api.status}`);
const { sha } = await api.json();
if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Invalid upstream commit');
const version = 'v1.35.0-standalone-strict';
const files = [
  'pod-v1',
  'service-v1',
  'configmap-v1',
  'secret-v1',
  'namespace-v1',
  'persistentvolumeclaim-v1',
  'serviceaccount-v1',
  'deployment-apps-v1',
  'statefulset-apps-v1',
  'daemonset-apps-v1',
  'job-batch-v1',
  'cronjob-batch-v1',
  'ingress-networking-v1',
  'networkpolicy-networking-v1',
  'role-rbac-v1',
  'rolebinding-rbac-v1',
];
const directory = new URL('../src/app/features/tools/extended/schemas/', import.meta.url);
await mkdir(directory, { recursive: true });
const base = `https://raw.githubusercontent.com/${repository}/${sha}`;
await Promise.all(
  files.map(async (name) => {
    const response = await fetch(`${base}/${version}/${name}.json`);
    if (!response.ok) throw new Error(`${name}: ${response.status}`);
    const schema = await response.json();
    await writeFile(new URL(`${name}.json`, directory), JSON.stringify(schema, null, 2) + '\n');
  }),
);
const license = await fetch(`${base}/LICENSE`);
if (!license.ok) throw new Error('License fetch failed');
await writeFile(new URL('LICENSE', directory), await license.text());
await writeFile(
  new URL('SOURCE.md', directory),
  `# Kubernetes schemas\n\nSource: https://github.com/${repository}/tree/${sha}/${version}\n\nKubernetes 1.35.0 standalone strict schemas, derived upstream from Kubernetes OpenAPI. Schema content is preserved with normalized formatting and loaded locally on demand. Run \`node scripts/update-kubernetes-schemas.mjs\` to refresh and review the upstream commit.\n`,
);
process.stdout.write(`Vendored ${files.length} schemas from ${sha}\n`);
