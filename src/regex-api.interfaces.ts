
// ===============================================
// START: Interfaces



export interface IAPIResponse {
  // Whether or not the request was OK or not
  ok: boolean,
  // Code for response export interface success/error export interface
  code: number,
  // List of results for test of each supplied regex
  content: [string | IRegexError | ITestResponse | IMatchResponse | IReplaceResponse] | IAPIConfig,
  // Human readable description of success/error export interface
  message: string
}



//  END:  Interfaces
// ===============================================
// START: Types



export interface IDelimiters {
  open: string,
  close: string,
}

export interface IRegex {
  id: number,
  // Regular expression pattern (without delimiters or modifiers
  pattern: string,
  // Regular expression modifiers
  modifiers: string,
  // Regular expression
  delimiters: IDelimiters
}

export interface IRegexMatchReplace extends IRegex {
  id: number,
  pattern: string,
  modifiers: string,
  delimiters: IDelimiters,
  // Replacement string/pattern
  replace: string,
  // Whether or not to transform white space escape sequences in the `replace` string into their normal white space character equivalents
  transformWhiteSpace: boolean
}

export interface IMatchConfig {
  // The maximum number of characters a captured sub-pattern can be before it is truncated
  maxSubMatchLen: number,
  // The maximum number of characters the whole matched pattern can be before it is truncated
  maxWholeMatchLen: number,
  // The maximum number of characters the returned sample should be.
  maxReturnSampleLen: number
}

export interface ISamples {
  // List of sample strings regexes are to be applyed to
  sampleStrs: [string],
  // If splitChar is not empry string, split the sample string on that chatacter
  splitChar: string,
  // Trim whitec space from begining and end of samples before processing regexes
  trimBefore: boolean,
  // Trim whitec space from end of samples after processing regexes
  trimAfter: boolean
}




// -----------------------------------------------
// START: Request export interfaces


export interface IAPIrequest {
  type: ERequestMode
}

export interface IAPItestRequest extends IAPIrequest {
  type: ERequestMode,
  // List of regexes to be tested for validity
  regexes: [IRegex]
}

export interface IAPIreplaceRequest extends IAPItestRequest {
  type: ERequestMode,
  // List of regexes to apply to sample strings
  regexes: [IRegexMatchReplace],
  // List of sample strings to which regexes are to be applied
  samplestrings: [string]
}

export interface IAPImatchRequest extends IAPIreplaceRequest {
  type: ERequestMode,
  regexes: [IRegexMatchReplace],
  samplestrings: [string]
  // Whether or not to apply find/replace sequentially on strings or to apply find/replace to fresh version of original string
  chainRegexes: boolean,
  // Control how much text is returned for each match
  matchConfig: IMatchConfig
}

export interface IAPIconfigRequest extends IAPIrequest {
  type: ERequestMode.config,
}


//  END:  Request export interfaces
// -----------------------------------------------
// START: Response export interfaces



export interface IAPIinvalidRequestResponse extends IAPIResponse {
  // Whether or not the request was OK or not
  ok: false,
  // Code for response export interface success/error export interface
  code: number,
  // Error message
  content: [string],
  // Human readable description of success/error export interface
  message: string
}

export interface IAPItestResponse extends IAPIResponse {
  // Whether or not the request was OK or not
  ok: true,
  // Code for response export interface success/error export interface
  code: number,
  // List of results for test of each supplied regex
  content: [ITestResponse],
  // Human readable description of success/error export interface
  message: string
}

export interface IAPImatchResponse extends IAPIResponse {
  ok: true,
  code: number,
  content: [IMatchResponse],
  message: string,
  // Whether or not contents objects include timings for processing of regexes
  hasTiming: boolean
}

export interface IAPIreplaceResponse extends IAPIResponse {
  ok: true,
  code: number,
  content: [IReplaceResponse],
  message: string,
  // Whether or not contents objects include timings for processing of regexes
  hasTiming: boolean
}

export interface IAPIconfigResponse {

}

// - - - - - - - - - - - - - - - - - - - - - - - -
// START: Response sub-type interfaces


export interface IMatchParts {
  key: string | number,
  value: string
}

export interface IResponseCapturedMatches {
  wholeMatch: string,
  parts: [IMatchParts],
}

export interface IRegexError {
  // If there's an issue within the regex pattern. badCharacter is the character at which the issue starts
  badCharacter: string,
  // Message delimiters errors
  delimiterError: string,
  // Message for modifiers errors
  modifierError: string,
  // If there's an issue within the regex pattern. offset is the index of the character at which the issue starts
  offset: number,
  // Message for pattern errors
  patternError: string,
  // Raw error message generated by regex engine
  rawMessage: string,
}

export interface IResponseRegex {
  id: number,
  // Whether or not the regex (as a whole) was valid
  isValid: boolean,
  // Details about errors in regex
  error: IRegexError
}


export interface ITestResponse {
  regex: IResponseRegex
}

export interface IMatchResponse extends ITestResponse {
  regex: IResponseRegex,
  // List of matches for a given regex & supplied strings
  matches: [IResponseCapturedMatches],
  // number of miliseconds the matching took the engine to execute (if available for that engine/platform)
  duration: number
}

export interface IReplaceResponse {
  // List of supplied transformed sample strings, modified by supplied regexes
  transformedSamples: [ITransformedSample],
}

export interface ITransformedSample {
  sample: [string],
  duration: number
}

export interface IAPIConfig {

}


//  END:  Response sub-type interfaces
// - - - - - - - - - - - - - - - - - - - - - - - -


//  END:  Response interfaces
// -----------------------------------------------



//  END:  Types
// ===============================================
// START: Enums

enum ERequestMode {
  test,
  match,
  replace,
  config // Get API's current client specific config settings
}

//  END:  Enums
// ===============================================
// START: Scalars

//  END:  Scalars
// ===============================================
