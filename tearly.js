'use strict';

// boot tiddlers:
//   boot tiddlers are those that need to be inserted to the end of document.

(function () {
    function Dav()
    {
    }

    Dav.put = function (url, content) {
        return new Promise((resolve, reject) => {
            var req = new XMLHttpRequest();
            req.onload = function() {
                if (this.status === 200 || this.status === 201) {
                    resolve();
                }
                else {
                    reject(Error(this.statusText + "\n" + this.responseText));
                }
            };
            req.open("PUT", url);
            req.setRequestHeader("Content-Type", "text/html;charset=UTF-8");
            req.send(content);
        });
    };

    Dav.delete = function (path) {
    };

    this.D = Dav;
}).call(this);

(function () {
    function DummyDav()
    {
    }

    DummyDav.put = function (url, content) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log("DAV-OK", url, content);
                resolve();
            }, 2000*Math.random());
        });
    };

    DummyDav.delete = function (path) {
    };

    this.DD = DummyDav;
}).call(this);

(function () {
    function Underscode()
    {
    }

    // preserve only [A-Za-z0-9-.]
    Underscode.encode = function (text) {
        text = encodeURIComponent(text);
        text = text.replace(/[!'()*~_]/g, c => '%' + c.charCodeAt(0).toString(16));
        text = text.replace(/%/g, "_");
        text = text.replace(/_[A-F0-9]{2}/g, c => c.toLowerCase());
        return text;
    }

    Underscode.decode = function (text) {
        text = text.replace(/_/g, "%");
        text = decodeURIComponent(text);
        return text;
    }

    this.U = Underscode;
}).call(this);

(function () {
    function SimpleTiddlerFormat()
    {
    }

    SimpleTiddlerFormat.encode = function (tiddler) {
        var fields = tiddler.fields;
        var rest = JSON.stringify(fields, (k, v) => (k === "title" || k === "text") ? undefined : v);
        var text = fields.title + "\n" + rest + "\n" + fields.text;
        return text;
    }

    SimpleTiddlerFormat.decode = function (text) {
        text = text.split("\n");

        var title = text.splice(0, 1)[0];
        var fields = text.splice(0, 1)[0];
        text = text.join("\n");

        fields.title = title;
        fields.text = text;

        var tiddler = {
            fields: fields,
        };

        return tiddler;
    }

    this.S = SimpleTiddlerFormat;
}).call(this);

(function () {
    // FIXME: debug only
    var Underscode = this.U;
    var Dav = this.DD;
    var SimpleTiddlerFormat = this.S;

    function Tearly(wiki)
    {
        this.wiki = wiki;
    }

    Tearly.prototype.sync_filter = function () {
        return this.wiki.getTiddlerText("$:/config/SyncFilter");
    }

    Tearly.prototype.index_template = function () {
        // FIXME: dummy
        // TODO: read from a tiddler
        return `
            <noscript>
                This document would load these tiddlers:
                <div id="bootstrap_non_boot">
                    $non-boot-tiddlers$
                </div>
                <div id="bootstrap_boot">
                    $boot-tiddlers$
                </div>
            </noscript>
            <code>hello world</code>
            <script>
                console.log(bootstrap_non_boot.textContent, bootstrap_boot.textContent);
            </script>
        `;
    }

    Tearly.prototype.tiddler_of = function (title) {
        var tiddler = this.wiki.getTiddler(title);
        return SimpleTiddlerFormat.encode(tiddler);
    }

    Tearly.prototype.tiddlers = function () {
        var filter = this.wiki.compileFilter(this.sync_filter());
        return filter.call(this.wiki);
    }

    Tearly.prototype.partitioned_tiddlers = function () {
        var tiddlers = new Set(this.tiddlers());

        // TODO: use a tiddler to allow customization
        var boot_tiddlers = new Set([
                "$:/boot/bootprefix.js",
                "$:/boot/boot.js",
        ]);

        var non_boot_tiddlers = new Set(tiddlers);
        boot_tiddlers.forEach(title => non_boot_tiddlers.delete(title));

        return {
            all: tiddlers,
            non_boot: non_boot_tiddlers,
            boot: boot_tiddlers,
        };
    }

    Tearly.prototype.base_url = function (href) {
        return "http://dummy";  // TODO
    }

    Tearly.prototype.url_from_path = function (path, base_url) {
        if (base_url === undefined) base_url = this.base_url(location.href);
        return base_url + path;
    }

    Tearly.prototype.path_from_title = function (title) {
        return "/tiddlers/" + Underscode.encode(title);
    }

    Tearly.prototype.url_from_title = function (title, base_url) {
        var path = this.path_from_title(title);
        return this.url_from_path(path, base_url);
    }

    Tearly.prototype.bootstrap = function () {
        var tiddlers = this.partitioned_tiddlers();
        console.log(tiddlers);

        // put index
        var index = this.index_template();
        var non_boot_tiddlers = [...tiddlers.non_boot].map(title => this.path_from_title(title)).join("\n");
        var boot_tiddlers = [...tiddlers.boot].map(title => this.path_from_title(title)).join("\n");
        index = index.replace("$non-boot-tiddlers$", non_boot_tiddlers);
        index = index.replace("$boot-tiddlers$", boot_tiddlers);
        Dav.put(this.url_from_path("/index.html"), index)
            .then(ok => {
                var pending = [];
                tiddlers.all.forEach(title => {
                    var url = this.url_from_title(title);
                    var tiddler = this.tiddler_of(title);
                    pending.push(Dav.put(url, tiddler));
                })
                return Promise.all(pending);
            })
            .then(ok => {
                console.log("BOOTSTRAPED");
            })
        ;
    }

    this.T = Tearly;
    this.t = new Tearly($tw.wiki);
}).call(this);

