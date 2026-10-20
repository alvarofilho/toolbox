import { validateKubernetes } from '@app/features/tools/infrastructure/kubernetes';

import { tool } from '@app/features/tools/_shared/definition';

import { source, input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

const k8sHint = 'tools.kubernetes.bundled_strict_kubernetes_1_35_0_schemas_f';

export const definition = tool(
	'kubernetes',
	[
		source,
		input('schema', 'tools.kubernetes.version_crd_json_schema_optional', undefined, undefined),
	],
	(v) => validateKubernetes(field(v, 'input'), field(v, 'schema')),
	{
		input:
			'apiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n    - name: nginx\n      image: nginx:alpine',
	},
	k8sHint,
);
