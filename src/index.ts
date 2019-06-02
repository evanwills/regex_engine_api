
import { VanillaESregex } from './local-vanilla-regex-engine.class';
import { XRegExpRegex } from './local-xregexp-regex-engine.class';
import { EengineAccess, IRegexConfig } from './regex-engine.interfaces';
import { RemoteRegex } from './remote-regex-engine.class';

/**
 * getRegexEngine() is a factory that returns the correct RegexEngine
 * object
 *
 * @param engineConfig config object to define how to set up an engine
 */
export const getRegexEngine = (engineConfig: IRegexConfig) : RemoteRegex | VanillaESregex | XRegExpRegex => {
  if (engineConfig.type === EengineAccess.remote) {
    return new RemoteRegex(engineConfig);
  } else if(engineConfig.id === 'vanillaJS') {
    return new VanillaESregex(engineConfig);
  } else if(engineConfig.id === 'xRegEx') {
    return new XRegExpRegex(engineConfig);
  } else {
    throw new Error('Unknown regex type ID. "' + engineConfig.id + '" is not supported');
  }
}
