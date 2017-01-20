'use strict';
/*\
title: $:/plugins/cjxgm/tearly/webdav.js
type: application/javascript
module-type: library
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

    WebDAV.prototype.mkcol = function(path) {
        if (!path.endsWith("/")) throw new Error("Path for MKCOL must end with a slash: " + path);
        console.log("DAV-MKCOL", path);
        return new Promise(resolve => setTimeout(resolve, 1000));
    };

    this.WebDAV = WebDAV;
}).call(exports);

