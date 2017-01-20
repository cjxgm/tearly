'use strict';
/*\
title: $:/plugins/cjxgm/tearly/syncadaptor.js
type: application/javascript
module-type: syncadaptor
\*/
// TODO: remove this
var $bootloader = {
    tiddlersList: [
        "debug",
    ],
};

(function (tiddlersList) {
    function SyncAdaptor(options)
    {
        var WebDAV = require('$:/plugins/cjxgm/tearly/webdav.js').WebDAV;
        var Underscode = require('$:/plugins/cjxgm/tearly/underscode.js').Underscode;
        var Utils = require('$:/plugins/cjxgm/tearly/utils.js').Utils;

        this.wiki = options.wiki;
        this.dav = new WebDAV();
        this.uc = new Underscode();
        this.utils = new Utils();
        this.titles = new Set(tiddlersList);
        this.onceSucceeded = false;
    }

    //// SyncAdaptor Interface ////
    SyncAdaptor.prototype.isReady = function () { return true };
    SyncAdaptor.prototype.getTiddlerInfo = function () {};

    SyncAdaptor.prototype.saveTiddler = function (tiddler, callback) {
        var title = tiddler.fields.title;

        // Special treatment for StoryList.
        if (title === "$:/StoryList") {
            // Don't save StoryList if you haven't saved any other stuff.
            if (!this.onceSucceeded) return callback();
        }

        var tiddlerPath = "./tiddlers/" + this.uc.encode(title) + ".tid";
        var tiddler = this.utils.encodeTiddler(tiddler);
        this.addTitle(title)
            .then(() => this.dav.put(tiddlerPath, tiddler))
            .then(() => this.onceSucceeded = true)
            .then(() => callback(), err => callback(err));
    };

    SyncAdaptor.prototype.deleteTiddler = function (title, callback) {
        var tiddlerPath = "./tiddlers/" + this.uc.encode(title) + ".tid";
        return this.deleteTitle(title)
            .then(deleted => { if (deleted) this.dav.delete(tiddlerPath) })
            .then(() => this.onceSucceeded = true)
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
            return this.updateTitles().then(() => true);
        return Promise.resolve(false);
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

