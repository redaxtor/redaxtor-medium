var MediumEditor = require('medium-editor/dist/js/medium-editor.js');
(function () {
    'use strict';
    var UndoButton = MediumEditor.Extension.extend({
        name: 'undo',
        init: function () {
            this.button = this.document.createElement('button');
            this.button.classList.add('medium-editor-action');
            this.button.innerHTML = '<i class="fa fa-times"></i>';
            this.button.title = "Reset Changes";
            this.handleClickBinded = this.handleClick.bind(this)
            this.on(this.button, 'click', this.handleClickBinded);
        },
        getButton: function () {
            return this.button;
        },
        handleClick: function (event) {
            (this.base.origElements.innerHTML !== this.base.startHTML) && (this.base.origElements.innerHTML = this.base.startHTML);
        },
        destroy: function(){
            this.off(this.button, 'click', this.handleClickBinded);
        }
    });
    MediumEditor.extensions.undoButton = UndoButton;
}());
