// namespace RegexEngineAPI {


// ==============================================
// START: global regex engine interfaces

/**
 * IAPIresponse provides a standardised format for API responses
 *
 * ok - true if there were no errors
 *
 * code - numeric UID for type of response
 *
 * content - whatever is needed or supplied by API
 *
 * returnType - human readable UID for type of response
 */
export interface IAPIresponse {
  ok: boolean,
  code: number,
  content: any,
  returnType: string
}


/**
 * IDelimPair stores opening and closing delimiter character
 * for a regex
 *
 * NOTE: for engines that do not require or do not accept delimiters
 *       (e.g. vanilla JS) these are just empty strings
 *
 * open - the opening delimiter character for a regex.
 *
 * close - the closing delimiter character for a regex
 *        NOTE: When a regex engine does not allow paired delimiters
 *              this will default to the opening delimiter
 */
export interface IDelimPair {
  open: string,
  close: string
}

/**
 * EengineAccess identifies whether the engine uses a remote or local
 * API call to do its heavy lifting
 */
export enum EengineAccess {
  local,
  remote
}

/**
 * EflagsModifiersLabel is used to standardise the naming of the field
 * used for modifiers/flags so it matches the convention used by
 * that engine
 */
export enum EflagsModifiersLabel {
  flags,
  modifiers
}

//  END:  global regex engine interfaces
// ==============================================
// START: local regex engine interfaces

/**
 * IConstructedRegex used by the internal workings of
 * RegexEngine::match() & RegexEngine::replace()
 *
 * regexID - UID for the regex (may or may not match the index for
 *           the regex's position in the list of regex pairs)
 * replace - regex replacement string to be used in RegexEngine::replace()
 *           NOTE: replace is also used when doing RegexEngine::match()
 *                 in "Chain regex" mode
 */
export interface IConstructedRegex {
  regexID: number,
  replace: string
}

/**
 * IValidConstructedRegex is used when a regex has no errors
 */
export interface IValidConstructedRegex extends IConstructedRegex {
  find: RegExp
}

/**
 * IInvalidConstructedRegex is used when a regex does have errors
 */
export interface IInvalidConstructedRegex extends IConstructedRegex {
  error: IRegexError
}

/**
 * IRegex a basic regex object with all the elements required for the
 * engine to construct a working regex
 *
 * delimiters - the opening and closing delimiters
 *
 * modifiers - characters to augment the behavior of the regex
 *
 * regex - the regluar expression pattern itself
 *
 * error - possible errors the regex engine might have encountered
 */
export interface IRegex {
  delimiters: IDelimPair
  modifiers: string,
  regex: string,
  error: IRegexIsValid | IRegexIsInValid
}

/**
 * IRegexPair used by the engine to do matching and replacing
 *
 * id - UID for the regex (may or may not match index in array of
 *      regex pairs)
 *
 * replace - replacement string used when doing caling replace()
 *
 * transformEscapedWhiteSpace - if TRUE and escaped whitespace
 *      character sequences are found, then convert those sequences
 *      into the whitespace characters they represent before doing
 *      find/replace
 */
export interface IRegexPair extends IRegex {
  id: number,
  replace: string,
  transformEscapedWhiteSpace: boolean
}

/**
 * IRegexError contains all the meta info that can possibly be
 * extracted using the error message supplied by the regex engine
 *
 * badCharacter - the character that caused the error
 *
 * messages - list of messages that were extracted from the raw error
 *      message supplied by the engine
 *
 * offset - the offset index of the character within the whole string
 *      NOTE: this is used for formatting the error part of the
 *            string to make it easier to debug where the error
 *            occured
 *
 * rawMessage - error message the engine provided when it encountered
 *      an occured
 *
 * regexID - (this is probably redundant and may be removed) the UID
 *      of the regex where the error occured
 */
export interface IRegexError {
  badCharacter: string,
  messages: string[],
  offset: number,
  rawMessage: string,
  regexID?: number
}

/**
 * IRegexMatch contains the whole string that was matched plus any
 * captured sub-patterns and the character offset of the start of
 * the match
 *
 * whole - the whole match
 *
 * parts - an array of captured sub patterns or an object with both
 *         named and indexed captured sub patterns
 *
 * position - the character offset of the start of the match.
 */
export interface IRegexMatch {
  whole: string;
  parts: any
  position?: number
}

/**
 * ISimpleTestResult is the most basic for of result, it just gives
 * the execution time and any matched patterns found
 *
 * executionTime - the total time it took to find all matches for a
 *         given input
 *
 * matches - the list of matched patterns from a single regex
 */
export interface ISimpleTestResult {
  executionTime: number,
  matches: IRegexMatch[],
}

/**
 * IRegexTestResult provides for additional error reporting and
 * context (via the regex ID)
 *
 * error - any possible regex error
 *
 * regexID - the UID of the regex pair the regex came from
 */
export interface IRegexTestResult extends ISimpleTestResult {
  error: IRegexIsValid | IRegexIsInValid,
  regexID: number
}

/**
 * ICumulativeTestResults is used for global matches and provides
 * additional metadata on total execution time and which input the
 * regex was applied to.
 *
 * inputID - UID for input the regex was applied to
 *
 * allMatches - all the matches for all the regexes that the input
 *         had applied to it
 *
 * totalExecutionTime - the total amount of time required to do all
 *         the matches for all the regexes on the single iput
 */
export interface ICumulativeTestResults {
  inputID: number,
  allMatches: IRegexTestResult[],
  totalExecutionTime: number,
}

/**
 * IDelimModError is a generic error message type for Modifier and
 * Delimitor errors
 *
 * invalidItems - list of characters that have caused issues
 *
 * message - the human readable string to identify the error.
 */
export interface IDelimModError {
  invalidItems: string[],
  message: string
}

export interface IValidatedModDelim {
  error: IDelimModError,
  valid: boolean
}
export interface IValidatedModifiers extends IValidatedModDelim {
  modifiers: string
}
export interface IValidatedDelimiters extends IValidatedModDelim {
  delimiters: IDelimPair
}

// export ReplacedInput: Array<string>

export interface IValidatedRegex {
  valid: boolean
}

export interface IRegexIsValid extends IValidatedRegex {
  valid: true
}

export interface IRegexIsInValid extends IValidatedRegex {
  error: IRegexError,
  valid: false
}

/**
 * IRegexConfig provides all the settings to configure a regex engine
 *
 * allowedDelimiters - list of non-alphanumeric characters that
 *         can be used as regex delimiters
 *
 * allowedModifiers - list of alphabetical characters that can
 *         augment the regex engine's behavior for a given regex
 *
 * allowedPairedDelimiters - list of delimPairs containing paired
 *         opening and closing delimiters that can be used by
 *         regex engine
 *
 * apiURL - URL for remote API end point
 *
 * chainRegexes - When multiple regex are used in match() mode if
 *         chainRegexes is TRUE, the find/replace is done on input
 *         before handing input off to next regex pair
 *
 * defaultDelimiters - stores default opening and closing delimiter
 *         character for a regex
 *
 * defaultModifiers - the default modifiers recommended for the engine
 *         e.g. in JavaScript 'ig' is used (especially in the context
 *              of testing) most of the time.
 *
 * docsURL - URL where useful documentation can be found for the
 *         regex engine
 *
 * id - UID for the regex engine
 *
 * modifiersLabel - label to be used to identify the modifiers string
 *
 * name - human readable name of the regex engine
 *
 * type - access type for regex engine (local or remote)
 */
export interface IRegexConfig {
  allowedDelimiters: string[],
  allowedModifiers: string[],
  allowedPairedDelimiters: IDelimPair[]
  apiURL: string,
  matchConfig: IMatchConfigExtra,
  defaultDelimiters: IDelimPair,
  defaultModifiers: string,
  docsURL: string,
  id: string,
  modifiersLabel: EflagsModifiersLabel,
  name: string,
  type: EengineAccess
}

/**
 * IMatchConfig is a list of config properties needed when doing
 * match operations
 *
 * chainRegexes - when multiple regexes are supplied, do find and
 *          replace (after matching) in input before starting match
 *          using next regex
 *
 * maxSubMatchLen - the maximum number of characters a matched
 *          subpattern should be before it is truncated.
 *          (Helps with request and rendering performance.)
 *
 * maxWholeMatchLen - the maximum number of characters the whole match
 *          can be before it's truncated.
 *          (Helps with request & rendering performance.)
 *
 * showWhiteSpaceChars - whether or not to convert white space
 *          characters to a visible representation of those
 *          characters in whole match and captured sub-patterns
 *          e.g. [tab], [space], [cr], [lf]
 *          NOTE: This should always be false for when IMatchConfig
 *                is used in IRemoteMatchRequest
 *
 * truncateLongStr: whether or not to truncate long whole match
 *          strings and matched sub-pattern strings
 */
export interface IMatchConfig {
  chainRegexes: boolean,
  maxSubMatchLen: number,
  maxWholeMatchLen: number,
  showWhiteSpaceChars: boolean,
  truncateLongStr: boolean
}

/**
 * IMatchConfigLimits used by regex engines to possibile values for
 * IMatchConfig properties
 *
 * maxSubMatchLenLimit - the highest value maxSubMatchLen can be set
 *           to for this regex engine
 *
 * maxWholeMatchLenLimit - the highest value maxWholeMatchLen can be
 *           set to for this regex engine
 *
 * optionalTruncateLongStr - whether or not truncateLongStr can be
 *           toggled on or off for this regex engine
 */
export interface IMatchConfigLimits {
  maxSubMatchLenLimit: number,
  maxWholeMatchLenLimit: number,
  optionalTruncateLongStr: boolean
}


/**
 * IMatchConfigExtra is a list of all config properties required by
 * regex engine to allow for safe updating of IMatchConfig properties
 *
 * chainRegexes - when multiple regexes are supplied, do find and
 *          replace (after matching) in input before starting match
 *          using next regex
 *
 * maxSubMatchLen - the maximum number of characters a matched
 *          subpattern should be before it is truncated.
 *          (Helps with request and rendering performance.)
 *
 * maxWholeMatchLen - the maximum number of characters the whole match
 *          can be before it's truncated.
 *          (Helps with request & rendering performance.)
 *
 * showWhiteSpaceChars - whether or not to convert white space
 *          characters to a visible representation of those
 *          characters in whole match and captured sub-patterns
 *          e.g. [tab], [space], [cr], [lf]
 *
 *          NOTE: This should always be false for when IMatchConfig
 *                is used in IRemoteMatchRequest
 *
 * truncateLongStr: whether or not to truncate long whole match
 *          strings and matched sub-pattern strings
 *
 * maxSubMatchLenLimit - the highest value maxSubMatchLen can be set
 *           to for this regex engine
 *
 * maxWholeMatchLenLimit - the highest value maxWholeMatchLen can be
 *           set to for this regex   engine
 *
 * optionalTruncateLongStr - whether or not truncateLongStr can be
 *           toggled on or off for this regex engine
 */
export interface IMatchConfigExtra extends IMatchConfig, IMatchConfigLimits {
}

export interface IRemoteReplace {
  input: string[],
  regexes: IRegexPair[],
}

export interface IRemoteMatch extends IRemoteReplace {
  config: IMatchConfig,
  input: string[],
  regexes: IRegexPair[]
}

export interface IRemoteTest {
  regex: string,
  modifiers: string,
  delimiters: IDelimPair
}


/**
 * IRemoteMatchRequest structure of request JSON object sent for
 * 'match' type remote API calls
 *
 * action - what the remote API is to do (must always be 'match')
 *
 * payload - what the remote API uses to do it.
 */
export interface IRemoteMatchRequest { // extends IRemoteRequest {
  action: 'match',
  payload: IRemoteMatch
}



/**
 * IRemoteReplaceRequest structure of request JSON object sent for
 * 'replace' type remote API calls
 *
 * action - what the remote API is to do (must always be 'replace')
 *
 * payload - what the remote API uses to do it.
 */
export interface IRemoteReplaceRequest { // extends IRemoteRequest {
  action: 'replace',
  payload: IRemoteReplace
}

/**
 * IRemoteTestRequest structure of request JSON object sent for
 * 'test' type remote API calls
 *
 * action - what the remote API is to do (must always be 'test')
 *
 * payload - what the remote API uses to do it.
 */
export interface IRemoteTestRequest { // xtends IRemoteRequest {
  action: 'test',
  payload: IRemoteTest
}

/**
 * IRequstGenerator callback function interface for used for
 * generating HTTP requests to remote server API
 *
 * @param request object type appropriate for specific request
 * @returns object appropriated for specific request.
 */
export interface IRequstGenerator {
  (request: IRemoteMatchRequest): Promise<ICumulativeTestResults[]>,
  (request: IRemoteReplaceRequest) : Promise<string[]>,
  (request: IRemoteTestRequest) : Promise<IRegexIsValid|IRegexIsInValid>
}


export type TmatchConfigLimitProps = keyof IMatchConfigLimits
export type TmatchConfigProps = keyof IMatchConfig
// }
