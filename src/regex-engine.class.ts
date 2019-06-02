import {
  EflagsModifiersLabel,
  IConstructedRegex,
  ICumulativeTestResults,
  IDelimModError,
  IDelimPair,
  IInvalidConstructedRegex,
  IRegexConfig,
  IRegexError,
  IRegexPair,
  IRegexTestResult,
  IValidatedDelimiters,
  IValidatedModifiers,
  IValidConstructedRegex
} from './regex-engine.interfaces'


export abstract class RegexEngine {

  /**
   * @property allowedDelimiters list single characters allowed to be
   *         used as delimiters of a regex engine accepts
   */
  protected allowedDelimiters : string[];

  /**
   * @property allowedModifiers list of alphabetical characters
   *         that can augment the regex engine's behavior for a
   *         given regex
   */
  protected allowedModifiers : string[] = [];

  /**
   * @property allowedPairedDelimiters list of delimPairs containing
   *         paired opening and closing delimiters that can be used
   *         by regex engine
   */
  protected allowedPairedDelimiters : IDelimPair[] = [];

  /**
   * @property apiURL URL for remote API end point
   */
  protected apiURL : string;

  /**
   * @property chainRegexes - When multiple regex are used in match()
   *         mode if chainRegexes is TRUE, the find/replace is done
   *         on input before handing input off to next regex pair
   */
  protected chaingRegexes: boolean = true;

  /**
   * @property defaultDelimiters - stores default opening and closing
   *         delimiter character for a regex
   */
  protected defaultModifiers: string = '';

  /**
   * @property defaultModifiers the default modifiers recommended
   *         for the engine
   *         e.g. in JavaScript 'ig' is used (especially in the
   *              context of testing) most of the time.
   */
  protected defaultDelimiters : IDelimPair = { close: '', open: ''};

  /**
   * @property delimiterRequired are delimiters required for this
   *         regex engine
   */
  protected delimiterRequired : boolean;

  /**
   * @property docsURL URL where useful documentation can be found
   *         for the regex engine
   */
  protected docsURL : string;

  /**
   * @property id UID for the regex engine
   */
  protected id : string;
  /**
   * @property modifiersLabel label to be used to identify the
   *         modifiers string
   */
  protected modifiersLabel : EflagsModifiersLabel;

  /**
   * @property name human readable name of the regex engine
   */
  protected name : string;

  /**
   * @property pairedDelimitersAllowed whether or not this engine
   *         allows paired delimiters (e.g. '<' & '>')
   */
  protected pairedDelimitersAllowed : boolean = false;

  constructor (engine: IRegexConfig) {
    const {id, name, apiURL, docsURL, defaultDelimiters, defaultModifiers, allowedDelimiters, allowedPairedDelimiters, modifiersLabel, chainRegexes, allowedModifiers} = engine;

    this.id = id;
    this.name = name;
    this.apiURL = apiURL;
    this.docsURL = docsURL;

    this.chaingRegexes = chainRegexes;

    this.defaultModifiers = defaultModifiers;
    this.modifiersLabel = modifiersLabel;

    this.defaultDelimiters = defaultDelimiters;
    this.allowedDelimiters = allowedDelimiters;
    this.delimiterRequired = (allowedDelimiters.length > 0);

    this.allowedPairedDelimiters = allowedPairedDelimiters;
    this.pairedDelimitersAllowed = (allowedPairedDelimiters.length > 0);

    try {
      this.allowedModifiers = this.validatEngineModiers(allowedModifiers);
    } catch (e) {
      throw new Error(e.errorMsg)
    }
  }

  /**
   * getApiURL() returns the URL for the API access point for the
   * given regex engine
   *
   * NOTE: for local regex engines (JS & XRegExp) this will be an
   *       empty string because no URL is required
   */
  public getApiURL() : string { return this.apiURL; }

  /**
   * getDocsURL() returns a URL for where documentation can be found
   * for the regex engine
   */
  public getDocsURL() : string { return this.docsURL; }

  /**
   * getName() returns the human readable name of the regex engine
   *
   * e.g. "Vanilla JS", "XRegExp" or "PHP PCRE"
   */
  public getName() : string { return this.name; }

  /**
   * getID() returns the ID for the regex engine
   *
   * e.g. "vanillaJS", 'xRegExp' or 'phpPCRE'
   */
  public getID() : string { return this.id; }

  /**
   * getValidDelimiters() validates delimiter
   *
   * @param delims regex delimiter character to be validated
   * @returns an error object containing information about issues
   *          with delimiters (if any)
   */
  public getValidDelimiters (delims : IDelimPair): IValidatedDelimiters {
    let invalids : string[] = [];
    let msg = '';
    let isValid = true;
    let output: IDelimPair;

    if (this.allowedDelimiters.indexOf(delims.open) > -1) {
      const pairdDelim = this.allowedPairedDelimiters.filter(pair => (pair.open === delims.open || pair.close === delims.close));
      output = (pairdDelim.length === 1) ? pairdDelim[0] : { open: delims.open, close: delims.open };
    } else {
      output = this.defaultDelimiters;
      isValid = false;

      invalids = invalids.concat([delims.open]);
      msg = 'Delimiter "' + delims.open + '" is invalid. Delimiters must be one of the following: ' + this.makeHumanFriendly(this.allowedDelimiters);
    }

    return {
      delimiters: output,
      error: {
        invalidItems: invalids,
        message: msg
      },
      valid: isValid
    }
  }

  // public getDefaultDelimiters () : IDelimPair {
  //   return this.defaultDelimiters;
  // }

  // public setDefaultDelimiters(delimiters: IDelimPair) : true {
  //   const output = this.getValidDelimiters(delimiters);
  //   if (output.valid === false) {
  //     throw new Error(output.error.message);
  //   }
  //   return true;
  // }

  /**
   * delimiterIsRequired() returns TRUE if delimiters are required
   * for this regex engine or FALSE if delimiters are not needed
   */
  public delimiterIsRequired () : boolean {
    return this.delimiterRequired;
  }

  /**
   * getValidModifiers() validates and de-dups regular expresson
   * modifiers
   *
   * @param modifiers regular expression modifiers (flags) characters
   * @returns string list of unique valid regular expression modifier
   *          characters
   */
  public getValidModifiers (modifiers : string) : IValidatedModifiers {
    let invalids : string[] = [];
    let msg = '';
    let validModifiers : string[] = [];
    let isValid = true;

    /**
     * modifiersFilter() callback function to pass to
     * Array.Prototype.filter() removes invalid modifiers/flags from
     * supplied modifiers
     *
     * NOTE this function has a side effect of adding invalid
     *      modifers to the invalid modifiers array.
     *      (I know it's poor form but it's cheeper than rerunning
     *       the filter to exclude the valid modifiers)
     *
     * @param modifier single character to be used as a modifier.
     *
     * @returns TRUE if modifier is valid or false otherwise
     */
    const modifiersFilter = (modifier : string) : boolean => {
      if (this.allowedModifiers.indexOf(modifier) >= 0) {
        if (validModifiers.indexOf(modifier) === -1) {
          // this is a new modifier so we'll keep it
          validModifiers = validModifiers.concat([modifier]);
          return true;
        } else {
          // we've seen this one before so dump it.
          return false;
        }
      } else {
        if (invalids.indexOf(modifier) === -1) {
          // this is a new bad modifier lets record it.
          invalids = invalids.concat([modifier]);
        }
        // it's bad so dump it.
        return false;
      }
    };

    const output = modifiers.split('').filter(modifiersFilter).reduce((previousValue, modifier) => previousValue + modifier);

    if (invalids.length > 0) {
      isValid = false;
      msg = 'The ' + this.modifiersLabel + ': ' + this.makeHumanFriendly(invalids) + ' are invalid. Only the following ' + this.modifiersLabel + ' are valid: ' + this.makeHumanFriendly(this.allowedModifiers);
    }

    return {
      error: {
        invalidItems: invalids,
        message: msg
      },
      modifiers: output,
      valid: isValid
    }
  }

  /**
   *
   * @param modifiers updates the default modifiers set when a new regex pair
   */
  public setDefaultModifiers(modifiers : string) : true {
    const output : IValidatedModifiers = this.getValidModifiers(modifiers);
    if (output.valid === false) {
      throw new Error(output.error.message);
    }
    this.defaultModifiers = output.modifiers;
    return true;
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
  public abstract test(regex: string, modifiers: string, delimiters?: IDelimPair) : boolean;

  /**
   * getLastError() returns an the an error object generated by the
   * last regex
   *
   * NOTE: This method should throw an exception if the last regex
   *       was valid
   *
   * @param id the UID for the regex pair that caused the error
   */
  public abstract getLastError(id: number) : IRegexError

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
  public abstract match(input: string[], regexes: IRegexPair[]) : ICumulativeTestResults[];

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
  public abstract replace(input: string[], regexes: IRegexPair[]) : string[];


  /**
   * validatEngineModiers() validates modifiers/flags for a given
   * regular expression engine suppots
   *
   * @param modifiers list of alphabetical characters
   */
  protected validatEngineModiers (modifiers : string[]) : string[] {
    const validModRegex = new RegExp('^[a-z]$', 'i');
    const duds : string[] = [];
    const already: string[] = [];
    let output : string[] = [];

    output = modifiers.filter(modifier => {
      if (modifier.match(validModRegex)) {
        if (already.indexOf(modifier) === -1) {
          already.push(modifier);
          return true;
        }
      } else {
        duds.push(modifier);
      }
      return false
    });

    if (duds.length > 0 ) {
      const isAre = (duds.length === 1) ? 'is' : 'are';
      throw new Error('All ' + this.modifiersLabel + ' must be alphabetical characters. "' + this.makeHumanFriendly(duds) + '" ' + isAre + ' not valid');
    }

    return output;
  }

  /**
   * makeHumanFriendly() takes an array of strings and converts them
   * into a single, comma separated, quoted string
   *
   * e.g. ['a', 'b', 'c', 'd', 'e'] will be converted into
   *      '"a", "b", "c", "d" & "e"'
   *
   * Used for error reporting on invalid delimiters and modifiers
   *
   * @param items array of strings to be made human readable
   */
  protected makeHumanFriendly (items : string[]) : string {
    return items.reduce((previous, item, i, whole) => {
      const sep = i === 0 ? '' : (whole.length - 1 === i) ? '& ' : ', ';
      return previous + sep + '"' + item + '"';
    });
  }

  /**
   * isValidRegex() is a Type Guard method to ensure the regex is valid
   * @param regex
   */
  protected isValidRegex (regex: IValidConstructedRegex | IInvalidConstructedRegex) : regex is IValidConstructedRegex {
    return (regex as IValidConstructedRegex).find !== undefined;
  }

  protected regexHasError (regex: IValidConstructedRegex | IInvalidConstructedRegex) : regex is IInvalidConstructedRegex {
    return (regex as IInvalidConstructedRegex).error !== undefined;
  }
}
