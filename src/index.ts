import { HandlerConfig } from './devServer';

export { ContextOptions } from './Context';
export { EventOptions } from './Event';
export { wrapLambda, WrapperOptions } from './wrapLambda';
export {
  wrapLambdaWithAuthorizer,
  WrapperOptions as WrapperOptionsWithAuthorizer,
} from './wrapLambdaWithAuthorizer';

declare global {
  let CLTE_HANDLER_DEFINITIONS: undefined | HandlerConfig[];
}
