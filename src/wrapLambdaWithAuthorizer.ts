import jwt from "jsonwebtoken";
import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda';
import { Logger } from 'winston';
import { Handler, NextFunction, Request, Response } from 'express';
import { SharedIniFileCredentials, Credentials } from 'aws-sdk';
import { Context, ContextOptions } from './Context';
import { Event, EventOptions } from './Event';
import { convertResponseFactory, ConvertResponseOptions } from './convertResponse';
import { runHandler } from './runHandler';

export interface WrapperOptions
  extends Omit<ContextOptions, 'startTime' | 'credentials'>,
    Pick<EventOptions, 'isBase64EncodedReq' | 'resourcePath' | 'stage' | 'stageVariables' | 'authorizer'>,
    ConvertResponseOptions {
  credentialsFilename?: string;
  profile?: string;
  logger?: Logger;
  jwtSecret?: string;
}

// Função que simula a geração de uma política de autorização (similar ao IAM policy document)
function generatePolicy(principalId: string, effect: string, resource: string) {
  return {
    principalId, // Identificador do usuário (ex.: ID do usuário ou token)
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect, // 'Allow' ou 'Deny'
          Resource: resource, // Recurso da API (pode ser um ARN ou um identificador genérico)
        },
      ],
    },
    context: {
      // Informações adicionais para passar ao handler (opcional)
      userId: principalId,
    },
  };
}

function authorizerMiddleware(req: Request<any>, res: Response, next: NextFunction, jwtSecret: string) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  // Verifica se o cabeçalho Authorization existe
  if (!authHeader) {
    throw new Error( "Missing Authorization header");
  }

  try {
    // Valida o JWT
    const decodedToken: any = jwt.verify(authHeader as string, jwtSecret);

    // Simula a geração de uma política de autorização
    
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

    // Adiciona informações do usuário ao objeto req (similar ao context do Authorizer)
    (req as any)['user'] = {
      userId: decodedToken['sub'],
      context: policy.context,
    };
    // Prossegue para a próxima rota
    next();
  } catch (error) {
    // Caso o token seja inválido, retorna erro 403 (similar a Deny)
    console.error("Token validation error:", error);
    throw new Error( "Invalid or expired token");
  }
}


export function getCredentials(filename?: string, profile?: string) {
  if (filename) {
    const credentials = new SharedIniFileCredentials({ filename, profile });
    if (!!credentials.accessKeyId && !!credentials.secretAccessKey) {
      return credentials;
    }
  }

  if (process.env.AWS_ACCESS_KEY_ID?.length && process.env.AWS_SECRET_ACCESS_KEY?.length) {
    return new Credentials({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN
    });
  }
}

export function wrapLambdaWithAuthorizer(
  handler: APIGatewayProxyWithCognitoAuthorizerHandler,
  options: WrapperOptions = {}
): Handler {
  const logger = options.logger ?? console;
  const credentials = getCredentials(options.credentialsFilename ?? '~/.aws/credentials', options.profile);

  return async (req, res, next) => {
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
