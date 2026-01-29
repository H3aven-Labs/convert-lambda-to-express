import { HttpMethod } from "./utils";
import { WrapperOptions } from "./wrapLambda";

type HandlerEnvironment = { [key: string]: string };

export interface HandlerConfig extends WrapperOptions {
  method: HttpMethod;
  resourcePath: string;
  handler: string;
  codeDirectory?: string;
  environment?: HandlerEnvironment;
}

if (!(globalThis as any).CLTE_HANDLER_DEFINITIONS) {
  (globalThis as any).CLTE_HANDLER_DEFINITIONS = [];
}
export const handlerDefinitions: HandlerConfig[] = (globalThis as any)
  .CLTE_HANDLER_DEFINITIONS;
