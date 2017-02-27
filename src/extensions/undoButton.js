var MediumEditor = require('medium-editor/dist/js/medium-editor.js');
(function () {
    'use strict';
    var UndoButton = MediumEditor.Extension.extend({
        name: 'undo',
        init: function () {
            this.button = this.document.createElement('button');
            this.button.classList.add('medium-editor-action');
            this.button.innerHTML = '<i class="fa fa-undo"></i>';
            this.button.title = "Undo Changes";
            this.handleClickBinded = this.handleClick.bind(this);
            this.on(this.button, 'click', this.handleClickBinded);
        },
        getButton: function () {
            return this.button;
        },
        handleClick: function (event) {
            let undoContent = this.base.historyManager.undo();
            if(undoContent) {
                this.base.setContent(undoContent);
            }
        },
        destroy: function(){
            this.off(this.button, 'click', this.handleClickBinded);
        }
    });
    MediumEditor.extensions.undoButton = UndoButton;
}());
