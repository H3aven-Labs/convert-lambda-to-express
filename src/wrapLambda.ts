import { fromEnv, fromIni } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@smithy/types';
import { Handler } from 'express';

import { APIGatewayProxyWithCognitoAuthorizerHandler } from './aws-lambda';
import { Context, ContextOptions } from './Context';
import {
  convertResponseFactory,
  ConvertResponseOptions,
} from './convertResponse';
import { Event, EventOptions } from './Event';
import { runHandler } from './runHandler';

export interface WrapperOptions
  extends
    Omit<ContextOptions, 'startTime' | 'credentials'>,
    Pick<
      EventOptions,
      | 'isBase64EncodedReq'
      | 'resourcePath'
      | 'stage'
      | 'stageVariables'
      | 'authorizer'
    >,
    ConvertResponseOptions {
  credentialsFilename?: string;
  profile?: string;
  logger?: Console;
}

export async function getCredentials(
  filename?: string,
  profile?: string,
): Promise<AwsCredentialIdentity | undefined> {
  try {
    if (filename) {
      const fileCredentialsProvider = fromIni({
        profile,
        filepath: filename,
      });

      const fileCredentials = await fileCredentialsProvider();

      if (!!fileCredentials.accessKeyId && !!fileCredentials.secretAccessKey) {
        return fileCredentials;
      }
    }

    if (
      process.env.AWS_ACCESS_KEY_ID?.length &&
      process.env.AWS_SECRET_ACCESS_KEY?.length
    ) {
      const envCredentialsProvider = fromEnv();
      const envCredentials = await envCredentialsProvider();

      return envCredentials;
    }
  } catch {
    return undefined;
  }
}

export function wrapLambda(
  handler: APIGatewayProxyWithCognitoAuthorizerHandler,
  options: WrapperOptions = {},
): Handler {
  const logger = options.logger ?? console;

  return async (req, res, next) => {
    try {
      const credentials = await getCredentials(
        options.credentialsFilename ?? '~/.aws/credentials',
        options.profile,
      );

      const startTime = Date.now();
      const context = new Context({
        ...options,
        startTime,
        credentials,
      });
      const event = new Event({
        ...options,
        req,
        startTime,
        awsRequestId: context.awsRequestId,
        accountId: context._accountId,
      });
      const convertResponse = convertResponseFactory({ res, logger, options });
      await runHandler({
        logger,
        handler,
        event,
        context,
        callback: convertResponse,
      });
    } catch (err) {
      // if server error building Event, Context or convertResponse
      return next(err);
    }
  };
}
