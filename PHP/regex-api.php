<?php
/**
 * This file takes user (HTTP POST) supplied data and returns
 *
 * PHP VERSION: ^7.4
 *
 * @category RegexAPI
 * @package  RegexAPI
 * @author   Evan Wills <evan.wills@gmail.com>
 * @license  MIT <url>
 * @link     https://github.com/regex-api
 */

header('Content-Type:application/json');

$maxWholeMatch = 500;
$maxPartMatch = 500;
$maxRegexes = 30;
$maxSamples = 2048;
$maxSampleLength = 4096;
$maxTotalSampleLength = 32768;

$data = array_key_exists('data', $_POST) ? $_POST['data'] : false;

if ($data === false) {
    echo json_encode(
        array(
            'ok' => false,
            'code' => 200,
            'content' => array(''),
            'message' => 'data object was not supplied',
            'hasTiming' => false
        )
    );
    exit;
}

if (!file_exists(__DIR__.'regex-api.class.php')) {
    echo json_encode(
        array(
            'ok' => false,
            'code' => 500,
            'content' => array(''),
            'message' => 'Server error: Could not find regex API code',
            'hasTiming' => false
        )
    );
    exit;
}

require_once __DIR__.'regex-api.class.php';

Regex::setMaxWhole($maxWholeMatch);
Regex::setMaxPart($maxPartMatch);
RegexAPI::setMaxRegexes($maxRegexes);
RegexAPI::setMaxSamples($maxSamples);
RegexAPI::setMaxSampleLength($maxSampleLength);

$regexAPI = new RegexAPI($data);

echo $regexAPI->getResponseJSON();

exit;
