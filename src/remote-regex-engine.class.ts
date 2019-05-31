import {RegexEngine} from './regex-engine.class'
import { ICumulativeTestResults, IDelimPair, IRegexConfig, IRegexPair, IRegexTestResult} from './regex-engine.interfaces'


export class RemoteRegex extends RegexEngine {
  constructor (engine: IRegexConfig) {
    super(engine);
  }

  public isValid(regex: string, modifiers: string, delimiters?: IDelimPair) : string {
    // let output = '';
    const output = '';
    return output;
  }

  public test(input: string[], regexes: IRegexPair[]) : ICumulativeTestResults[] {
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
