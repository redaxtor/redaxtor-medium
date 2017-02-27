var MediumEditor = require('medium-editor/dist/js/medium-editor.js');
(function () {
    'use strict';
    var RedoButton = MediumEditor.Extension.extend({
        name: 'redo',
        init: function () {
            this.button = this.document.createElement('button');
            this.button.classList.add('medium-editor-action');
            this.button.innerHTML = '<i class="fa fa-repeat"></i>';
            this.button.title = "Redo Changes";
            this.handleClickBinded = this.handleClick.bind(this);
            this.on(this.button, 'click', this.handleClickBinded);
        },
        getButton: function () {
            return this.button;
        },
        handleClick: function (event) {
            let redoContent = this.base.historyManager.redo();
            if(redoContent) {
                this.base.setContent(redoContent);
            }
        },
        destroy: function(){
            this.off(this.button, 'click', this.handleClickBinded);
        }
    });
    MediumEditor.extensions.redoButton = RedoButton;
}());
