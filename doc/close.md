@function can-view-parser.ParseHandler.close close
@parent can-view-parser.ParseHandler
@description Called when a closing tag is found. If no closing tag exists for this tag (because it is self-closing) this function will not be called.
@signature `close(tagName)`
@param {String} tagName The name of the tag.
