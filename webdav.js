'use strict';
/*\
title: $:/plugins/cjxgm/tearly/webdav.js
type: application/javascript
\*/

(function (tiddlersList) {
    function WebDAV() {}

    WebDAV.prototype.put = function(path, text) {
        console.log("DAV-PUT", path, { text: text });
        return new Promise(resolve => setTimeout(resolve, 1000));
    };

    WebDAV.prototype.delete = function(path) {
        console.log("DAV-DELETE", path);
        return new Promise(resolve => setTimeout(resolve, 1000));
    };

    this.WebDAV = WebDAV;
}).call(exports);

