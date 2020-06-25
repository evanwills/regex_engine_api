# Regex Engine API

Regex Engine API is a ECMAscript/TypeScript API to allow you to test regular expressions using any language's Regex engine you have access to (and have an engine side API implementation.)

Because the API is written in ECMAscript, it comes with and ECMAscript implementation for RegExp. It also comes with a XRegExp implmentation. Because I have a background in PHP development and extensive experience using PHP's PCRE regex engine, it also comes with a PHP implementation of the API.

## Purpose

It's intended that this can be used as part of systems that allow users to create regexes when creating "things". e.g. If you have a system that builds web forms and allows form creators to set up field validation, then you could use this to ensure that the validation doesn't cause errors and that it is testing the right things.

## What it doesn't do

It is assumed that any authentication with back end servers is managed outside this module.

It also does not handle any of the view side of things. It also doesn't handle state. 

## What it does do

It just works with regular expressions. 

You give it some text and one or more regular expressions and it either:
* test the regex to see if it's valid, 
* applies the regex(s) to string(s) to find any matches or 
* transforms the string(s) by applying the regex(s) (in series) to the string and returning the result.
