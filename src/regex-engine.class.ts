import {
  EflagsModifiersLabel,
  IConstructedRegex,
  ICumulativeTestResults,
  IDelimModError,
  IDelimPair,
  IInvalidConstRegex,
  IMatchConfig,
  IMatchConfigExtra,
  IRegexConfig,
  IRegexError,
  IRegexIsInvalid,
  IRegexIsValid,
  IRegexPair,
  IRegexTestResult,
  IValidatedDelimiters,
  IValidatedModifiers,
  IValidConstRegex,
  TmatchConfigLimitProps,
  TmatchConfigProps
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
   * @property matchConfig - is a list of all config properties
   *                         required by regex engine to allow
   *                         for safe updating of IMatchConfig
   *                         properties
   */
  protected matchConfig : IMatchConfigExtra;

  /**
   * @property defaultDelimiters - stores default opening and closing
   *         delimiter character for a regex
   */
  protected defaultModifiers : string = '';

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
    const {
      allowedDelimiters,
      allowedModifiers,
      allowedPairedDelimiters,
      apiURL,
      defaultDelimiters,
      defaultModifiers,
      matchConfig,
      docsURL,
      id,
      modifiersLabel,
      name,
    } = engine;

    this.id = id;
    this.name = name;
    this.apiURL = apiURL;
    this.docsURL = docsURL;

    this.matchConfig = matchConfig;

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


  // ======================================================
  // START: public methods


  // ------------------------------------------------------
  // START: Syncronous methods


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

  /**
   * getDefaultDelimiters() returns the current default delimiters
   */
  public getDefaultDelimiters () : IDelimPair {
    return this.defaultDelimiters;
  }

  /**
   * setDefaultDelimiters() updates the current default delimiters
   */
  public setDefaultDelimiters(delimiters: IDelimPair) : true {
    const output = this.getValidDelimiters(delimiters);
    if (output.valid === false) {
      throw new Error(output.error.message);
    }
    return true;
  }

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
   * setMatchConfig() sets all the config needed for sending match
   * requests to remote server
   * @param config
   */
  public setMatchConfig(config: IMatchConfig) : void {
    const allProps = Object.getOwnPropertyNames(this.matchConfig);

    for (const key of allProps) {
      if (this.isMatchConfigProp(key)) {
        this.setMatchConfigProp(key, config[key]);
      }
    }

    this.matchConfig = {...this.matchConfig, ...config};
  }

  /**
   * setMatchConfigProp() sets values for individual properties of
   * the matchConfig object
   *
   * NOTE: When setting maxSubMatchLen or maxWholeMatchLen to values
   *       greater than the limit set by the engine, those properties,
   *       they are silently set to the engine's pre-defined limit.
   *
   * NOTE ALSO: truncateLongStr is only updated when
   *       optionalTruncateLongStr is set to TRUE
   *
   * @param prop name of matchConfig property to be updated.
   * @param value new value for matchConfig property
   */
  public setMatchConfigProp(prop: keyof IMatchConfig, value: number | boolean) : void {
    let newConfig = {...this.matchConfig};
    const oldValue = newConfig[prop];

    if (typeof newConfig[prop] !== typeof value) {
      throw new Error('setMatchConfigProp() expects value of ' + prop + ' to be a ' + typeof oldValue + '. ' + typeof value + ' given.');
    }

    switch (prop) {
      case 'maxSubMatchLen':
      case 'maxWholeMatchLen':
        const limitedValue : number = (prop === 'maxSubMatchLen') ? this.matchConfig.maxSubMatchLenLimit : this.matchConfig.maxWholeMatchLenLimit;
        if (typeof value === 'number') {
          const newValue : number = (limitedValue < value) ? limitedValue : value;
          newConfig[prop] = newValue;
        }
        break;

      case 'truncateLongStr':
        if (typeof value === 'boolean' && typeof oldValue === 'boolean') {
          newConfig = {
            ...newConfig,
            truncateLongStr: (newConfig.optionalTruncateLongStr) ? value : oldValue
          };
        }
        break;

      case 'chainRegexes':
      case 'showWhiteSpaceChars':
        if (typeof value === 'boolean') {
          newConfig[prop] = value;
        }
    }

    this.matchConfig = newConfig;


    // if (typeof this.matchConfig[prop] === typeof value) {
    //   const limited = prop + 'Limit';
    //   if (this.isMatchConfigLimitedProp(limited) && typeof value === 'number') {
    //     this.matchConfig[prop] = (this.matchConfig[limited] < value) ? this.matchConfig[limited] : value;
    //   } else {
    //     if (prop === 'truncateLongStr' && typeof value === 'boolean') {
    //       this.matchConfig[prop] = (this.matchConfig.optionalTruncateLongStr) ? value : this.matchConfig[prop];
    //     } else {
    //       this.matchConfig[prop] = value;
    //     }
    //   }
    // } else {
    //   throw new Error('setMatchConfigProp() expects value of ' + prop + ' to be a ' + typeof this.matchConfig[prop] + '. ' + typeof value + ' given.');
    // }
  }

  /**
   * isLocalEngine() tells whether or not the current engine is
   * local or not
   */
  public abstract isLocalEngine() : boolean;

  /**
   * isRemoteEngine() tells whether or not the current engine is
   * remote or not
   */
  public abstract isRemoteEngine() : boolean;


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
  public abstract getLastError(id: number) : Promise<IRegexError>;

  /**
   * match() tests one or more sample strings against one or more
   * regex pairs
   *
   * NOTE: each input should be modified by each regex pair before
   *       passing it to the next regex pair
   *
   * @param inputs list of sample strings to test the regex against
   * @param regexPairs list of regex pair objects to test the inputs with
   *
   * @returns a list of regex test results.
   */
  public abstract match(inputs: string[], regexPairs: IRegexPair[], chainRegexes: boolean | undefined) : Promise<ICumulativeTestResults[]>;

  /**
   * replace() sequentially applies each all regex pairs to each input
   *
   * NOTE: replace acts basically the same as match but the modified
   *       string is returned instead of the list of matches.
   *
   * @param inputs list of sample strings to test the regex against
   * @param regexPairs list of regex pair objects to test the inputs with
   *
   * @returns list of modified strings
   */
  public abstract replace(inputs: string[], regexPairs: IRegexPair[]) : Promise<string[]>;

  /**
   * test() tests a given regular expression to see if it's valid
   *
   * @param regexStr regular expression pattern
   * @param modifiersStr modifier/flags to augment the regex
   * @param delimiters delimiters (if engine requires them)
   *
   * @returns TRUE if regex is valid, FALSE otherwise.
   */
  public abstract test(regexStr: string, modifiersStr: string, delimiters?: IDelimPair) : Promise<boolean>;


  //  END:  Asyncronous methods
  // ------------------------------------------------------


  //  END:  public methods
  // ======================================================
  // START: protected methods


  // ------------------------------------------------------
  // START: shared internal (helper) methods


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


  //  END:  shared internal (helper) methods
  // ------------------------------------------------------
  // START: shared type guard methods


  /**
   * isValidRegex() is a Type Guard method to ensure the regex is valid
   * @param regex
   */
  protected isValidRegex (regex: IValidConstRegex | IInvalidConstRegex | false) : regex is IValidConstRegex {
    if (typeof regex === 'boolean') {
      return false;
    } else {
      return (regex as IValidConstRegex).find !== undefined;
    }
  }

  /**
   * regexHasError() is a Type Guard method to ensure the regex is invalid
   * @param regex
   */
  protected regexHasError (regex: IValidConstRegex | IInvalidConstRegex) : regex is IValidConstRegex {
    return (regex as IInvalidConstRegex).error !== undefined;
  }

  /**
   * isMatchConfigLimitedProp() is a Type Guard method to ensure to
   * ensure key is a property of IMatchConfigLimits
   * @param key string
   * @returns boolean
   */
  protected isMatchConfigLimitedProp (key: string | TmatchConfigLimitProps) : key is TmatchConfigLimitProps {
    return (key === 'maxSubMatchLenLimit' || key === 'maxWholeMatchLenLimit')
  }

  /**
   * isMatchConfigProp() is a Type Guard method to ensure to ensure
   * key is a property of IMatchConfig
   * @param key string
   * @returns boolean
   */
  protected isMatchConfigProp (key: string | TmatchConfigProps) : key is TmatchConfigProps {
    const allProps = Object.getOwnPropertyNames(this.matchConfig);
    return (allProps.indexOf(key) > -1);
  }

  protected isIRegexIsValid (result : IRegexIsValid | IRegexIsInvalid | any) : result is IRegexIsValid {
    return (result as IRegexIsValid).valid === true;
  }

  protected isIRegexIsInvalid (result : IRegexIsValid | IRegexIsInvalid | any) : result is IRegexIsValid {
    return (result as IRegexIsInvalid).error !== undefined;
  }

  // protected isIRegexIsInvalid (result : IRegexIsInvalid | any) : result is IRegexIsInvalid {
  //   return (result as IRegexIsInvalid).error !== 'undefined';
  // }


  //  END:  shared type guard methods
  // ------------------------------------------------------


  //  END:  protected methods
  // ======================================================
}
