# can-view-parser

[![Build Status](https://travis-ci.org/canjs/can-view-parser.png?branch=master)](https://travis-ci.org/canjs/can-view-parser)

Parses html and magic tags.

- <code>[parse(html, handler, [returnIntermediate])](#parsehtml-handler-returnintermediate)</code>
- <code>[ParseHandler Object](#parsehandler-object)</code>
  - <code>[start(tagName, unary)](#starttagname-unary)</code>
  - <code>[end(tagName, unary)](#endtagname-unary)</code>
  - <code>[close(tagName)](#closetagname)</code>
  - <code>[attrStart(attrName)](#attrstartattrname)</code>
  - <code>[attrEnd(attrName)](#attrendattrname)</code>
  - <code>[attrValue(value)](#attrvaluevalue)</code>
  - <code>[chars(value)](#charsvalue)</code>
  - <code>[comment(value)](#commentvalue)</code>
  - <code>[done()](#done)</code>

## API


### `parse(html, handler, [returnIntermediate])`


```js
can.view.parser("<h1> ....", {
	start:     function( tagName, unary ){},
	end:       function( tagName, unary ){},
	close:     function( tagName ){},
	attrStart: function( attrName ){},
	attrEnd:   function( attrName ){},
	attrValue: function( value ){},
	chars:     function( value ){},
	comment:   function( value ){},
	special:   function( value ){},
	done:      function( ){}
});
```


1. __html__ <code>{String|Object}</code>:
  A mustache and html string to parse or an intermediate object the represents a previous parsing.
1. __handler__ <code>{[ParseHandler](#parsehandler-object)}</code>:
  An object of function call backs.
1. __returnIntermediate__ <code>{Boolean}</code>:
  If true, returns a JS object representation of the parsing.
  
  
### ParseHandler `{Object}`

A thing that handles 



#### `Object`


#### `start(tagName, unary)`


1. __tagName__ <code>{String}</code>:
  The name of the tag.
1. __unary__ <code>{Boolean}</code>:
  If this tag is unary (has no closing tag).
  

#### `end(tagName, unary)`


1. __tagName__ <code>{String}</code>:
  The name of the tag.
1. __unary__ <code>{Boolean}</code>:
  If this tag is unary (has no closing tag).
  

#### `close(tagName)`


1. __tagName__ <code>{String}</code>:
  The name of the tag.
  

#### `attrStart(attrName)`


1. __attrName__ <code>{String}</code>:
  The name of the attribute.
  

#### `attrEnd(attrName)`


1. __attrName__ <code>{String}</code>:
  The name of the attribute.
  

#### `attrValue(value)`


1. __value__ <code>{String}</code>:
  The value discovered associated with an attribute.
  

#### `chars(value)`


1. __value__ <code>{String}</code>:
  The character data within the tag.
  

#### `comment(value)`


1. __value__ <code>{String}</code>:
  The Comment within the tag.
  

#### `done()`

## Contributing

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm install
node build
```

### Running the tests

Tests can run in the browser by opening a webserver and visiting the `test.html` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```
