import * as pulumi from '@pulumi/pulumi';
import * as awsx from '@pulumi/awsx';
import * as k8s from '@pulumi/kubernetes';
import { config as pulumiConfig } from './config';

const lagoNFTCrawlerEcrRepository = new awsx.ecr.Repository(
  'lago-nft-crawler-ecr-repo',
);
const lagoNFTCrawlerDockerImage =
  lagoNFTCrawlerEcrRepository.buildAndPushImage('../');
const clusterStackRef = pulumiConfig.clusterStackRef;
const kubeconfig = clusterStackRef.getOutput('kubeconfig');
const k8sProvider = new k8s.Provider('k8sProvider', { kubeconfig });

// Create configmap
const configmap = new k8s.core.v1.ConfigMap(
  'lago-backend-configmap',
  {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name: 'lago-backend-config',
      namespace: pulumiConfig.namespace,
    },
    data: {
      ELASTICACHE_REDIS_URL: pulumiConfig.elastiCacheRedisUrl,
      ELASTICACHE_REDIS_PORT: pulumiConfig.elastiCacheRedisPort,
    },
  },
  { provider: k8sProvider },
);

const deployment = new k8s.apps.v1.Deployment(
  'lago-nft-crawler-deployment',
  {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      namespace: pulumiConfig.namespace,
      name: 'lago-nft-crawler',
      labels: {
        app: 'lago-nft-crawler',
      },
    },
    spec: {
      replicas: pulumiConfig.nftCrawlerDeploymentReplicas,
      selector: {
        matchLabels: {
          app: 'lago-nft-crawler',
        },
      },
      template: {
        metadata: {
          labels: {
            app: 'lago-nft-crawler',
          },
        },
        spec: {
          containers: [
            {
              name: 'lago-nft-crawler',
              image: lagoNFTCrawlerDockerImage,
              ports: [
                {
                  containerPort: 3000,
                },
              ],
              livenessProbe: {
                httpGet: {
                  path: '/v1/healthz/liveness',
                  port: 3000,
                },
              },
              readinessProbe: {
                periodSeconds: 15,
                timeoutSeconds: 2,
                successThreshold: 2,
                failureThreshold: 2,
                httpGet: {
                  path: '/v1/healthz/readiness',
                  port: 3000,
                },
              },
              env: [
                {
                  name: 'ELASTICACHE_REDIS_URL',
                  valueFrom: {
                    configMapKeyRef: {
                      name: 'lago-backend-config',
                      key: 'ELASTICACHE_REDIS_URL',
                    },
                  },
                },
                {
                  name: 'ELASTICACHE_REDIS_PORT',
                  valueFrom: {
                    configMapKeyRef: {
                      name: 'lago-backend-config',
                      key: 'ELASTICACHE_REDIS_PORT',
                    },
                  },
                },
              ],
            },
          ],
        },
      },
      strategy: {
        type: 'RollingUpdate',
        rollingUpdate: {
          maxSurge: '25%',
          maxUnavailable: '25%',
        },
      },
    },
  },
  { provider: k8sProvider },
);

const lagoNFTCrawlerService = new k8s.core.v1.Service(
  'lago-nft-crawler-service',
  {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      namespace: pulumiConfig.namespace,
      name: 'lago-nft-crawler',
    },
    spec: {
      type: 'ClusterIP',
      selector: {
        app: 'lago-nft-crawler',
      },
      ports: [
        {
          protocol: 'TCP',
          //   nodePort: 30888,
          port: 80,
          targetPort: 3000,
        },
      ],
    },
  },
  { provider: k8sProvider },
);
