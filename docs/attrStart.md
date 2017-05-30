@function can-view-parser.ParseHandler.attrStart attrStart
@parent can-view-parser.ParseHandler
@signature `attrStart(attrName)`

Called when an attribute is found on an element.

Handles encoding of certain characthers:
1. Spaces (` `) - Encoded to `\s`.
1. Forward Slashes (`/`) - Encoded to `\f`.

@param {String} attrName The name of the attribute.
