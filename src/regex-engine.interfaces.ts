export interface IAPIresponse {
  ok: boolean,
  code: number,
  content: any,
  returnType: string
}

export interface IConstructedRegex {
  error: IValidatedRegex,
  find: null | RegExp,
  regexID: number,
  replace: string
}

export interface IValidConstructedRegex extends IConstructedRegex {
  error: IRegexIsValid,
  find: RegExp,
  regexID: number,
  replace: string
}

export interface IInvalidConstructedRegex extends IConstructedRegex {
  error: IRegexIsInValid,
  find: null,
  regexID: number,
  replace: string
}

export interface IDelimPair {
  open: string,
  close: string
}

export interface IRegex {
  delimiters: IDelimPair
  modifiers: string,
  regex: string,
  error: IValidatedRegex
}

export interface IRegexPair extends IRegex {
  doReplaceOnTest: boolean,
  id: number,
  replace: string,
  transformEscapedWhiteSpace: boolean,
  longLine: boolean,
  multiLine: boolean,
  lineCount: number
}

export interface IRegexError {
  rawMessage: string,
  message: string,
  offset: number,
  badCharacter: string,
  regexID?: number
}

export interface IRegexMatch {
  whole: string;
  parts: any
  position?: number
}

export interface ISimpleTestResult {
  executionTime: number,
  matches: IRegexMatch[],
}

export interface IRegexTestResult extends ISimpleTestResult {
  error: IValidatedRegex,
  regexID: number
}

export interface ICumulativeTestResults {
  inputID: number,
  allMatches: IRegexTestResult[],
  totalExecutionTime: number,
}

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
  error: IRegexError | null,
  valid: boolean
}

export interface IRegexIsValid extends IValidatedRegex {
  error: null,
  valid: true
}
export interface IRegexIsInValid extends IValidatedRegex {
  error: IRegexError,
  valid: false
}

export interface IRegexConfig {
  allowedDelimiters: string[],
  apiURL: string,
  defaultDelimiters: IDelimPair,
  defaultModifiers: string,
  delimiterRequired: boolean,
  docsURL: string,
  id: string,
  modifiers: string[],
  modifiersName: flagsModifiers,
  name: string,
  pairedDelimiters: IDelimPair[]
  type: engineAccess
}

export enum engineAccess {
  local,
  remote
}

export enum flagsModifiers {
  flags,
  modifiers
}

// export interface IRegexEngine {
//   // constructor: (engine: IRegexConfig),
//   getApiURL: function() : string,
//   getDocsURL: function() : string,
//   getName: function() : string,
//   getID: function() : string,
//   getValidDelimiters: function(delim: IDelimPair): IValidatedDelimiters,
//   getDefaultDelimiters: function() : IDelimPair,
//   setDefaultDelimiters: function(delimiters: IDelimPair) : true,
//   delimiterIsRequired: function() : boolean,
//   getValidModifiers: function(modifiers : string) : IValidatedModifiers,
//   setDefaultModifiers: function(modifiers : string) : true,
//   isValid: function(regex: string, modifiers: string, delimiters?: IDelimPair) : string,
//   test: function(input: string[], regexes: IRegexPair[]) : ICumulativeTestResults[],
//   replace: function(input: string[], regexes: IRegexPair[]) : string[]
// }
