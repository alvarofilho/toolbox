import ipaddr from 'ipaddr.js';
import { parse as shellParse } from 'shell-quote';
import { stringify } from 'yaml';
import { validateKubernetes } from './kubernetes';
import { compare } from 'fast-json-patch';
import {
  tool,
  source,
  second,
  input,
  select,
  field,
  result,
  object,
  json,
  preview,
  escapeHtml,
  text,
} from './common';
import { parseDocument } from './development';

export function subnet(value: string): Record<string, unknown> {
  const [address, prefix] = ipaddr.parseCIDR(value.trim());
  const bytes = address.toByteArray(),
    bits = bytes.length * 8;
  let integer = 0n;
  for (const byte of bytes) integer = (integer << 8n) | BigInt(byte);
  const size = 1n << BigInt(bits - prefix),
    network = (integer / size) * size,
    last = network + size - 1n;
  const format = (n: bigint): string => {
    const b = Array.from({ length: bytes.length }, (_, i) =>
      Number((n >> BigInt((bytes.length - 1 - i) * 8)) & 255n),
    );
    return ipaddr.fromByteArray(b).toString();
  };
  const mask = ((1n << BigInt(bits)) - 1n) ^ ((1n << BigInt(bits - prefix)) - 1n);
  return {
    family: address.kind(),
    address: address.toString(),
    prefix,
    network: format(network),
    last: format(last),
    netmask: format(mask),
    cidr: `${format(network)}/${prefix}`,
    totalAddresses: size.toString(),
    ...(bits === 32
      ? {
          broadcast: format(last),
          firstHost: format(prefix >= 31 ? network : network + 1n),
          lastHost: format(prefix >= 31 ? last : last - 1n),
          usableHosts: (prefix >= 31 ? size : size - 2n).toString(),
        }
      : {}),
    range: address.range(),
  };
}

export function parseEnv(value: string): {
  values: Record<string, string>;
  duplicates: string[];
  references: string[];
} {
  const values: Record<string, string> = {},
    duplicates: string[] = [],
    references = new Set<string>();
  Object.setPrototypeOf(values, null);
  const lines = value.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]*)$/.exec(line);
    if (!m) throw new Error(`Linha ${i + 1}: atribuição inválida / invalid assignment`);
    const key = m[1];
    let val = m[2];
    const quote = val[0];
    if (quote === '"' || quote === "'") {
      while (!new RegExp(`${quote}(?:\\s*#.*)?$`).test(val.slice(1)) && i < lines.length - 1)
        val += '\n' + lines[++i];
      const match = new RegExp(`^${quote}([\\s\\S]*)${quote}\\s*(?:#.*)?$`).exec(val);
      if (!match) throw new Error(`Aspas não fechadas / Unclosed quotes: ${key}`);
      val = match[1];
      if (quote === '"')
        val = val
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
    } else val = val.replace(/\s+#.*$/, '').trim();
    if (Object.hasOwn(values, key)) duplicates.push(key);
    values[key] = val;
    if (quote !== "'")
      for (const ref of val.matchAll(/\$\{([A-Za-z_][\w]*)\}/g)) references.add(ref[1]);
  }
  return { values, duplicates, references: [...references] };
}

export function dockerCompose(command: string): unknown {
  const tokens = shellParse(command, (k) => `\${${k}}`);
  if (tokens.some((t) => typeof t !== 'string'))
    throw new Error('Operadores shell não são aceitos / Shell operators are not accepted');
  const args = tokens.filter((t): t is string => typeof t === 'string');
  if (args.shift() !== 'docker' || args.shift() !== 'run') throw new Error('Use docker run ...');
  const service: Record<string, unknown> = {},
    ports: string[] = [],
    volumes: string[] = [],
    environment: string[] = [],
    networks: string[] = [];
  let name = 'app';
  while (args.length) {
    const raw = args.shift();
    if (!raw) break;
    if (raw === '--') break;
    if (!raw.startsWith('-')) {
      service['image'] = raw;
      break;
    }
    const equal = raw.indexOf('='),
      flag = equal >= 0 ? raw.slice(0, equal) : raw;
    if (['-d', '--detach', '--rm', '-it', '-i', '-t', '--interactive', '--tty'].includes(flag)) {
      if (flag.includes('i')) service['stdin_open'] = true;
      if (flag === '-t' || flag === '-it' || flag === '--tty') service['tty'] = true;
      continue;
    }
    const value = equal >= 0 ? raw.slice(equal + 1) : args.shift();
    if (!value) throw new Error(`Valor ausente / Missing value: ${flag}`);
    switch (flag) {
      case '--name':
        name = value;
        break;
      case '-p':
      case '--publish':
        ports.push(value);
        break;
      case '-v':
      case '--volume':
        volumes.push(value);
        break;
      case '-e':
      case '--env':
        environment.push(value);
        break;
      case '--network':
        networks.push(value);
        break;
      case '--restart':
        service['restart'] = value;
        break;
      case '-w':
      case '--workdir':
        service['working_dir'] = value;
        break;
      case '-u':
      case '--user':
        service['user'] = value;
        break;
      case '--entrypoint':
        service['entrypoint'] = [value];
        break;
      case '--hostname':
        service['hostname'] = value;
        break;
      case '--env-file':
        service['env_file'] = [value];
        break;
      default:
        throw new Error(`Opção não suportada / Unsupported option: ${flag}`);
    }
  }
  if (!service['image']) {
    const image = args.shift();
    if (image) service['image'] = image;
  }
  if (!service['image']) throw new Error('Imagem ausente / Missing image');
  if (args.length) service['command'] = args;
  if (ports.length) service['ports'] = ports;
  if (volumes.length) service['volumes'] = volumes;
  if (environment.length) service['environment'] = environment;
  if (networks.length) service['networks'] = networks;
  return {
    services: { [name]: service },
    ...(networks.length
      ? { networks: Object.fromEntries(networks.map((n) => [n, { external: true }])) }
      : {}),
  };
}
const ignores: Record<string, string> = {
  node: 'node_modules/\ndist/\ncoverage/\n*.log\n.env\n.env.*\n!.env.example',
  angular: '.angular/\nout-tsc/\nnode_modules/\ndist/',
  dotnet: 'bin/\nobj/\n.vs/\nTestResults/\n*.user\n*.suo',
  python: '__pycache__/\n*.py[cod]\n.venv/\nvenv/\n.pytest_cache/\n.env',
  rust: 'target/\n**/*.rs.bk',
  windows: 'Thumbs.db\nDesktop.ini\n$RECYCLE.BIN/',
  macos: '.DS_Store\n._*',
  vscode: '.vscode/*\n!.vscode/extensions.json\n!.vscode/settings.json',
};
const k8sHint = text(
  'Schemas locais estritos do Kubernetes 1.35.0 para 16 tipos comuns. Para outra versão ou CRD, forneça o JSON Schema. Não substitui validação do servidor/admission.',
  'Bundled strict Kubernetes 1.35.0 schemas for 16 common kinds. Supply a JSON Schema for another version or CRD. Does not replace server/admission validation.',
);
export const definitions = [
  tool(
    'ipv4',
    [source],
    (v) => {
      const r = subnet(field(v, 'input'));
      if (r['family'] !== 'ipv4') throw new Error('Use IPv4/CIDR');
      return result(r);
    },
    { input: '192.168.1.10/24' },
  ),
  tool('cidr', [source], (v) => result(subnet(field(v, 'input'))), { input: '10.0.0.0/16' }),
  tool(
    'ipv6',
    [source],
    (v) => {
      const value = field(v, 'input').trim();
      const r = subnet(value.includes('/') ? value : `${value}/128`);
      if (r['family'] !== 'ipv6') throw new Error('Use IPv6');
      const address = ipaddr.parse(value.split('/')[0]);
      return result({
        ...r,
        expanded: address.toNormalizedString(),
        compressed: address.toString(),
      });
    },
    { input: '2001:db8::1/64' },
  ),
  tool(
    'chmod',
    [source],
    (v) => {
      const value = field(v, 'input').trim();
      let n: number;
      if (/^[0-7]{3,4}$/.test(value)) n = parseInt(value, 8);
      else if (/^[r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-]$/.test(value)) {
        n = 0;
        for (let i = 0; i < 9; i++) {
          const c = value[i];
          if ((i % 3 < 2 && c !== '-') || (i % 3 === 2 && /[xst]/.test(c))) n |= 1 << (8 - i);
        }
        if (/[sS]/.test(value[2])) n |= 0o4000;
        if (/[sS]/.test(value[5])) n |= 0o2000;
        if (/[tT]/.test(value[8])) n |= 0o1000;
      } else throw new Error('Use 755 ou rwxr-xr-x / Use 755 or rwxr-xr-x');
      const symbolic = Array.from({ length: 9 }, (_, i) =>
        n & (1 << (8 - i)) ? 'rwx'[i % 3] : '-',
      );
      for (const [index, bit, on, off] of [
        [2, 0o4000, 's', 'S'],
        [5, 0o2000, 's', 'S'],
        [8, 0o1000, 't', 'T'],
      ] as const)
        if (n & bit) symbolic[index] = symbolic[index] === 'x' ? on : off;
      return result({
        octal: n.toString(8).padStart(3, '0'),
        symbolic: symbolic.join(''),
        owner: (n >> 6) & 7,
        group: (n >> 3) & 7,
        others: n & 7,
      });
    },
    { input: '755' },
  ),
  tool(
    'docker-compose',
    [source],
    (v) => result(stringify(dockerCompose(field(v, 'input'))), 'compose.yaml'),
    {
      input:
        'docker run -d --name web -p 8080:80 -e NODE_ENV=production -v ./data:/data nginx:alpine',
    },
    text(
      'Converte comandos docker run POSIX. Opções sem correspondência suportada são rejeitadas com uma mensagem.',
      'Converts POSIX docker run commands. Options without a supported mapping are rejected with a message.',
    ),
  ),
  tool(
    'compose-viewer',
    [source],
    (v) => {
      const doc = object(parseDocument(field(v, 'input'))),
        services = object(doc['services']);
      const rows = Object.entries(services).map(([name, value]) => ({ name, ...object(value) }));
      return {
        ...result({
          services: rows,
          networks: doc['networks'] ?? {},
          volumes: doc['volumes'] ?? {},
        }),
        preview: preview(
          `<h1>Docker Compose</h1><div style="display:flex;flex-wrap:wrap;gap:16px">${rows.map((s) => `<section style="border:1px solid #9ca;padding:16px;border-radius:8px;max-width:300px"><h2>${escapeHtml(s.name)}</h2><pre>${escapeHtml(JSON.stringify(s, null, 2))}</pre></section>`).join('')}</div>`,
        ),
      };
    },
    {
      input:
        'services:\n  web:\n    image: nginx:alpine\n    ports: ["8080:80"]\n    depends_on: [db]\n  db:\n    image: postgres:17',
    },
  ),
  tool(
    'env-diff',
    [source, second],
    (v) => {
      const a = parseEnv(field(v, 'input')),
        b = parseEnv(field(v, 'second'));
      return result({
        patch: compare(a.values, b.values),
        duplicates: { first: a.duplicates, second: b.duplicates },
      });
    },
    { input: 'PORT=3000\nMODE=dev', second: 'PORT=8080\nMODE=production\nDEBUG=false' },
  ),
  tool(
    'env-validator',
    [source],
    (v) => {
      const parsed = parseEnv(field(v, 'input')),
        unresolved = parsed.references.filter((k) => !Object.hasOwn(parsed.values, k));
      return result({
        valid: !parsed.duplicates.length && !unresolved.length,
        keys: Object.keys(parsed.values),
        duplicates: parsed.duplicates,
        unresolvedReferences: unresolved,
        emptyValues: Object.keys(parsed.values).filter((k) => !parsed.values[k]),
      });
    },
    { input: 'PORT=3000\nHOST=localhost\nURL="http://${HOST}:${PORT}"' },
  ),
  tool(
    'gitignore',
    [
      input(
        'input',
        'Templates separados por vírgula: node, angular, dotnet, python, rust, windows, macos, vscode',
        'Comma-separated templates: node, angular, dotnet, python, rust, windows, macos, vscode',
        'node,windows,vscode',
        'text',
      ),
    ],
    (v) =>
      result(
        field(v, 'input')
          .split(',')
          .map((s) => {
            const key = s.trim().toLowerCase();
            if (!ignores[key]) throw new Error(`Template desconhecido / Unknown template: ${key}`);
            return `# ${key}\n${ignores[key]}`;
          })
          .join('\n\n') + '\n',
        '.gitignore',
      ),
  ),
  tool(
    'kubernetes',
    [
      source,
      input('schema', 'JSON Schema da versão/CRD (opcional)', 'Version/CRD JSON Schema (optional)'),
    ],
    (v) => validateKubernetes(field(v, 'input'), field(v, 'schema')),
    {
      input:
        'apiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n    - name: nginx\n      image: nginx:alpine',
    },
    k8sHint,
  ),
  tool(
    'log-parser',
    [
      source,
      select('format', 'Formato', 'Format', [
        ['json', 'JSON Lines', 'JSON Lines'],
        ['combined', 'Apache/Nginx combined', 'Apache/Nginx combined'],
      ]),
    ],
    (v) => {
      const lines = field(v, 'input').split(/\r?\n/).filter(Boolean);
      if (lines.length > 5000) throw new Error('Máximo 5.000 linhas / Maximum 5,000 lines');
      return result(
        lines.map((line, index) => {
          if (field(v, 'format') === 'json') return object(json(line));
          const m =
            /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d{3}) (\d+|-) "([^"]*)" "([^"]*)"$/.exec(
              line,
            );
          if (!m) throw new Error(`Linha ${index + 1} inválida / Invalid line ${index + 1}`);
          return {
            ip: m[1],
            identity: m[2],
            user: m[3],
            time: m[4],
            request: m[5],
            status: Number(m[6]),
            bytes: m[7] === '-' ? 0 : Number(m[7]),
            referer: m[8],
            userAgent: m[9],
          };
        }),
      );
    },
    {
      input:
        '{"level":"info","message":"Started","timestamp":"2026-01-01T00:00:00Z"}\n{"level":"error","message":"Test failure"}',
    },
  ),
];
