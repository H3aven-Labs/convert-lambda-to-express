export interface APIGatewayProxyEventHeaders {
  [name: string]: string | undefined;
}

export interface APIGatewayProxyEventMultiValueHeaders {
  [name: string]: string[] | undefined;
}

export interface APIGatewayProxyEventPathParameters {
  [name: string]: string | undefined;
}

export interface APIGatewayProxyEventQueryStringParameters {
  [name: string]: string | undefined;
}

export interface APIGatewayProxyEventMultiValueQueryStringParameters {
  [name: string]: string[] | undefined;
}

export interface APIGatewayProxyEventStageVariables {
  [name: string]: string | undefined;
}
interface APIGatewayEventClientCertificate {
  clientCertPem: string;
  serialNumber: string;
  subjectDN: string;
  issuerDN: string;
  validity: {
    notAfter: string;
    notBefore: string;
  };
}
interface APIGatewayEventIdentity {
  accessKey: string | null;
  accountId: string | null;
  apiKey: string | null;
  apiKeyId: string | null;
  caller: string | null;
  clientCert: APIGatewayEventClientCertificate | null;
  cognitoAuthenticationProvider: string | null;
  cognitoAuthenticationType: string | null;
  cognitoIdentityId: string | null;
  cognitoIdentityPoolId: string | null;
  principalOrgId: string | null;
  sourceIp: string;
  user: string | null;
  userAgent: string | null;
  userArn: string | null;
}

export interface APIGatewayEventRequestContextWithAuthorizer<
  TAuthorizerContext,
> {
  accountId: string;
  apiId: string;
  authorizer: TAuthorizerContext;
  connectedAt?: number | undefined;
  connectionId?: string | undefined;
  domainName?: string | undefined;
  domainPrefix?: string | undefined;
  eventType?: string | undefined;
  extendedRequestId?: string | undefined;
  protocol: string;
  httpMethod: string;
  identity: APIGatewayEventIdentity;
  messageDirection?: string | undefined;
  messageId?: string | null | undefined;
  path: string;
  stage: string;
  requestId: string;
  requestTime?: string | undefined;
  requestTimeEpoch: number;
  resourceId: string;
  resourcePath: string;
  routeKey?: string | undefined;
}
interface APIGatewayProxyEventBase<TAuthorizerContext> {
  body: string | null;
  headers: APIGatewayProxyEventHeaders;
  multiValueHeaders: APIGatewayProxyEventMultiValueHeaders;
  httpMethod: string;
  isBase64Encoded: boolean;
  path: string;
  pathParameters: APIGatewayProxyEventPathParameters | null;
  queryStringParameters: APIGatewayProxyEventQueryStringParameters | null;
  multiValueQueryStringParameters: APIGatewayProxyEventMultiValueQueryStringParameters | null;
  stageVariables: APIGatewayProxyEventStageVariables | null;
  requestContext: APIGatewayEventRequestContextWithAuthorizer<TAuthorizerContext>;
  resource: string;
}

type APIGatewayEventDefaultAuthorizerContext =
  | undefined
  | null
  | {
      [name: string]: any;
    };

export type APIGatewayProxyEvent =
  APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>;

interface APIGatewayRequestAuthorizerEventHeaders {
  [name: string]: string | undefined;
}

interface APIGatewayRequestAuthorizerEventMultiValueHeaders {
  [name: string]: string[] | undefined;
}

interface APIGatewayRequestAuthorizerEventPathParameters {
  [name: string]: string | undefined;
}

interface APIGatewayRequestAuthorizerEventQueryStringParameters {
  [name: string]: string | undefined;
}

interface APIGatewayRequestAuthorizerEventMultiValueQueryStringParameters {
  [name: string]: string[] | undefined;
}

interface APIGatewayRequestAuthorizerEventStageVariables {
  [name: string]: string | undefined;
}

export interface APIGatewayRequestAuthorizerEvent {
  type: 'REQUEST';
  methodArn: string;
  resource: string;
  path: string;
  httpMethod: string;
  headers: APIGatewayRequestAuthorizerEventHeaders | null;
  multiValueHeaders: APIGatewayRequestAuthorizerEventMultiValueHeaders | null;
  pathParameters: APIGatewayRequestAuthorizerEventPathParameters | null;
  queryStringParameters: APIGatewayRequestAuthorizerEventQueryStringParameters | null;
  multiValueQueryStringParameters: APIGatewayRequestAuthorizerEventMultiValueQueryStringParameters | null;
  stageVariables: APIGatewayRequestAuthorizerEventStageVariables | null;
  requestContext: APIGatewayEventRequestContextWithAuthorizer<undefined>;
}

export type Callback<TResult = any> = (
  error?: Error | string | null,
  result?: TResult,
) => void;

interface ClientContextClient {
  installationId: string;
  appTitle: string;
  appVersionName: string;
  appVersionCode: string;
  appPackageName: string;
}

interface ClientContextEnv {
  platformVersion: string;
  platform: string;
  make: string;
  model: string;
  locale: string;
}

export interface ClientContext {
  client: ClientContextClient;
  Custom?: any;
  env: ClientContextEnv;
}

export interface CognitoIdentity {
  cognitoIdentityId: string;
  cognitoIdentityPoolId: string;
}

export interface Context {
  callbackWaitsForEmptyEventLoop: boolean;
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  identity?: CognitoIdentity | undefined;
  clientContext?: ClientContext | undefined;

  getRemainingTimeInMillis(): number;
  done(error?: Error, result?: any): void;
  fail(error: Error | string): void;
  succeed(messageOrObject: any): void;
  succeed(message: string, object: any): void;
}

export interface APIGatewayProxyResult {
  statusCode: number;
  headers?:
    | {
        [header: string]: boolean | number | string;
      }
    | undefined;
  multiValueHeaders?:
    | {
        [header: string]: Array<boolean | number | string>;
      }
    | undefined;
  body: string;
  isBase64Encoded?: boolean | undefined;
}

interface APIGatewayTokenAuthorizerEvent {
  type: 'TOKEN';
  methodArn: string;
  authorizationToken: string;
}
type PrincipalValue = { [key: string]: string | string[] } | string | string[];
interface MaybeStatementPrincipal {
  Principal?: PrincipalValue | undefined;
  NotPrincipal?: PrincipalValue | undefined;
}

interface MaybeStatementResource {
  Resource?: string | string[] | undefined;
  NotResource?: string | string[] | undefined;
}

type StatementAction =
  | { Action: string | string[] }
  | { NotAction: string | string[] };

type StatementResource = MaybeStatementPrincipal &
  ({ Resource: string | string[] } | { NotResource: string | string[] });

type StatementPrincipal = MaybeStatementResource &
  ({ Principal: PrincipalValue } | { NotPrincipal: PrincipalValue });

type StatementEffect = 'Allow' | 'Deny';

interface Condition {
  [key: string]: string | string[];
}
interface ConditionBlock {
  [condition: string]: Condition | Condition[];
}
interface BaseStatement {
  Effect: StatementEffect;
  Sid?: string | undefined;
  Condition?: ConditionBlock | undefined;
}

type Statement = BaseStatement &
  StatementAction &
  (StatementResource | StatementPrincipal);

interface PolicyDocument {
  Version: string;
  Id?: string | undefined;
  Statement: Statement[];
}

export interface APIGatewayAuthorizerResultContext {
  [name: string]: string | number | boolean | null | undefined;
}

export interface APIGatewayProxyCognitoAuthorizer {
  claims: {
    [name: string]: string;
  };
}

export type APIGatewayProxyWithCognitoAuthorizerEvent =
  APIGatewayProxyEventBase<APIGatewayProxyCognitoAuthorizer>;

export type Handler<TEvent = any, TResult = any> = (
  event: TEvent,
  context: Context,
  callback: Callback<TResult>,
) => void | Promise<TResult>;

export type APIGatewayProxyWithCognitoAuthorizerHandler = Handler<
  APIGatewayProxyWithCognitoAuthorizerEvent,
  APIGatewayProxyResult
>;

export interface APIGatewayAuthorizerResult {
  principalId: string;
  policyDocument: PolicyDocument;
  context?: APIGatewayAuthorizerResultContext | null | undefined;
  usageIdentifierKey?: string | null | undefined;
}

export type APIGatewayAuthorizerEvent =
  | APIGatewayTokenAuthorizerEvent
  | APIGatewayRequestAuthorizerEvent;

type DefaultApiGatewayEvent =
  APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>;

export type DecodedAuthorizationTokenPermission = {
  permission: string;
  role: string;
  org: string;
  consensusId: string;
  consensusPolicyId: string;
};

export type DecodedAuthorizationToken = {
  userAddress: string;
  email: string;
  chainId: string;
  signature: string;
  loginMethod: string;
  tokenId: string;
  permission: DecodedAuthorizationTokenPermission;
  iat: number;
  exp: number;
};

export type APIGatewayEvent = DefaultApiGatewayEvent & {
  decodedToken: DecodedAuthorizationToken;
};
