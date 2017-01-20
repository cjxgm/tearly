'use strict';
/*\
title: $:/plugins/cjxgm/tearly/action-bootstrap.js
type: application/javascript
module-type: widget
\*/

(function () {
    var Widget = require("$:/core/modules/widgets/widget.js").widget;
    var Bootstrap = require('$:/plugins/cjxgm/tearly/bootstrap.js').Bootstrap;

    function ActionBootstrap(parseTreeNode, options)
    {
        this.initialise(parseTreeNode, options);
    }

    ActionBootstrap.prototype = new Widget();

    ActionBootstrap.prototype.invokeAction = function () {
        new Bootstrap(this.wiki).bootstrap();
        return true;
    };

    this['action-tearly-bootstrap'] = ActionBootstrap;
}).call(exports);

