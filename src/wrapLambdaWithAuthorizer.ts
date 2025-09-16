import jwt from "jsonwebtoken";
import { APIGatewayProxyWithCognitoAuthorizerHandler } from './aws-lambda';
import { Logger } from 'winston';
import { Handler, NextFunction, Request, Response } from 'express';
import { fromEnv, fromIni } from '@aws-sdk/credential-providers';
import { Context, ContextOptions } from './Context';
import { Event, EventOptions } from './Event';
import { convertResponseFactory, ConvertResponseOptions } from './convertResponse';
import { runHandler } from './runHandler';
import { AwsCredentialIdentity } from "@smithy/types";

export interface WrapperOptions
  extends Omit<ContextOptions, 'startTime' | 'credentials'>,
    Pick<EventOptions, 'isBase64EncodedReq' | 'resourcePath' | 'stage' | 'stageVariables' | 'authorizer'>,
    ConvertResponseOptions {
  credentialsFilename?: string;
  profile?: string;
  logger?: Logger;
  jwtSecret?: string;
}

function generatePolicy(principalId: string, effect: string, resource: string) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: {
      userId: principalId,
    },
  };
}

function authorizerMiddleware(req: Request<any>, res: Response, next: NextFunction, jwtSecret: string) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    throw new Error( "Missing Authorization header");
  }
  try {
    const decodedToken: any = jwt.verify(authHeader as string, jwtSecret);
    
    if (
      !decodedToken ||
      (decodedToken && !decodedToken['userAddress']) ||
      (decodedToken && !decodedToken['permission']) ||
      (decodedToken && !decodedToken['permission']['org']) ||
      (decodedToken && !decodedToken['tokenId'])
    ) {
      console.log("[h3-auth] decoded token without user address or token id");
      throw new Error( "Unauthorized");
    }
    
    const policy = generatePolicy(decodedToken['sub'], "Allow", req.path);
    
    (req as any)['user'] = {
      userId: decodedToken['sub'],
      context: policy.context,
    };    
    next();
  } catch (error) {    
    console.error("Token validation error:", error);
    throw new Error( "Invalid or expired token");
  }
}


export async function getCredentials(filename?: string, profile?: string): Promise<AwsCredentialIdentity | undefined> {
  try {
    if (filename) {
      const fileCredentialsProvider = fromIni({
        profile,
        filepath: filename
      });
      const fileCredentials = await fileCredentialsProvider();
      
      if (!!fileCredentials.accessKeyId && !!fileCredentials.secretAccessKey) {
        return fileCredentials;
      }
    }

    if (process.env.AWS_ACCESS_KEY_ID?.length && process.env.AWS_SECRET_ACCESS_KEY?.length) {
      const envCredentialsProvider = fromEnv();
      const envCredentials = await envCredentialsProvider();

      return envCredentials;    
    }
  } catch (e) {
    return undefined;
  }
}

export function wrapLambdaWithAuthorizer(
  handler: APIGatewayProxyWithCognitoAuthorizerHandler,
  options: WrapperOptions = {}
): Handler {
  const logger = options.logger ?? console;

  return async (req, res, next) => {
    const credentials = await getCredentials(options.credentialsFilename ?? '~/.aws/credentials', options.profile);

    try {
      if(!options.jwtSecret) {
        return res.status(401).json({ error: "JWT secret is required" });
      }
      try {
        authorizerMiddleware(req, res, next, options.jwtSecret as string);
      } catch (err) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const startTime = Date.now();
      const context = new Context({
        ...options,
        startTime,
        credentials
      });
      const event = new Event({
        ...options,
        req,
        startTime,
        awsRequestId: context.awsRequestId,
        accountId: context._accountId
      });
      const convertResponse = convertResponseFactory({ res, logger, options });
      await runHandler({
        logger,
        handler,
        event,
        context,
        callback: convertResponse
      });
    } catch (err) {
      // if server error building Event, Context or convertResponse
      return next(err);
    }
  };
}
