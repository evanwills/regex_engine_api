import { RegexEngine } from './regex-engine.class'
import {
  ICumulativeTestResults,
  IDelimPair,
  IRegexConfig,
  IRegexError,
  IRegexPair
  // IRegexTestResult
} from './regex-engine.interfaces'


export class RemoteRegex extends RegexEngine {
  constructor (engine: IRegexConfig) {
    super(engine);
  }


  // ======================================================
  // START: public methods


  public getLastError () : IRegexError {
    return {
      badCharacter: '',
      messages: [],
      offset: -1,
      rawMessage: '',
      regexID: 0
    }
  }

  public test (regex: string, modifiers: string, delimiters?: IDelimPair) : boolean {
    // let output = true;
    return false;
  }

  public match (input: string[], regexes: IRegexPair[], chainRegexes: boolean | undefined) : ICumulativeTestResults[] {
    const doChaining = (typeof chainRegexes === 'undefined') ? this.chainRegexes : chainRegexes;

    // let output : ICumulativeTestResults[] = [];
    return [];
  }

  public replace(input: string[], regexes: IRegexPair[]) : string[] {
    // let output : string[] = [];
    return [];
  }

  public isLocalEngine() { return false; };
  public isRemoteEngine() { return true; };


  //  END:  public methods
  // ======================================================
}
