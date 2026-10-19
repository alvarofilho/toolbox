import { validateKubernetes } from '@app/features/tools/infrastructure/kubernetes';

import { tool } from '@app/features/tools/_shared/definition';

import { source, input } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

const k8sHint = text(
	'Schemas locais estritos do Kubernetes 1.35.0 para 16 tipos comuns. Para outra versão ou CRD, forneça o JSON Schema. Não substitui validação do servidor/admission.',
	'Bundled strict Kubernetes 1.35.0 schemas for 16 common kinds. Supply a JSON Schema for another version or CRD. Does not replace server/admission validation.',
	undefined,
	'tools.kubernetes',
);

export const definition = tool(
	'kubernetes',
	[
		source,
		input(
			'schema',
			'JSON Schema da versão/CRD (opcional)',
			'Version/CRD JSON Schema (optional)',
			undefined,
			undefined,
			'tools.kubernetes',
		),
	],
	(v) => validateKubernetes(field(v, 'input'), field(v, 'schema')),
	{
		input:
			'apiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n    - name: nginx\n      image: nginx:alpine',
	},
	k8sHint,
);
