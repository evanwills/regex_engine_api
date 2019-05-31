
import { RemoteRegex } from '../remote-regex-engine.class';
import { VanillaJSregex } from './local-vanilla-regex-engine.class';
import { XRegExpRegex } from './local-xregexp-regex-engine.class';
import { engineAccess, IRegexConfig } from './regex-engine.interfaces';

/**
 * getRegexEngine() is a factory that returns the correct RegexEngine
 * object
 *
 * @param engineConfig config object to define how to set up an engine
 */
export const getRegexEngine = (engineConfig: IRegexConfig) : RemoteRegex | VanillaJSregex | XRegExpRegex => {
  if (engineConfig.type === engineAccess.remote) {
    return new RemoteRegex(engineConfig);
  } else if(engineConfig.id === 'vanillaJS') {
    return new VanillaJSregex(engineConfig);
  } else if(engineConfig.id === 'xRegEx') {
    return new XRegExpRegex(engineConfig);
  } else {
    throw new Error('Unknown regex type ID. "' + engineConfig.id + '" is not supported');
  }
}
