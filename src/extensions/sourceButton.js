var MediumEditor = require('medium-editor/dist/js/medium-editor.js');
(function () {
    'use strict';
    var SourceButton = MediumEditor.Extension.extend({
        name: 'source',
        init: function () {
            this.button = this.document.createElement('button');
            this.button.classList.add('medium-editor-action');
            this.button.innerHTML = '<i class="fa fa-code"></i>';
            this.button.title = "Source Editor";
            this.handleClickBinded = this.handleClick.bind(this)
            this.on(this.button, 'click', this.handleClickBinded);
        },
        getButton: function () {
            return this.button;
        },
        handleClick: function (event) {
            this.base.getExtensionByName('toolbar').hideToolbar();
            this.base.trigger('setCurrentSourcePieceId',{}, this.base);
        },
        destroy: function(){
            this.off(this.button, 'click', this.handleClickBinded);
        }
    });
    MediumEditor.extensions.sourceButton = SourceButton;
}());
