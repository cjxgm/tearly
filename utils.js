'use strict';
/*\
title: $:/plugins/cjxgm/tearly/utils.js
type: application/javascript
module-type: library
\*/

(function (tiddlersList) {
    function Utils() {}

    Utils.prototype.encodeTiddler = function(tiddler) {
        var fields = tiddler.fields;
        var rest = JSON.stringify(fields, (k, v) => (k === "title" || k === "text") ? undefined : v);
        var text = fields.title + "\n" + rest + "\n" + fields.text;
        return text;
    };

    Utils.prototype.tiddlersTitles = function(wiki) {
        var filter = wiki.getTiddlerText("$:/config/SyncFilter");
        var filter = wiki.compileFilter(filter);
        var titles = filter.call(wiki).sort();
        return titles;
    };

    this.Utils = Utils;
}).call(exports);

