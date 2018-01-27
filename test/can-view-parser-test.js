var parser = require('can-view-parser');
var QUnit = require('steal-qunit');
var canDev = require('can-log/dev/dev');
var encoder = require('can-attribute-encoder');
var testHelpers = require('can-test-helpers');

QUnit.module("can-view-parser");

var makeChecks = function(tests){
	var count = 0;
	var makeCheck = function(name){
		return function(){
			if(count >= tests.length) {
				ok(false, "called "+name+" with "+JSON.stringify([].slice.call(arguments)));
			} else {
				var test = tests[count],
					args = test[1];
				equal(name, test[0], "test "+count+" "+name+"(");
				for(var i = 0 ; i < args.length; i++) {
					equal(arguments[i], args[i], (i+1)+" arg -> "+args[i]);
				}
				count++;
			}


		};
	};

	return {
		start: makeCheck("start"),
		end: makeCheck("end"),
		close: makeCheck("close"),
		attrStart: makeCheck("attrStart"),
		attrEnd: makeCheck("attrEnd"),
		attrValue: makeCheck("attrValue"),
		chars: makeCheck("chars"),
		comment: makeCheck("comment"),
		special: makeCheck("special"),
		done: makeCheck("done")
	};
};

test("html to html", function(){



	var tests = [
		["start", ["h1", false]],
		["attrStart", ["id"]],
		["attrValue", ["foo"]],
		["attrEnd", ["id"]],
		["special", ["#if"]],
		["special", ["."]],			//5
		["special", ["/if"]],
		["attrStart", ["class"]],
		["attrValue", ["a"]],
		["special", ["foo"]],
		["attrEnd", ["class"]],		//10
		["end", ["h1", false]],
		["chars", ["Hello "]],
		["special", ["message"]],
		["chars", ["!"]],
		["close",["h1"]],
		["done",[]]
	];



	parser("<h1 id='foo' {{#if}}{{.}}{{/if}} class='a{{foo}}'>Hello {{message}}!</h1>",makeChecks(tests));

});

test("uppercase html to html", function(){



	var tests = [
		['start', ['div', false]],
		['end', ['div', false]],
		["chars", ["sibling"]],
		['close', ['div']],
		['start', ['div', false]],
		['end', ['div', false]],
		["chars", ["sibling"]],
		['close', ['div']],
		['done', []]
	];



	parser("<DIV>sibling</DIV><DIV>sibling</DIV>", makeChecks(tests));

});

test("camelCase attributes stay untouched (svg) - #22", function(){



	var tests = [
		["start", ["svg", false]],
		["attrStart", ["viewBox"]],
		["attrValue", ["0 0 15 22"]],
		["attrEnd", ["viewBox"]],
		["end", ["svg", false]],
		["close", ["svg"]],
		["done", []]
	];



	parser('<svg viewBox="0 0 15 22"></svg>', makeChecks(tests));

});

test("camelCase tags stay untouched (svg)", function(){



	var tests = [
		['start', ['svg', false]],
		['end', ['svg', false]],
		['start', ['radialGradient', false]],
		['end', ['radialGradient', false]],
		['close', ['radialGradient']],
		['close', ['svg']],
		['done', []]
	];



	parser("<svg><radialGradient></radialGradient></svg>", makeChecks(tests));

});

test("special in an attribute in an in-tag section", function(){

	parser("<div {{#truthy}}foo='{{baz}}'{{/truthy}}></div>",makeChecks([
		["start", ["div", false]],
		["special", ["#truthy"]],
		["attrStart", ["foo"]],
		["special", ["baz"]],
		["attrEnd", ["foo"]],		//10
		["special",["/truthy"]],
		["end", ["div", false]],
		["close",["div"]],
		["done",[]]
	]));

});

test("special with a custom attribute", function(){

	parser('<div {{#attribute}} {{name}}="{{value}}" {{/attribute}}></div>',makeChecks([
		["start", ["div", false]],
		["special", ["#attribute"]],
		["special", ["name"]],
		["attrStart", [""]],
		["special", ["value"]],
		["attrEnd", [""]],		//10
		["special",["/attribute"]],
		["end", ["div", false]],
		["close",["div"]],
		["done",[]]
	]));


});

test("single attribute value", function(){

	parser('<input DISABLED/>',makeChecks([
		["start", ["input", true]],
		["attrStart", ["DISABLED"]],
		["attrEnd", ["DISABLED"]],
		["end", ["input", true]],
		["done",[]]
	]));
});

test("trailing linebreaks in IE", function(){
	parser("12345{{!\n  This is a\n  multi-line comment...\n}}67890\n",makeChecks([
		["chars", ["12345"]],
		["special", ["!\n  This is a\n  multi-line comment...\n"]],
		["chars", ["67890\n"]],
		["done",[]]
	]));
});


test("block are allowed inside anchor tags", function(){
	parser("<a><div></div></a>", makeChecks([
		['start', ['a', false]],
		['end', ['a', false]],
		['start', ['div', false]],
		['end', ['div', false]],
		['close', ['div']],
		['close', ['a']],
		['done', []]
	]));
});

test("anchors are allowed as children of inline elements - #2169", function(){
	parser("<span><a></a></span>", makeChecks([
		['start', ['span', false]],
		['end', ['span', false]],
		['start', ['a', false]],
		['end', ['a', false]],
		['close', ['a']],
		['close', ['span']],
		['done', []]
	]));
});

test("inline tags encapsulate inner block elements", function() {
	parser("<span><div></div></span>", makeChecks([
		['start', ['span', false]],
		['end', ['span', false]],
		['start', ['div', false]],
		['end', ['div', false]],
		['close', ['div']],
		['close', ['span']],
		['done', []]
	]));

	parser("<em><h1></h1></em>", makeChecks([
		['start', ['em', false]],
		['end', ['em', false]],
		['start', ['h1', false]],
		['end', ['h1', false]],
		['close', ['h1']],
		['close', ['em']],
		['done', []]
	]));
});

test("unordered lists will contain their list items", function() {
	parser("<ul><li></li><li></li></ul>", makeChecks([
		['start', ['ul', false]],
		['end', ['ul', false]],
		['start', ['li', false]],
		['end', ['li', false]],
		['close', ['li']],
		['start', ['li', false]],
		['end', ['li', false]],
		['close', ['li']],
		['close', ['ul']],
		['done', []]
	]));
});

test("supports single character attributes (#1132)", function(){
	parser('<circle r="25"></circle>', makeChecks([
		["start", ["circle", false]],
		["attrStart", ["r"]],
		["attrValue", ["25"]],
		["attrEnd", ["r"]],
		["end", ["circle", false]],
		["close", ["circle"]],
		["done", []]
	]));
});

test('accept custom tag with colon ":" #1108', function(){
	parser('<x:widget/>', makeChecks([
		["start", ["x:widget",true]],
		["end", ["x:widget", true]],
		["done", []]
	]));
});


test('output json', function(){
	var tests = [
		["start", ["h1", false]],
		["attrStart", ["id"]],
		["attrValue", ["foo"]],
		["attrEnd", ["id"]],
		["special", ["#if"]],
		["special", ["."]],			//5
		["special", ["/if"]],
		["attrStart", ["class"]],
		["attrValue", ["a"]],
		["special", ["foo"]],
		["attrEnd", ["class"]],		//10
		["end", ["h1", false]],
		["chars", ["Hello "]],
		["special", ["message"]],
		["chars", ["!"]],
		["close",["h1"]],
		["done",[]]
	];

	var intermediate = parser("<h1 id='foo' {{#if}}{{.}}{{/if}} class='a{{foo}}'>Hello {{message}}!</h1>",makeChecks(tests), true);



	parser(intermediate, makeChecks(tests) );
});

test('less than outside of an element', function(){
	var tests = [
		["start", ["h1", false]],
		["end", ["h1", false]],
		["chars", [" < "]],
		["close",["h1"]],
		["done",[]]
	];

	var intermediate = parser("<h1> < </h1>",makeChecks(tests), true);



	parser(intermediate, makeChecks(tests) );
});


test('allow () and [] to enclose attributes', function() {
	parser('<p [click]="test"></p>', makeChecks([
		["start", ["p", false]],
		["attrStart", ["[click]"]],
		["attrValue", ["test"]],
		["attrEnd", ["[click]"]],
		["end",["p"]],
		["close",["p"]],
		["done",[]]
	]));

	parser('<p (click)="test"></p>', makeChecks([
		["start", ["p", false]],
		["attrStart", [encoder.encode("(click)")]],
		["attrValue", ["test"]],
		["attrEnd", [encoder.encode("(click)")]],
		["end",["p"]],
		["close",["p"]],
		["done",[]]
	]));

	parser('<p (click-me)="test"></p>', makeChecks([
		["start", ["p", false]],
		["attrStart", [encoder.encode("(click-me)")]],
		["attrValue", ["test"]],
		["attrEnd", [encoder.encode("(click-me)")]],
		["end",["p"]],
		["close",["p"]],
		["done",[]]
	]));

	parser('<p (click_me)="test"></p>', makeChecks([
		["start", ["p", false]],
		["attrStart", [encoder.encode("(click_me)")]],
		["attrValue", ["test"]],
		["attrEnd", [encoder.encode("(click_me)")]],
		["end",["p"]],
		["close",["p"]],
		["done",[]]
	]));
});


test('allow {} to enclose attributes', function() {

	parser.parseAttrs('{a}="b" {{#c}}d{{/c}}',makeChecks([
		["attrStart", [encoder.encode("{a}")]],
		["attrValue", ["b"]],
		["attrEnd", [encoder.encode("{a}")]],
		["special",["#c"]],
		["attrStart", ["d"]],
		["attrEnd", ["d"]],
		["special",["/c"]],
	]));


});

test('tripple curly in attrs', function(){
	parser.parseAttrs('items="{{{ completed }}}"',makeChecks([
		["attrStart", ["items"]],
		["special",["{ completed "]],
		["attrEnd", ["items"]]
	]));
});

test('something', function(){
	parser.parseAttrs("c d='e'",makeChecks([
		["attrStart", ["c"]],
		["attrEnd", ["c"]],
		["attrStart", ["d"]],
		["attrValue", ["e"]],
		["attrEnd", ["d"]],
	]));

});

test('references', function(){

	parser("<year-selector *y />",makeChecks([
		["start", ["year-selector", true]],
		["attrStart", ["*y"]],
		["attrEnd", ["*y"]],
		["end",["year-selector"]],
		["done",[]]
	]));

});

test('quotes around attributes and other lazy attribute writing (#2097)', function(){

	parser("<c-d a={z}/>",makeChecks([
		["start", ["c-d", true]],
		["attrStart", ["a"]],
		["attrValue", ["{z}"]],
		["attrEnd", ["a"]],
		["end",["c-d"]],
		["done",[]]
	]));

	parser("<span v={{.}}/>",makeChecks([
		["start", ["span", true]],
		["attrStart", ["v"]],
		["special", ["."]],
		["attrEnd", ["v"]],
		["end",["span"]],
		["done",[]]
	]));



	parser("<div {{^f}} d {{/f}}/>",makeChecks([
		["start", ["div", true]],
		["special", ["^f"]],
		["attrStart", ["d"]],
		["attrEnd", ["d"]],
		["special", ["/f"]],
		["end",["div"]],
		["done",[]]
	]));
});

test('camelCased attributes are converted to spinal-case', function () {
	parser.parseAttrs("({camelCase})='assigned'", makeChecks([
		["attrStart", [encoder.encode("({camelCase})")]],
		["attrValue", ["assigned"]],
		["attrEnd", [encoder.encode("({camelCase})")]],
	]));
});

test('elements that have attributes with equal signs and no values are handled appropriately (#17)', function () {
	parser("<input class='toggle' type='checkbox' {($checked)}='complete' ($change)=>", makeChecks([
		["start", ["input", true]],
		["attrStart", ["class"]],
		["attrValue", ["toggle"]],
		["attrEnd", ["class"]],
		["attrStart", ["type"]],
		["attrValue", ["checkbox"]],
		["attrEnd", ["type"]],
		["attrStart", [encoder.encode("{($checked)}")]],
		["attrValue", ["complete"]],
		["attrEnd", [encoder.encode("{($checked)}")]],
		["attrStart", [encoder.encode("($change)")]],
		["attrEnd", [encoder.encode("($change)")]],
		["end", ["input"]],
		["done", []]
	]));
});

test('{{}} in attribute values are handled correctly (#34)', function () {
	var tests = [
		["start", ["h1", false]],
		["attrStart", ["class"]],
		["special", ["foo"]],
		["attrValue", ["a"]],
		["attrEnd", ["class"]],		//10
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 class='{{foo}}a'></h1>", makeChecks(tests));
});

test('> in attribute values are handled correctly', function() {
	parser('<h1 data-content="<b>foo</b>">bar</h1>', makeChecks([
		["start", ["h1", false]],
		["attrStart", ["data-content"]],
		["attrValue", ["<b>foo</b>"]],
		["attrEnd", ["data-content"]],		//10
		["end", ["h1", false]],
		["chars", ["bar"]],
		["close",["h1"]],
		["done",[]]
	]));

	parser('<h1 data-nothing="" data-something="something" data-content="<b>foo</b>" data-something-after="something-after">bar</h1>', makeChecks([
		["start", ["h1", false]],
		["attrStart", ["data-nothing"]],
		["attrEnd", ["data-nothing"]],		//10
		["attrStart", ["data-something"]],
		["attrValue", ["something"]],
		["attrEnd", ["data-something"]],		//10
		["attrStart", ["data-content"]],
		["attrValue", ["<b>foo</b>"]],
		["attrEnd", ["data-content"]],		//10
		["attrStart", ["data-something-after"]],
		["attrValue", ["something-after"]],
		["attrEnd", ["data-something-after"]],		//10
		["end", ["h1", false]],
		["chars", ["bar"]],
		["close",["h1"]],
		["done",[]]
	]));

	parser('<h1 data-first="<b>foo</b>" \n data-second="><>>>>><foo>>>/>> \n />"  \n >\nbar</h1>', makeChecks([
		["start", ["h1", false]],
		["attrStart", ["data-first"]],
		["attrValue", ["<b>foo</b>"]],
		["attrEnd", ["data-first"]],		//10
		["attrStart", ["data-second"]],
		["attrValue", ["><>>>>><foo>>>/>> \n />"]],
		["attrEnd", ["data-second"]],		//10
		["end", ["h1", false]],
		["chars", ["\nbar"]],
		["close",["h1"]],
		["done",[]]
	]));
});

//!steal-remove-start
test('counts lines properly', function() {
	parser(`
	<style>
		.header {
			color: black;
		}
	</style>

	<h1
		class="header"
	>
		Header
	</h1>
	<article>
		Body Line {{line1}}<br />
		Body Line {{line2}}
		{{#if}}
			{{.}}
		{{/if}}
	</article>
`, makeChecks([
		[ "chars", [ `
	`, 1 ] ],

		[ "start", [ "style", false, 2 ] ],
		[ "end", [ "style", false, 2 ] ],
		[ "chars", [ `
		.header {
			color: black;
		}
	`, 2 ] ],
		[ "close", [ "style", 6 ] ],
		[ "chars", [ `

	`, 6 ] ],

		[ "start", [ "h1", false, 8 ] ],
		[ "attrStart", [ "class", 8 ] ],
		[ "attrValue", [ "header", 8 ] ],
		[ "attrEnd", [ "class", 8 ] ],
		[ "end", [ "h1", false, 10 ] ],
		[ "chars", [ `
		Header
	`, 10 ] ],
		[ "close", [ "h1", 12 ] ],

		[ "chars", [ `
	`, 12 ] ],

		[ "start", [ "article", false, 13 ] ],
		[ "end", [ "article", false, 13 ] ],

		[ "chars", [ `
		Body Line `, 13 ] ],
		[ "special", [ "line1", 14 ] ],
		[ "start", [ "br", true, 14 ] ],
		[ "end", [ "br", true, 14 ] ],
		[ "chars", [ `
		Body Line `, 14 ] ],
		[ "special", [ "line2", 15 ] ],
		[ "chars", [ `
		`, 15 ] ],
		[ "special", [ "#if", 16 ] ],
		[ "chars", [ `
			`, 16 ] ],
		[ "special", [ ".", 17 ] ],
		[ "chars", [ `
		`, 17 ] ],
		[ "special", [ "/if", 18 ] ],
		[ "chars", [ `
	`, 18 ] ],

		[ "close", [ "article", 19 ] ],
		[ "chars", [ `
`, 19 ] ],

		[ "done", [ 20 ] ],
	]));
});

test('warn on missmatched tag (canjs/canjs#1476)', function() {
	var makeWarnChecks = function(input, texts) {
		var count = 0;
		var _warn = canDev.warn;
		canDev.warn = function(text) {
			equal(text, texts[count++]);
		};

		parser(input, {
			filename: "filename.stache",
			start: function(tagName, unary) {},
			end: function(tagName, unary) {},
			done: function() {}
		});

		equal(count, texts.length);

		canDev.warn = _warn;
	};

	makeWarnChecks("</h2><h1>Header<span></span></h1><div></div>", [
		"filename.stache:1: unexpected closing tag </h2>"
	]);
	makeWarnChecks("<h1>Header</h2><span></span></h1><div></div>", [
		"filename.stache:1: unexpected closing tag </h2> expected </h1>"
	]);
	makeWarnChecks("<h1>Header<span></h2></span></h1><div></div>", [
		"filename.stache:1: unexpected closing tag </h2> expected </span>"
	]);
	makeWarnChecks("<h1>Header<span></span></h2></h1><div></div>", [
		"filename.stache:1: unexpected closing tag </h2> expected </h1>"
	]);
	makeWarnChecks("<h1>Header<span></span></h1></h2><div></div>", [
		"filename.stache:1: unexpected closing tag </h2>"
	]);
	makeWarnChecks("<h1>Header<span></span></h1>\n<div></h2></div>", [
		"filename.stache:2: unexpected closing tag </h2> expected </div>"
	]);
	makeWarnChecks("<h1>Header<span></span></h1>\n<div></div>\n</h2>", [
		"filename.stache:3: unexpected closing tag </h2>"
	]);

	makeWarnChecks("<h1>Header<span></h2></h1><div></div>", [
		"filename.stache:1: unexpected closing tag </h2> expected </span>",
		"filename.stache:1: unexpected closing tag </h1> expected </span>"
	]);
	makeWarnChecks("<h1>Header<span></span></h2><div></div>", [
		"filename.stache:1: unexpected closing tag </h2> expected </h1>",
		"filename.stache: expected closing tag </h1>"
	]);
	makeWarnChecks("<h1>Header<span></span></h1>\n<div></h2>", [
		"filename.stache:2: unexpected closing tag </h2> expected </div>",
		"filename.stache: expected closing tag </div>"
	]);
	makeWarnChecks("<h1>Header<span></span></h1><!-- \n --><div></h2></div>", [
		"filename.stache:2: unexpected closing tag </h2> expected </div>"
	]);
});
//!steal-remove-end

test('tags with data attributes are allowed in comments (#2)', function() {
	parser("{{! foo }}", makeChecks([
		[ "special", [ "! foo " ] ],
		[ "done", [] ]
	]));

	parser("{{! <foo /> }}", makeChecks([
		[ "special", [ "! <foo /> " ] ],
		[ "done", [] ]
	]));

	parser("{{! <foo bar=\"{bam}\" /> }}", makeChecks([
		[ "special", [ "! <foo bar=\"{bam}\" /> " ] ],
		[ "done", [] ]
	]));
});


test('multiline special comments (#14)', function() {
	parser("{{! foo !}}", makeChecks([
		[ "special", [ "! foo !" ] ],
		[ "done", [] ]
	]));

	parser("{{! {{foo}} {{bar}} !}}", makeChecks([
		[ "special", [ "! {{foo}} {{bar}} !" ] ],
		[ "done", [] ]
	]));

	parser("{{!\n{{foo}}\n{{bar}}\n!}}", makeChecks([
		[ "special", [ "!\n{{foo}}\n{{bar}}\n!" ] ],
		[ "done", [] ]
	]));
});

test('spaces in attribute names that start with `{` or `(` are encoded (#48)', function () {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("{foo bar}")]],
		["attrValue", ["a"]],
		["attrEnd", [encoder.encode("{foo bar}")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 {foo bar}='a'></h1>", makeChecks(tests));
});

test('for attributes without values, spaces in attribute names that start with `{` or `(` are encoded (#48)', function () {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("{foo }")]],
		["attrEnd", [encoder.encode("{foo }")]],
		["attrStart", [encoder.encode("{bar }")]],
		["attrEnd", [encoder.encode("{bar }")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 {foo } {bar }></h1>", makeChecks(tests));
});

test('mismatched brackets work: {(foo})', function () {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("{(foo})")]],
		["attrValue", ["a"]],
		["attrEnd", [encoder.encode("{(foo})")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 {(foo})='a'></h1>", makeChecks(tests));
});

test('mismatched brackets work: ({foo)}', function () {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("({foo)}")]],
		["attrValue", ["a"]],
		["attrEnd", [encoder.encode("({foo)}")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 ({foo)}='a'></h1>", makeChecks(tests));

});


test('forward slashes are encoded (#52)', function () {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("{foo/bar}")]],
		["attrValue", ["a"]],
		["attrEnd", [encoder.encode("{foo/bar}")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 {foo/bar}='a'></h1>", makeChecks(tests));
});

test('camelCase properties are encoded with on:, :to, :from, :bind bindings', function () {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("on:aB")]],
		["attrValue", ["c"]],
		["attrEnd", [encoder.encode("on:aB")]],
		["attrStart", [encoder.encode("dE:to")]],
		["attrValue", ["f"]],
		["attrEnd", [encoder.encode("dE:to")]],
		["attrStart", [encoder.encode("gH:from")]],
		["attrValue", ["i"]],
		["attrEnd", [encoder.encode("gH:from")]],
		["attrStart", [encoder.encode("jK:bind")]],
		["attrValue", ["l"]],
		["attrEnd", [encoder.encode("jK:bind")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 on:aB='c' dE:to='f' gH:from='i' jK:bind='l'></h1>", makeChecks(tests));
});

testHelpers.dev.devOnlyTest('Warn on missing attribute value end quotes (canjs/can-view-parser#7)', function () {
	var makeWarnChecks = function(input, texts) {
		var count = 0;
		var teardown = testHelpers.dev.willWarn(/End quote is missing for/, function(message, matched) {
			ok(matched, texts[count++]);
		});

		parser(input, {
			start: function(tagName, unary) {},
			end: function(tagName, unary) {},
			attrStart: function(attrName) {},
			attrEnd: function(attrName) {},
			attrValue: function(val) {},
			done: function() {}
		});
		equal(count, teardown());
	};

	makeWarnChecks('<my-input {value}="name" (value)="updateNameOnEven(%viewModel.value)/>', [
		"1: End quote is missing for updateNameOnEven(%viewModel.value)"
	]);

	makeWarnChecks('<input on:click="callback />', [
		"1: End quote is missing for callback"
	]);

	makeWarnChecks('<my-input {an-attr}="aValue />', [
		"1: End quote is missing for aValue"
	]);

	makeWarnChecks("<my-input {an-other-attr}='anotherValue />", [
		"1: End quote is missing for anotherValue"
	]);
});

testHelpers.dev.devOnlyTest('Fix false warning on missing closed quote (canjs/can-view-parser#7#issuecomment-336468766)', function () {
	var makeWarnChecks = function(input, texts) {
		var count = 0;
		var teardown = testHelpers.dev.willWarn(/End quote is missing for/, function(message, matched) {
			notOk(matched, texts[count++]);
		});

		parser(input, {
			start: function(tagName, unary) {},
			end: function(tagName, unary) {},
			attrStart: function(attrName) {},
			attrEnd: function(attrName) {},
			attrValue: function(val) {},
			done: function() {},
			special: function() {
				return ['#if', '/if'];
			}
		});
		equal(count, teardown());
	};

	var truthy = true;

	makeWarnChecks('<div {{#if truthy}} class="current-page"{{/if}} />', [
		"1: End quote is missing for current-page"
	]);

	makeWarnChecks('<div class="current-page"($click)="" />', [
		"1: End quote is missing for current-page"
	]);

	makeWarnChecks('<input type="text">', [
		"1: End quote is missing for current-page"
	]);

});
