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
    // let output = '';
    const output = '';
    return false;
  }

  public match (input: string[], regexes: IRegexPair[]) : ICumulativeTestResults[] {
    // let output : ICumulativeTestResults[] = [];
    const output : ICumulativeTestResults[] = [];
    return output;
  }

  public replace(input: string[], regexes: IRegexPair[]) : string[] {
    // let output : string[] = [];
    const output : string[] = [];
    return output;
  }
}
