import { LocalRegex } from "./local-regex-engine.class";
import { IRegexConfig } from "./regex-engine.interfaces";


export class XRegExpRegex extends LocalRegex {
  constructor (engine: IRegexConfig) {
    super(engine);
  }
  /**
   * XRegExpRegex::_getRegexObject() returns a single regular
   * expression object that can be used for testing or replacing
   *
   * NOTE: the returned is not a standard ECMAscript RegExp object.
   *       It's one augmented by XRegExp and so can do fancier things.
   *
   * @param regex string to be used as a regular expression.
   * @param modifiers string of modifiers/flags to augment the
   *              behavior of the regex
   */
  protected _getRegexObject(pattern: string, modifiers: string) : any {
    let output;
    try {
      output = XRegExp(pattern, modifiers);
    } catch (e) {
      throw new Error(e);
    }
    return output;
  }
}
