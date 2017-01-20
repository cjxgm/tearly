'use strict';
/*\
title: $:/plugins/cjxgm/tearly/bootstrap.js
type: application/javascript
module-type: library
\*/

(function () {
    var WebDAV = require('$:/plugins/cjxgm/tearly/webdav.js').WebDAV;
    var Underscode = require('$:/plugins/cjxgm/tearly/underscode.js').Underscode;
    var Utils = require('$:/plugins/cjxgm/tearly/utils.js').Utils;

    function Bootstrap(wiki)
    {
        this.wiki = wiki;
        this.dav = new WebDAV();
        this.uc = new Underscode();
        this.utils = new Utils();
        this.used = false;
        this.prefix = this.tiddlerText("$:/config/tearly/BootstrapPrefix");
        this.tiddlersTitles = this.utils.tiddlersTitles(this.wiki);
        this.tiddlersList = this.tiddlersTitles.map(x => this.titlePath(x, true)).join("\n");
    }

    // What needs to be done:
    //
    // - MKCOL {{prefix}}tiddlers/
    // - PUT {{prefix}}tiddlers.list
    // - PUT {{prefix}}bootloader.{html,css,js}
    // - PUT tiddlers that match $:/config/SyncFilter
    //       with path {{prefix}}tiddlers/{{encodedTitle}}.tid
    Bootstrap.prototype.bootstrap = function () {
        if (this.used) throw Error("Bootstrap object can only be used once.");
        this.used = true;

        Promise.resolve()
            .then(() => this.uploadStructure())
            .then(() => this.uploadBootloader())
            .then(() => this.uploadTiddlers())
            .then(() => this.done())
            .catch(err => {
                console.error(err);
                this.setStatus("@@color:red;''Failed.''@@");
                alert(err);
            })
        ;
    };

    Bootstrap.prototype.done = function () {
        this.setStatus("''Success.''");
    };


    Bootstrap.prototype.uploadStructure = function () {
        return Promise.resolve()
            .then(() => this.dav.mkcol(this.fullPath("tiddlers/")))
            .then(() => this.dav.put(this.fullPath("tiddlers.list"), this.tiddlersList))
        ;
    };

    Bootstrap.prototype.uploadBootloader = function () {
        var uploads = [
            // [ extension, rename ]
            [ 'html', 'index' ],
            [ 'css' ],
            [ 'js' ],
        ];
        var pathPairs = uploads.map(upload => {
            var ext = upload[0];
            var name = upload[1] || "bootloader";
            var dst = this.fullPath(name + "." + ext);
            var src = "$:/plugins/cjxgm/tearly/bootloader." + ext;
            return [ dst, src ];
        });
        var pending = pathPairs.map(pair => {
            var path = pair[0];
            var text = this.tiddlerText(pair[1]);
            return this.dav.put(path, text);
        });
        return Promise.all(pending);
    };

    Bootstrap.prototype.uploadTiddlers = function () {
        var pending = this.tiddlersTitles.map(title => {
            var path = this.titlePath(title);
            var tiddler = this.wiki.getTiddler(title);
            tiddler = this.utils.encodeTiddler(tiddler);
            return this.dav.put(path, tiddler);
        });
        return Promise.all(pending);
    };

    Bootstrap.prototype.setStatus = function (status) {
        this.setTiddlerText("$:/state/tearly/Bootstrapping", status);
    };

    Bootstrap.prototype.setTiddlerText = function (title, text) {
        this.wiki.setText(title, null, null, text);
    };

    Bootstrap.prototype.tiddlerText = function (title) {
        return this.wiki.getTiddlerText(title);
    }

    Bootstrap.prototype.fullPath = function (path) {
        return this.prefix + path;
    }

    Bootstrap.prototype.titlePath = function (title, forLoading) {
        var titlePath = "tiddlers/" + this.uc.encode(title) + ".tid";
        return forLoading ? "./" + titlePath : this.fullPath(titlePath);
    }

    this.Bootstrap = Bootstrap;
}).call(exports);

