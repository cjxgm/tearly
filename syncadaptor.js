'use strict';
/*\
title: $:/plugins/cjxgm/tearly/syncadaptor.js
type: application/javascript
module-type: syncadaptor
\*/

(function (tiddlersList) {
    var WebDAV = require('$:/plugins/cjxgm/tearly/webdav.js').WebDAV;
    var Underscode = require('$:/plugins/cjxgm/tearly/underscode.js').Underscode;
    var Utils = require('$:/plugins/cjxgm/tearly/utils.js').Utils;

    function SyncAdaptor(options)
    {
        this.wiki = options.wiki;
        this.dav = new WebDAV();
        this.uc = new Underscode();
        this.utils = new Utils();
        this.titles = new Set(tiddlersList);
    }

    //// SyncAdaptor Interface ////
    SyncAdaptor.prototype.isReady = () => true;
    SyncAdaptor.prototype.getTiddlerInfo = () => {};

    SyncAdaptor.prototype.saveTiddler = function (tiddler, callback) {
        var title = tidders.fields.title;
        var tiddlerPath = "./tiddlers/" + this.uc.encode(tiddler.fields.title) + ".tid";
        var tiddler = this.utils.encodeTiddler(tiddler);
        this.addTitle(title)
            .then(() => this.dav.put(tiddlerPath, tiddler))
            .then(() => callback(), err => callback(err));
    };

    SyncAdaptor.prototype.deleteTiddler = function (title, callback) {
        var tiddlerPath = "./tiddlers/" + this.uc.encode(title) + ".tid";
        return this.dav.delete(tiddlerPath)
            .then(() => this.deleteTitle(title))
            .then(() => callback(), err => callback(err));
    };

    //// Internals ////
    SyncAdaptor.prototype.addTitle = function (title) {
        if (this.titles.has(title))
            return Promise.resolve();
        this.titles.add(title);
        return this.updateTitles();
    }

    SyncAdaptor.prototype.deleteTitle = function (title) {
        if (this.titles.delete(title))
            return this.updateTitles();
        return Promise.resolve();
    }

    SyncAdaptor.prototype.updateTitles = function () {
        var path = "./tiddlers.list";
        var list = [...this.titles].map(x => this.uc.encode(x)).join("\n");
        return this.dav.put(path, list);
    }

    if (tiddlersList) {
        this.adaptorClass = SyncAdaptor;
    }
}).call(exports, $bootloader ? $bootloader.tiddlersList : null);

