import * as pulumi from '@pulumi/pulumi';

const pulumiConfig = new pulumi.Config('lago');

const clusterStackRef = new pulumi.StackReference(
  pulumiConfig.require('clusterStackRef'),
);
const namespace = pulumiConfig.require('namespace');
const nftCrawlerDeploymentReplicas = pulumiConfig.requireNumber(
  'nftCrawlerDeploymentReplicas',
);
const elastiCacheRedisUrl = pulumiConfig.require('elastiCacheRedisUrl');
const elastiCacheRedisPort = pulumiConfig.require('elastiCacheRedisPort');

export const config = {
  clusterStackRef,
  namespace,
  nftCrawlerDeploymentReplicas,
  elastiCacheRedisUrl,
  elastiCacheRedisPort,
};
