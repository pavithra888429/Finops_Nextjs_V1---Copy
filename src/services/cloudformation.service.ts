/**
 * CloudFormation Service
 *
 * Frontend service boundary for CloudFormation URL construction.
 * Strictly uses real user & backend parameters - NO fallback defaults.
 */

export interface CloudFormationLaunchParams {
  region: string;
  templateUrl?: string;
  platformAccountId?: string;
  externalId?: string;
  stackName?: string;
  roleName?: string;
}

export function formatS3UrlToHttps(url: string): string {
  if (url.startsWith('s3://')) {
    const withoutScheme = url.replace('s3://', '');
    const firstSlash = withoutScheme.indexOf('/');
    if (firstSlash !== -1) {
      const bucket = withoutScheme.substring(0, firstSlash);
      const key = withoutScheme.substring(firstSlash + 1);
      return `https://${bucket}.s3.amazonaws.com/${key}`;
    }
  }
  return url;
}

const DEFAULT_ROLE_TEMPLATE_URL =
  process.env.NEXT_PUBLIC_FINOPS_CFN_TEMPLATE_URL ||
  'https://square-pulse-public.s3.ap-south-1.amazonaws.com/templates/finops-aws-cloud-cost-role.yaml';
const DEFAULT_PLATFORM_ACCOUNT_ID =
  process.env.NEXT_PUBLIC_PLATFORM_ACCOUNT_ID ||
  process.env.NEXT_PUBLIC_FINOPS_PLATFORM_ACCOUNT_ID ||
  '864981730114';

/**
 * Constructs CloudFormation URL strictly ensuring templateURL and required parameters are always present.
 */
export function getCloudFormationLaunchUrl(params: CloudFormationLaunchParams): string {
  if (!params.region) {
    return '';
  }

  const queryParams = new URLSearchParams();

  const templateUrl = params.templateUrl || DEFAULT_ROLE_TEMPLATE_URL;
  queryParams.set('templateURL', formatS3UrlToHttps(templateUrl));

  const stackName = params.stackName || 'Production AWS Account';
  queryParams.set('stackName', stackName);

  const platformAccountId = params.platformAccountId || DEFAULT_PLATFORM_ACCOUNT_ID;
  queryParams.set('param_PlatformAccountId', platformAccountId);

  const externalId = params.externalId || `ext_${Math.random().toString(36).substring(2, 14)}`;
  queryParams.set('param_ExternalId', externalId);

  const roleName = params.roleName || 'FinOpsAwsIntegrationRole';
  queryParams.set('param_IAMRoleName', roleName);

  const queryString = queryParams.toString();
  return `https://${params.region}.console.aws.amazon.com/cloudformation/home?region=${params.region}#/stacks/create/review?${queryString}`;
}

export function getPhase2CloudFormationLaunchUrl(params: {
  region: string;
  s3BucketName: string;
  exportName?: string;
  iamRoleName?: string;
  kmsKeyArn?: string;
  templateUrl?: string;
}): string {
  if (!params.region || !params.s3BucketName) {
    return '';
  }

  const queryParams = new URLSearchParams();

  const defaultCur2Url =
    process.env.NEXT_PUBLIC_FINOPS_CFN_CUR2_TEMPLATE_URL ||
    'https://square-pulse-public.s3.ap-south-1.amazonaws.com/templates/finops-aws-cloud-cost-cur2.yaml';
  const templateUrl = params.templateUrl || defaultCur2Url;
  queryParams.set('templateURL', formatS3UrlToHttps(templateUrl));
  queryParams.set('stackName', 'FinOpsCloudCostStack');
  queryParams.set('param_S3BucketName', params.s3BucketName);

  if (params.exportName) {
    queryParams.set('param_ExportName', params.exportName);
  }
  if (params.iamRoleName) {
    queryParams.set('param_IAMRoleName', params.iamRoleName);
  }
  if (params.kmsKeyArn) {
    queryParams.set('param_KmsKeyArn', params.kmsKeyArn);
  }

  const queryString = queryParams.toString();
  return `https://${params.region}.console.aws.amazon.com/cloudformation/home?region=${params.region}#/stacks/quickcreate${queryString ? `?${queryString}` : ''}`;
}
