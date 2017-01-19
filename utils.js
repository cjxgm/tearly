'use strict';
/*\
title: $:/plugins/cjxgm/tearly/utils.js
type: application/javascript
\*/

(function (tiddlersList) {
    function Utils() {}

    Utils.prototype.encodeTiddler = function(tiddler) {
        var fields = tiddler.fields;
        var rest = JSON.stringify(fields, (k, v) => (k === "title" || k === "text") ? undefined : v);
        var text = fields.title + "\n" + rest + "\n" + fields.text;
        return text;
    };

    this.Utils = Utils;
}).call(exports);

