const schemas: Readonly<Record<string, () => Promise<{ default: unknown }>>> = {
	'v1/Pod': () => import('./schemas/pod-v1.json'),
	'v1/Service': () => import('./schemas/service-v1.json'),
	'v1/ConfigMap': () => import('./schemas/configmap-v1.json'),
	'v1/Secret': () => import('./schemas/secret-v1.json'),
	'v1/Namespace': () => import('./schemas/namespace-v1.json'),
	'v1/PersistentVolumeClaim': () => import('./schemas/persistentvolumeclaim-v1.json'),
	'v1/ServiceAccount': () => import('./schemas/serviceaccount-v1.json'),
	'apps/v1/Deployment': () => import('./schemas/deployment-apps-v1.json'),
	'apps/v1/StatefulSet': () => import('./schemas/statefulset-apps-v1.json'),
	'apps/v1/DaemonSet': () => import('./schemas/daemonset-apps-v1.json'),
	'batch/v1/Job': () => import('./schemas/job-batch-v1.json'),
	'batch/v1/CronJob': () => import('./schemas/cronjob-batch-v1.json'),
	'networking.k8s.io/v1/Ingress': () => import('./schemas/ingress-networking-v1.json'),
	'networking.k8s.io/v1/NetworkPolicy': () => import('./schemas/networkpolicy-networking-v1.json'),
	'rbac.authorization.k8s.io/v1/Role': () => import('./schemas/role-rbac-v1.json'),
	'rbac.authorization.k8s.io/v1/RoleBinding': () => import('./schemas/rolebinding-rbac-v1.json'),
};
export async function kubernetesSchema(apiVersion: unknown, kind: unknown): Promise<unknown> {
	if (typeof apiVersion !== 'string' || typeof kind !== 'string') {
		throw new Error('apiVersion e kind obrigatórios / apiVersion and kind required');
	}
	const load = schemas[`${apiVersion}/${kind}`];
	if (!load) {
		throw new Error(
			`Tipo sem schema local: ${apiVersion}/${kind}. Forneça o JSON Schema da versão ou CRD. / No bundled schema; supply a version or CRD JSON Schema.`,
		);
	}
	return (await load()).default;
}
