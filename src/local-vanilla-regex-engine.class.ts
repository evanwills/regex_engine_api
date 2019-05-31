import { LocalRegex } from "./local-regex-engine.class";
import { IRegexConfig } from "./regex-engine.interfaces";


export class VanillaJSregex extends LocalRegex {
  constructor (engine: IRegexConfig) {
    super(engine);
  }
}
