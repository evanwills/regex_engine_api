import { EengineAccess, EflagsModifiersLabel, IRegexConfig } from './regex-engine.interfaces';

export const regexEngineConfig : IRegexConfig[] = [
  {
    allowedDelimiters: [ '/' ],
    allowedModifiers: ['g', 'i', 'm', 'u', 'y'],
    allowedPairedDelimiters: [],
    apiURL: '',
    defaultDelimiters: { open: '/', close: '/' },
    defaultModifiers: 'ig',
    docsURL: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions',
    id: 'vanillaJS',
    matchConfig: {
      chainRegexes: true,
      maxSubMatchLen: 300,
      maxSubMatchLenLimit: 500,
      maxWholeMatchLen: 300,
      maxWholeMatchLenLimit: 500,
      optionalTruncateLongStr: true,
      showWhiteSpaceChars: false,
      truncateLongStr: true
    },
    modifiersLabel: EflagsModifiersLabel.flags,
    name: 'Vanilla JS',
    type: EengineAccess.local
  },
  {
    allowedDelimiters: [ '/' ],
    allowedModifiers: ['g', 'i', 'm', 'u', 'y', 'n', 's', 'x', 'A'],
    allowedPairedDelimiters: [],
    apiURL: '',
    defaultDelimiters: { open: '/', close: '/' },
    defaultModifiers: 'ig',
    docsURL: 'http://xregexp.com/',
    id: 'XRegExp',
    matchConfig: {
      chainRegexes: true,
      maxSubMatchLen: 300,
      maxSubMatchLenLimit: 500,
      maxWholeMatchLen: 300,
      maxWholeMatchLenLimit: 500,
      optionalTruncateLongStr: true,
      showWhiteSpaceChars: false,
      truncateLongStr: true
    },
    modifiersLabel: EflagsModifiersLabel.flags,
    name: 'XRegExp',
    type: EengineAccess.local
  },
  {
    allowedDelimiters: [ '`', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '-', '+', '=', '{', '}', '|', '[', ']', ':', ';', '"', '', '<', '>', '?', ',', '.', '/' ],
    allowedModifiers: ['i', 'm', 's', 'x', 'A', 'D', 'S', 'U', 'X', 'J', 'u'],
    allowedPairedDelimiters: [
      { open: '(', close: ')' },
      { open: '<', close: '>' },
      { open: '[', close: ']' },
      { open: '{', close: '}' }
    ],
    apiURL: '',
    defaultDelimiters: { open: '`', close: '`' },
    defaultModifiers: 'is',
    docsURL: 'http://php.net/manual/en/book.pcre.php',
    id: 'pcre',
    matchConfig: {
      chainRegexes: true,
      maxSubMatchLen: 300,
      maxSubMatchLenLimit: 500,
      maxWholeMatchLen: 300,
      maxWholeMatchLenLimit: 500,
      optionalTruncateLongStr: false,
      showWhiteSpaceChars: false,
      truncateLongStr: true
    },
    modifiersLabel: EflagsModifiersLabel.modifiers,
    name: 'PHP PCRE',
    type: EengineAccess.remote
  }
];
