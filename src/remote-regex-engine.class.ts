import { RegexEngine } from './regex-engine.class'
import {
  ICumulativeTestResults,
  IDelimPair,
  IMatchConfig,
  IRegexConfig,
  IRegexError,
  IRegexPair
  // IRegexTestResult
} from './regex-engine.interfaces'


export class RemoteRegex extends RegexEngine {

  protected lastTestPromice: Promise<boolean> | undefined;
  protected lastError: IRegexError | undefined;

  constructor (engine: IRegexConfig) {
    super(engine);
  }


  // ======================================================
  // START: public methods


  // ------------------------------------------------------
  // START: Syncronous methods


  public isLocalEngine() { return false; };
  public isRemoteEngine() { return true; };


  //  END:  Syncronous methods
  // ------------------------------------------------------
  // START: Asyncronous methods


  /**
   * getLastError() returns an the an error object generated by the
   * last regex
   *
   * NOTE: This method should throw an exception if the last regex
   *       was valid
   *
   * @param id the UID for the regex pair that caused the error
   */
  public async getLastError () : Promise<IRegexError> {
    // todo
    return Promise.resolve({
      badCharacter: '',
      messages: [],
      offset: -1,
      rawMessage: '',
      regexID: 0
    });
  }

  /**
   * match() tests one or more sample strings against one or more
   * regex pairs
   *
   * NOTE: each input should be modified by each regex pair before
   *       passing it to the next regex pair
   *
   * @param input list of sample strings to test the regex against
   * @param regexes list of regex pair objects to test the inputs with
   *
   * @returns a list of regex test results.
   */
  public match (input: string[], regexes: IRegexPair[], chainRegexes: boolean | undefined) : Promise<ICumulativeTestResults[]> {
    const remoteMatchConfig : IMatchConfig = {
      ...this.matchConfig,
      chainRegexes: (typeof chainRegexes === 'undefined') ? this.matchConfig.chainRegexes : chainRegexes,
      showWhiteSpaceChars: false
    };

    // let output : ICumulativeTestResults[] = [];
    return Promise.resolve([]);
  }

  /**
   * replace() sequentially applies each all regex pairs to each input
   *
   * NOTE: replace acts basically the same as match but the modified
   *       string is returned instead of the list of matches.
   *
   * @param input list of sample strings to test the regex against
   * @param regexes list of regex pair objects to test the inputs with
   *
   * @returns list of modified strings
   */
  public replace(input: string[], regexes: IRegexPair[]) : Promise<string[]> {
    // let output : string[] = [];
    return Promise.resolve([]);
  }

  /**
   * test() tests a given regular expression to see if it's valid
   *
   * @param regex regular expression pattern
   * @param modifiers modifier/flags to augment the regex
   * @param delimiters delimiters (if engine requires them)
   *
   * @returns TRUE if regex is valid, FALSE otherwise.
   */
  public test (regex: string, modifiers: string, delimiters?: IDelimPair) : Promise<boolean> {
    this.lastTestPromice = Promise.resolve(false);
    return this.lastTestPromice;
  }


  //  END:  Asyncronous methods
  // ------------------------------------------------------




  //  END:  public methods
  // ======================================================
}
