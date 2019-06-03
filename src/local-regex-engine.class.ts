import { match, XRegExp } from 'XRegExp'
import { RegexEngine } from './regex-engine.class'
import { IConstructedRegex,
         ICumulativeTestResults,
         IDelimPair,
         IInvalidConstructedRegex,
         // IRegex,
         IRegexConfig,
         IRegexError,
         IRegexIsInValid,
         IRegexIsValid,
         IRegexMatch,
         IRegexPair,
         IRegexTestResult,
         ISimpleTestResult,
        //  IValidatedRegex,
         IValidConstructedRegex
      } from './regex-engine.interfaces'

export class LocalRegex extends RegexEngine {
  protected lastRegexError = '';
  protected lastRegexHadError = false;

  constructor (engine: IRegexConfig) {
    super(engine);
  }

  /**
   * LocalRegex::test() tests the supplied regex to see if it is
   * valid and returns any error message generated by invalid regex
   *
   * @param regex a raw regular expression without delimiters or
   *              modifiers/flags
   * @param modifiers a list of modifiers/flags to augment the
   *              regex's behavior
   * @param delimiters (not used by localRegex) delimiter character
   *              to mark the begining and end of the regex
   *              (and separate the regex form the modifiers/flags)
   * @returns an empty string if the regex is valid or the error
   *              message generated by the invalid regex
   */
  public test(regex: string, modifiers: string, delimiters?: IDelimPair) : boolean {
    let tmp;
    try {
      tmp = this._getRegexObject(regex, modifiers);
    } catch(e) {
      this.lastRegexError = e.message;
      return false;
    }
    return true;
  }

  public getLastError(id: number) : IRegexError {
    if (this.lastRegexHadError) {
      // TODO: do whole load of testing to extract as much meta info about regex error as possible
      return {
        badCharacter: '',
        messages: [this.lastRegexError],
        offset: 0,
        rawMessage: this.lastRegexError,
        regexID: id
      };
    } else {
      throw new Error('Last Regex was valid. Do not call localRegex::getLastError() if localRegex::test() returned true.');
    }
  }

  /**
   * LocalRegex::replace() applies regexes to strings and updates
   * them using the regex's replace string
   *
   * @param input an array of one (or more) strings to which all of
   *              the (one or more) supplied regular expressions
   *              are applied
   * @param regexes an array of one (or more) regular expressions to
   *              which all of the (one or more) input strings
   *              are applied
   * @returns an array of updated input strings changed by each
   *              successive supplied regex
   */
  public replace(input: string[], regexes: IRegexPair[]) : string[] {
    const constructedRegexes = this._getConstructedRegexes(regexes);

    const regexReducer = (accumulator: string, regex : IValidConstructedRegex) : string => {
        return accumulator.replace(regex.find, regex.replace);
    }

    const validRegexes : IValidConstructedRegex[] = constructedRegexes.filter(this.isValidRegex);

    const output = input.map(str => {
      return validRegexes.reduce(regexReducer, str);
    });

    return output;
  }

  /**
   * LocalRegex::match() applies regexes to strings to see what is
   * matched in that string using that regex
   *
   * @param input an array of one (or more) strings to which all of
   *              the (one or more) supplied regular expressions
   *              are applied
   * @param regexes an array of one (or more) regular expressions to
   *              which all of the (one or more) input strings
   *              are applied
   * @returns an array of regex test results
   */
  public match(input: string[], regexes: IRegexPair[]) : ICumulativeTestResults[] {
    const constructedRegexes = this._getConstructedRegexes(regexes);

    const innerMap = (str: string) => (regex : IValidConstructedRegex | IInvalidConstructedRegex) : IRegexTestResult => {
      // let ok : boolean = false;
      let results : ISimpleTestResult = {
        executionTime: 0,
        matches: []
      };
      let isValid : IRegexIsValid | IRegexIsInValid = { valid: true };
      if (this.isValidRegex(regex)) {
        if (regex.find.global === true) {
          results  = this._regexTestGlobal(regex.find, str);
          // ok = true;
        } else {
          results  = this._regexTestNonGlobal(regex.find, str);
        }

        if (this.chainRegexes) {
          // modify string so next regex uses the updated version
          str = str.replace(regex.find, regex.replace);
        }
      } else if (this.regexHasError(regex)) {
        isValid = {
          error: regex.error,
          valid: false
        }
      }

      const output : IRegexTestResult = {
        error: isValid,
        executionTime: results.executionTime,
        matches: results.matches,
        regexID: regex.regexID
      }

      return output;
    }

    const outerMap = (str: string, i: number) : ICumulativeTestResults => {
      const allRegexMatches : IRegexTestResult[] = constructedRegexes.map(innerMap(str));

      const cumulativeTime = allRegexMatches.reduce((accum, matchObj) => {
         return accum + matchObj.executionTime
      }, 0);

      return {
        allMatches: allRegexMatches,
        inputID: i,
        totalExecutionTime: cumulativeTime
      }
    }

    return input.map(outerMap);
  }

  /**
   * Generic function that builds a list of reusable RegExp objects
   * that can be used either for testing or for replacing
   *
   * @param regexes a list of one or more regular expression pairs
   */
  protected _getConstructedRegexes(regexes: IRegexPair[]) : Array<(IValidConstructedRegex | IInvalidConstructedRegex)> {
    let tmpRegex : null | RegExp = null;

    const regexMap = (regexPair : IRegexPair) : IValidConstructedRegex | IInvalidConstructedRegex => {
      try {
        tmpRegex = this._getRegexObject(regexPair.regex, regexPair.modifiers);
      } catch(e) {
        return {
          error: {
            badCharacter: '',
            messages: [''],
            offset: -1,
            rawMessage: e.message,
            regexID: regexPair.id
          },
          regexID: regexPair.id,
          replace: regexPair.replace
        };
      }
      return {
        find: tmpRegex,
        regexID: regexPair.id,
        replace: regexPair.replace
      }
    }

    return regexes.map(regexMap);
  }

  protected _getValidConstructedRegexes (regexes: IRegexPair[]) : IValidConstructedRegex[] {
    let tmpRegex : null | RegExp = null;

    const regexMap = (regexPair : IRegexPair) : IValidConstructedRegex | false => {
      try {
        tmpRegex = this._getRegexObject(regexPair.regex, regexPair.modifiers);
      } catch(e) {
        return false;
      }
      return {
        find: tmpRegex,
        regexID: regexPair.id,
        replace: regexPair.replace
      }
    }

    return regexes.map(regexMap).filter(this.isValidRegex);
  }

  /**
   * localRegex::_getRegexObject() returns a single regular
   * expression object that can be used for testing or replacing
   *
   * @param regex string to be used as a regular expression.
   * @param modifiers string of modifiers/flags to augment the
   *              behavior of the regex
   */
  protected _getRegexObject(regex: string, modifiers: string) : RegExp {
    let output : RegExp;
    try {
      output = new RegExp(regex, modifiers);
    } catch (e) {
      throw new Error(e);
    }
    return output;
  }

  /**
   * _IRegexTestGlobal() builds an array of RegexMatch objects created by a RegExp object with the Global flag set
   *
   * @param regex RegExp object
   * @param input string to be tested against the regex
   */
  protected _regexTestGlobal(regex: RegExp, input: string) : ISimpleTestResult {
    let output : IRegexMatch[] = [];

    let startTime = Date.now();
    let matches = regex.exec(input);
    let ellapsedTime = (Date.now() - startTime);

    let matchCount = 0;
    while (matches !== null) {

      const newMatch : IRegexMatch = this._regexTestInner(matches);

      const startPosition = regex.lastIndex - matches[0].length;

      output = output.concat([{...newMatch, position: startPosition}]);

      matchCount += 1;

      startTime = Date.now();
      matches = regex.exec(input);
      ellapsedTime = (Date.now() - startTime);
    }

    return {
      executionTime: ellapsedTime,
      matches: output
    }
  }

  /**
   * localRegex::_sanitiseForRegex() takes a string and makes it safe
   * to use as part of a regex
   *
   * @param input string to be sanitised for later use in a regex
   * @returns a string that can be incorporated into a regex without
   *              any impact on that regex.
   */
  protected _sanitiseForRegex(input: string) : string {
    return input.replace(/([\[\]{}^$()?*+|])/ig, '\\$1')
  }


  /**
   * LocalRegex::_regexTestNonGlobal() builds an array of zero or one
   * RegexMatch objects created by a RegExp object with no Global
   * flag set
   *
   * @param regex RegExp object
   * @param input string to be tested against the regex
   */
  protected _regexTestNonGlobal(regex: RegExp, input: string) : ISimpleTestResult {
    let output : ISimpleTestResult = {
      executionTime: 0,
      matches: []
    };

    const startTime : number = Date.now();
    const tmp = regex.exec(input);
    const execTime = (Date.now() - startTime)

    // This is just to get around TS lint issue
    output = {
      executionTime: execTime,
      matches: []
    };

    if (tmp !== null) {
      let newMatch : IRegexMatch;
      newMatch = this._regexTestInner(tmp);

      const offsetRegex = new RegExp('^(.*?)' + this._sanitiseForRegex(newMatch.whole) + '.*$')
      const lead = input.replace(offsetRegex, '$1');

      newMatch.position = lead.length;
      output.matches.push(newMatch);
    }

    return output;
  }

  /**
   * LocalRegex::_regexTestInner() builds a RegexMatch object from what is returned
   * by RegExp.exec()
   *
   * @param matches object returned by RegExp.prototype.exec()
   */
  protected _regexTestInner(matches: RegExpExecArray) : IRegexMatch {
    let matchParts : any = {};

    // This is just to get around TS lint issue
    matchParts = {};

    if (matches.length > 1) {
      for (let a = 1; a < matches.length; a += 1) {
        const b = "" + a;
        matchParts[b] = matches[a];
      }
    }

    return {
      parts: matchParts,
      position: 0,
      whole: matches[0]
    };
  }
}