<?php

/**
 * This file contains a class for handling requests to the PHP
 * implementation of Regex API
 *
 * PHP VERSION: ^7.4
 *
 * @category RegexAPI
 * @package  RegexAPI
 * @author   Evan Wills <evan.wills@gmail.com>
 * @license  MIT <url>
 * @link     https://github.com/regex-api
 */

require_once __DIR__.'/regex.class.php';

/**
 * Handle user supplied request data
 *
 * @category RegexAPI
 * @package  RegexAPI
 * @author   Evan Wills <evan.wills@gmail.com>
 * @license  MIT <url>
 * @link     https://github.com/regex-api
 */
class RegexAPI
{
    /**
     * The maximum number of regular expressions allowed to be
     * processed per request
     *
     * @var integer
     */
    static private $_maxRegexes = 100;

    /**
     * The maximum number of sample strings allowed to be
     * processed per request
     *
     * @var integer
     */
    static private $_maxSamples = 200000;

    /**
     * The maximum number characters allowed per sample
     *
     * @var integer
     */
    static private $_maxSampleLength = 1000000;

    /**
     * The maximum total number characters for all samples combined
     *
     * @var integer
     */
    static private $_maxTotalSampleLength = 1000000;

    /**
     * List of regex objects for testing or transforming samples
     *
     * @var array
     */
    private $_regexes = array();

    /**
     * List of sample strings to be searched or transformed
     *
     * @var array
     */
    private $_samples = array();

    /**
     * Undocumented variable
     *
     * @var string
     */
    private $_mode = '';

    /**
     * List of valid modes for the API
     *
     * @param string $json
     */
    private $_modes = array(
        'test',
        'match',
        'replace',
        'config' // return API's client specific config settings
    );

    /**
     * Whether or not to do find and replace on sample before running
     * the previous regular expression
     *
     * @var boolean
     */
    private $_chainRegexes = true;

    /**
     * Status code for this object (zero means no errors)
     *
     * @var integer
     */
    private $_errorCode = 0;

    /**
     * Human readable error message to return with response.
     * (Only applies to request as a whole, not individual regular
     *  expressions.)
     *
     * @var string
     */
    private $_errorMessage = '';

    /**
     * When returning match results it's useful to show what the
     * sample the match was taken from looked like. However There's
     * no real need to send the whole sample back to the user when
     * they already have it on their machine.
     *
     * This tells PHP how much of the sample to return with the response.
     *
     * @var integer
     */
    private $_maxReturnSampleLength = 300;

    /**
     * Undocumented function
     *
     * @param string $json JSON received from $_GET or $_POST request
     */
    public function __construct(string $json)
    {
        $json = trim($json);
        if ($json === '') {
            $this->_errorCode = 201;
            $this->_errorMessage = 'JSON cannot be an empty string';
            return;
        }

        try {
            $data = json_decode($json, true);
        } catch (Exception $e) {
            $this->_errorCode = 202;
            $this->_errorMessage = 'Invalid JSON: '.$e->getMessage();
            return;
        }

        if (!array_key_exists('type', $data)) {
            $this->_errorCode = 100;
            $this->_errorMessage = 'Request data is missing the type field';
            return;
        } elseif (!is_string($data['type'])) {
            $this->_errorCode = 101;
            $this->_errorMessage = 'Request data.type is invalid. '.
                'Expecting string. Found '.gettype($data['type']).'.';
            return;
        } elseif (!in_array($data['type'], $this->_modes)) {
            $this->_errorCode = 102;
            $this->_errorMessage = 'Request data.type is invalid. '.
                'Expecting one of the following: "'.
                implode('", "', $this->_modes).'". '.
                'Found: "'.$data['type'].'"';
            return;
        } else {
            $this->_mode = $data['type'];
        }


        $func = ($this->_mode === 'test') ? 'Test' : 'Replace';
        $func = '_validate'.$func.'Regex';


        if (!array_key_exists('regexes', $data)) {
            $this->_errorCode = 110;
            $this->_errorMessage = 'Request data is missing the regexes field';
            return;
        } elseif (!is_array($data['regexes'])) {
            $this->_errorCode = 111;
            $this->_errorMessage = 'Request data.regexes is invalid. '.
                'Expecting array. Found '.gettype($data['regexes']).'.';
            return;
        } elseif (count($data['regexes']) === 0) {
            $this->_errorCode = 112;
            $this->_errorMessage = 'Request data.regexes contains no '.
                'regular expressions. '.
                'What\'s the point of this request?';
            return;
        } elseif (count($data['regexes']) > self::$_maxRegexes) {
            $this->_errorCode = 113;
            $this->_errorMessage = 'Request data.regexes contains '.
                'too many regular expressions. '.
                'Naughty! Naughty! We only allow '.self::$_maxRegexes.
                '. Received '.count($data['regexes']);
            return;
        } else {
            foreach ($data['regexes'] as $value) {
                $tmp = $this->$func($value);
                if ($tmp === false) {
                    return;
                } else {
                    $this->_regexes[] = $tmp;
                }
            }
        }

        if ($this->_mode !== 'test') {
            if (!array_key_exists('samplestrings', $data)) {
                $this->_errorCode = 120;
                $this->_errorMessage = 'Request data is missing the '.
                    'samplestrings field';
                return;
            } elseif (!is_array($data['samplestrings'])) {
                $this->_errorCode = 121;
                $this->_errorMessage = 'Request data.samplestrings is '.
                   'invalid. Expecting array. Found '.
                   gettype($data['samplestrings']).'.';
                return;
            } elseif (count($data['samplestrings']) === 0) {
                $this->_errorCode = 122;
                $this->_errorMessage = 'Request data.samplestrings '.
                    'contains no sample strings. '.
                    'You must provide at least one empty string';
                return;
            } elseif (count($data['samplestrings']) > self::$_maxSamples) {
                $this->_errorCode = 113;
                $this->_errorMessage = 'Request data.samplestrings '.
                    'contains too many sample strings. '.
                    'Naughty! Naughty! We only allow '.self::$_maxSamples.
                    '. Received '.count($data['samplestrings']);
                return;
            } else {
                $total = 0;
                foreach ($data['samplestrings'] as $sample) {
                    $len = strlen($sample);
                    $total += $len;
                    if (strlen($sample) > self::$_maxSampleLength) {
                        $this->_errorCode = 114;
                        $this->_errorMessage = 'Request data.samplestrings '.
                            'contains a sample with too many characters. '.
                            'We only allow '.self::$_maxSampleLength.
                            'characters per sample. '.
                            'Received '.count($data['samplestrings']);
                        return;
                    } elseif ($total > self::$_maxTotalSampleLength) {
                        $this->_errorCode = 115;
                        $this->_errorMessage = 'The cumulative '.
                            'character count of data.samplestrings ('.
                            $total.') excedes the maximum cumulative '.
                            'character count ('.self::$_maxTotalSampleLength.
                            ') this instance of RegexAPI will process';
                        return;
                    }
                    $this->_samples[] = $sample;
                }
            }

            if (!array_key_exists('chainRegexes', $data)) {
                $this->_errorCode = 130;
                $this->_errorMessage = 'Request data is missing the '.
                    'chainRegexes field';
                return;
            } elseif (!is_bool($data['chainRegexes'])) {
                $this->_errorCode = 131;
                $this->_errorMessage = 'Request data.chainRegexes is '.
                   'invalid. Expecting boolean. Found '.
                   gettype($data['chainRegexes']).'.';
                return;
            } else {
                $this->_chainRegexes = $data['chainRegexes'];
            }

            if ($this->_mode === 'match') {
                if (!$this->_validateMatchConfig($data)) {
                    return;
                }
            }
        }
    }

    /**
     * Process regular expressions and strings
     *
     * @return string
     */
    public function getResponseJSON()
    {
        $output = array(
            'ok' => ($this->_errorCode === 0),
            'code' => $this->_errorCode,
            'content' => array(''),
            'message' => $this->_errorMessage,
            'hasTiming' => ($this->_errorCode === 0 && $this->_mode !== 'test')
        );
        if ($this->_errorCode === 0) {
            $func = $this->_mode;
            $output['content'] = $this->$func();
        }

        return json_encode($output);
    }

    /**
     * Test all regular expressions
     *
     * @return array
     */
    public function test()
    {
        $output = array();
        for ($b = 0; $b < count($this->_regexes); $b += 1) {
            $output[] = $this->_regexes[$b]->getError();
        }
        return $output;
    }

    /**
     * Apply all regular expressions to all strings
     *
     * @return array
     */
    public function match()
    {
        $output = array();

        $regexC = count($this->_regexes);
        for ($a = 0; $a < count($this->_samples); $a += 1) {
            $sample = $this->_samples[$a];
            $tmp1 = array(
                'sample' => $this->_truncateSample($sample),
                'regexes' => array()
            );
            for ($b = 0; $b < $regexC; $b += 1) {
                $regex = $this->_regexes[$b];

                $tmp2 = array(
                    'regex' => $regex->getError(),
                    'matches' => array(),
                    'duration' => 0
                );

                if ($regex->isValid() === true) {
                    $tmp = $regex->match($sample);
                    $tmp2 = array_merge($tmp2, $tmp);

                    unset($tmp);

                    if ($this->_chainRegexes === true && $b < $regexC - 1) {
                        // This is not the last regex in the list
                        // So we'll apply the find and replace
                        $sample = $regex->replace($sample);
                    }
                }
                $tmp1['regexes'][] = $tmp2;
                unset($regex, $tmp2);
            }
            $output[] = $tmp1;
            unset($tmp1);
        }

        return $output;
    }

    /**
     * Test all regular expressions
     *
     * @return array
     */
    public function replace()
    {
        $output = array();

        for ($a = 0; $a < count($this->_samples); $a += 1) {
            $sample = $this->_samples[$a];
            $duration = 0;
            for ($b = 0; $b < count($this->_regexes); $b += 1) {
                if ($this->_regexes[$b]->isValid() === true) {
                    $tmp = $this->_regexes[$b]->replace($sample);
                    $sample = $tmp['sample'];
                    $duration += $tmp['duration'];
                }
            }
            $ouput[] = array(
                'sample' => $sample,
                'duration' => $duration
            );
        }

        return $output;
    }


    /**
     * Set the maximum length of the sub-pattern match
     *
     * @param integer $input Maximum number of characters subpattern
     *                       match can be before being truncated
     *
     * @return boolean
     */
    static public function setMaxRegexes(int $input)
    {
        if ($input < 1) {
            throw new Exception(
                'Regex::setMaxRegexes() expects only parameter to '.
                'be an integer greater than 1. '.$input.' given.'
            );
        }

        self::$_maxRegexes = $input;
    }

    /**
     * Set the maximum length of the sub-pattern match
     *
     * @param integer $input Maximum number of characters subpattern
     *                       match can be before being truncated
     *
     * @return boolean
     */
    static public function setMaxSamples(int $input)
    {
        if ($input < 1) {
            throw new Exception(
                'Regex::setMaxSamples() expects only parameter to '.
                'be an integer greater than 1. '.$input.' given.'
            );
        }

        self::$_maxSamples = $input;
    }

    /**
     * Set the maximum length of the sub-pattern match
     *
     * @param integer $input Maximum number of characters subpattern
     *                       match can be before being truncated
     *
     * @return boolean
     */
    static public function setMaxSampleLength(int $input)
    {
        if ($input < 1) {
            throw new Exception(
                'Regex::setMaxSampleLength() expects only parameter '.
                'to be an integer greater than 100. '.$input.' given.'
            );
        }

        self::$_maxSampleLength = $input;
    }

    /**
     * Set the maximum length of the sub-pattern match
     *
     * @param integer $input Maximum number of characters subpattern
     *                       match can be before being truncated
     *
     * @return boolean
     */
    static public function setMaxTotalSampleLength(int $input)
    {
        if ($input < 1) {
            throw new Exception(
                'Regex::setMaxSampleLength() expects only parameter '.
                'to be an integer greater than 100. '.$input.' given.'
            );
        }

        self::$_maxTotalSampleLength = $input;
    }

    /**
     * Ensure that the input is no longer than the allowed length
     *
     * @param string $input String to be truncated
     *
     * @return string
     */
    private function _truncateSample($input)
    {
        if (strlen($input) > $this->_maxReturnSampleLength) {
            return substr($input, 0, $this->_maxReturnSampleLength);
        } else {
            return $input;
        }
    }

    /**
     * Validate regex (test) object from JSON
     *
     * @param array $data Regex object from JSON
     *
     * @return Regex,false Regex object or false if $data had issues
     */
    private function _validateTestRegex(array $data)
    {
        $fields = array('id', 'pattern', 'modifiers', 'delimiters');
        for ($a = 0; $a < count($fields); $a += 1) {
            $key = $fields[$a];
            if (!in_array($key, $data)) {
                $this->_errorCode = 200 + $a;
                $this->_errorMessage = 'Regex is missing "'.$key.'" field';
                return false;
            }
        }

        try {
            $output = new Regex(
                $data['id'],
                $data['pattern'],
                '',
                $data['modifiers'],
                $data['delimiters'],
                false
            );
        } catch (Exception $e) {
            $this->_errorCode = 210;
            $this->_errorMessage = 'Regex data contains errors: "'.
                $this->_cleanRegexException($e->getMessage()).'"';
            return false;
        }

        return $output;
    }

    /**
     * Validate regex (replace) object from JSON
     *
     * @param array $data Regex object from JSON
     *
     * @return Regex,false Regex object or false if $data had issues
     */
    private function _validateReplaceRegex(array $data)
    {
        $fields = array(
            'id', 'pattern', 'modifiers', 'delimiters',
            'replace', 'transformWhiteSpace'
        );
        for ($a = 0; $a < count($fields); $a += 1) {
            $key = $fields[$a];
            if (!in_array($key, $data)) {
                $this->_errorCode = 200 + $a;
                $this->_errorMessage = 'Regex is missing "'.$key.'" field';
                return false;
            }
        }

        try {
            $output = new Regex(
                $data['id'],
                $data['pattern'],
                $data['replace'],
                $data['modifiers'],
                $data['delimiters'],
                $data['transformWhiteSpace']
            );
        } catch (Exception $e) {
            $this->_errorCode = 210;
            $this->_errorMessage = 'Regex data contains errors: "'.
                $this->_cleanRegexException($e->getMessage()).'"';
            return false;
        }

        return $output;
    }

    /**
     * Make Regex constructor exception relevant to RegexAPI context
     *
     * @param string $input Error message string from Exception
     *                      thrown by Regex constructor
     *
     * @return string
     */
    private function _cleanRegexException($input)
    {
        return preg_replace(
            '`(?<=Regex )constructor expects [a-z]+ parameter $([^\s]+)`i',
            'property `\1`',
            $input
        );
    }

    /**
     * Validate the Match config values from JSON
     *
     * @param array $data JSON data as associative array
     *
     * @return boolean TRUE if data was all valid, FALSE otherwise
     */
    private function _validateMatchConfig($data)
    {
        if (!array_key_exists('matchConfig', $data)) {
            $this->_errorCode = 140;
            $this->_errorMessage = 'Request data is missing the '.
                'matchConfig field';
            return false;
        } elseif (!is_array($data['matchConfig'])) {
            $this->_errorCode = 141;
            $this->_errorMessage = 'Request data.matchConfig is '.
                'invalid. Expecting array. Found '.
                gettype($data['matchConfig']).'.';
            return false;
        } else {
            $config = $data['matchConfig'];
            if (!array_key_exists('maxSubMatchLen', $config)) {
                $this->_errorCode = 142;
                $this->_errorMessage = 'Request data.matchConfig is '.
                    'missing the maxSubMatchLen field.';
                return false;
            } elseif (!is_int($config['maxWholeMatchLen'])) {
                $this->_errorCode = 143;
                $this->_errorMessage = 'Request data.matchConfig.maxWholeMatchLen '.
                    'must be an integer between 10 & '.Regex::HARD_MAX.'. '.
                    gettype($config['maxWholeMatchLen']).' given.';
                return false;
            } elseif ($config['maxWholeMatchLen'] < 10
                || $config['maxWholeMatchLen'] > Regex::getMaxWhole()
            ) {
                $this->_errorCode = 144;
                $this->_errorMessage = 'Request data.matchConfig.maxWholeMatchLen '.
                    'must be an integer between 10 & '.Regex::getMaxWhole().'. '.
                    gettype($config['maxWholeMatchLen']).' given.';
                return false;
            } else {
                Regex::setMaxWhole($config['maxSubMatchLen']);
            }

            if (!array_key_exists('maxSubMatchLen', $config)) {
                $this->_errorCode = 145;
                $this->_errorMessage = 'Request data.matchConfig is '.
                    'missing the maxSubMatchLen field.';
                return false;
            } elseif (!is_int($config['maxSubMatchLen'])) {
                $this->_errorCode = 146;
                $this->_errorMessage = 'Request data.matchConfig.maxSubMatchLen '.
                    'must be an integer between 10 & '.Regex::getMaxWhole().'. '.
                    gettype($config['maxSubMatchLen']).' given.';
                return false;
            } elseif ($config['maxSubMatchLen'] < 10
                || $config['maxSubMatchLen'] > Regex::getMaxWhole()
            ) {
                $this->_errorCode = 147;
                $this->_errorMessage = 'Request data.matchConfig.maxSubMatchLen '.
                    'must be an integer between 10 & '.Regex::getMaxPart().'. '.
                    gettype($config['maxSubMatchLen']).' given.';
                return false;
            } else {
                Regex::setMaxPart($config['maxSubMatchLen']);
            }

            if (!array_key_exists('maxReturnSampleLen', $config)) {
                $this->_errorCode = 145;
                $this->_errorMessage = 'Request data.matchConfig is '.
                    'missing the maxReturnSampleLen field.';
                return false;
            } elseif (!is_int($config['maxReturnSampleLen'])) {
                $this->_errorCode = 146;
                $this->_errorMessage = 'Request data.matchConfig.'.
                    'maxReturnSampleLen must be an integer between '.
                    '10 & '.Regex::getMaxWhole().'. '.
                    gettype($config['maxReturnSampleLen']).' given.';
                return false;
            } elseif ($config['maxReturnSampleLen'] < 10
                || $config['maxReturnSampleLen'] > Regex::getMaxWhole()
            ) {
                $this->_errorCode = 147;
                $this->_errorMessage = 'Request data.matchConfig.'.
                    'maxReturnSampleLen must be an integer between '.
                    '10 & '.Regex::getMaxPart().'. '.
                    gettype($config['maxReturnSampleLen']).' given.';
                return false;
            } else {
                $this->__maxReturnSampleLength = $config['maxReturnSampleLen'];
            }
        }
        return true;
    }
}
