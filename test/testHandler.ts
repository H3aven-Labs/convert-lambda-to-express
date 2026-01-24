import { APIGatewayProxyWithCognitoAuthorizerEvent, Context } from '../src/aws-lambda';

export function handler(event: APIGatewayProxyWithCognitoAuthorizerEvent, context: Context) {
  console.log({ event, context });
}
