@function can-view-parser.ParserHandler.attrEnd attrEnd
@parent can-view-parser.ParserHandler
@signature `attrEnd(attrName)`

Called at the end of parsing an attribute; after the [can-view-parser.ParserHandler.attrStart] and [can-view-parser.ParserHandler.attrValue] functions have been called.

@param {String} attrName The name of the attribute.
