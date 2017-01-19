'use strict';
/*\
title: $:/plugins/cjxgm/tearly/underscode.js
type: application/javascript
module-type: library
\*/

(function () {
    function Underscode() {}

    // preserve only /[A-Za-z0-9]/, represent space as "-" and slash as "__".
    // encode("/hello world/no.yes") -> "__hello-world__no_2eyes"
    //
    // Anything that matches /[^A-Za-z0-9]/ will be converted to UTF-8
    // code units (bytes) in lowercase double-digit hex with "_" prefixed
    // on each byte.
    //
    // e.g. "-" is 0x2d in UTF-8, so it is represented as "_2d".
    Underscode.prototype.encode = function (text) {
        text = encodeURIComponent(text);
        text = text.replace(/[!'()*~_.-]/g, c => '%' + c.charCodeAt(0).toString(16));
        text = text.replace(/%/g, "_");
        text = text.replace(/_[A-F0-9]{2}/g, c => c.toLowerCase());
        text = text.replace(/_20/g, "-");       // represent space as "-"
        text = text.replace(/_2f/g, "__");      // represent slash as "__"
        return text;
    }

    Underscode.prototype.decode = function (text) {
        text = text.replace(/-/g, "_20");
        text = text.replace(/__/g, "_2f");
        text = text.replace(/_/g, "%");
        text = decodeURIComponent(text);
        return text;
    }

    this.Underscode = Underscode;
}).call(exports);

