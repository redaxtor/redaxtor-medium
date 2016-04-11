"use strict";
import MediumEditor from './mediumEditor';

export default class HTMLEditor {
    constructor(node, options) {
        this.options = {};
        var defaults = {
            buttonLabels: 'fontawesome',
            autoLink: true,
            toolbar: {
                buttons: ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'quote', 'pre', 'orderedlist', 'unorderedlist', 'indent', 'outdent', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'removeFormat', 'link', 'source','imageInsert', 'undo', 'save'],
                static: true,
                updateOnEmptySelection: true,
                sticky: true
            },
            extensions: {
                //imageDragging: new MediumEditor.extensions.imageDrag(),
                //imageResize: new MediumEditor.extensions.imageResize(),
                'undo': new MediumEditor.extensions.undoButton(),
                'save': new MediumEditor.extensions.saveButton(),
                'source': new MediumEditor.extensions.sourceButton(),
                'imageInsert': new MediumEditor.extensions.imageInsertButton(),
                'link': new MediumEditor.extensions.link()
            },
            anchor: {
                linkValidation: true,
                placeholderText: 'Paste or type a link',
                targetCheckbox: true,
                targetCheckboxText: 'Open in new window'
            },
            'imageDragging': true
        }

        this.options = {...defaults, ...options}

        this.editor = new MediumEditor(node, this.options);
        this.element = this.editor.elements[0];
        this.onFocusBinded = this.onFocus.bind(this);
        this.onBlurBinded = this.onBlur.bind(this);
        this.saveBinded = this.save.bind(this);
        this.setCurrentSourcePieceIdBinded = this.setCurrentSourcePieceId.bind(this);
        //this.editor.getExtensionByName('toolbar').showToolbar();
        //this.editor.getExtensionByName('toolbar').positionStaticToolbar(node);
        this.editor.startHTML = this.element.innerHTML;
        this.editor.subscribe('focus', this.onFocusBinded);
        this.editor.subscribe('blur', this.onBlurBinded);
        this.editor.subscribe('save', this.saveBinded);
        this.editor.subscribe('setCurrentSourcePieceId', this.setCurrentSourcePieceIdBinded);
        this.editor.subscribe('onToggleImagePopup', this.options.onToggleImagePopup);
    }

    needSave() {
        return this.element.innerHTML !== this.startHTML
    }

    save() {
        if (!this.needSave()) return;
        this.editor.startHTML = this.element.innerHTML;
        this.updatePiece();
        this.options.onSave && this.options.onSave();
    }

    setCurrentSourcePieceId() {
        this.options.onSetCurrentSourcePieceId && this.options.onSetCurrentSourcePieceId();
    }

    onFocus() {
        this.options.onFocus && this.options.onFocus();
    }

    onBlur() {
        this.options.onUnfocus && this.options.onUnfocus();
        this.updatePiece();
    }

    removeListeners() {
        this.editor.unsubscribe('focus', this.onFocusBinded);
        this.editor.unsubscribe('blur', this.onBlurBinded);
        this.editor.getExtensionByName('undo').destroy();
        this.editor.getExtensionByName('save').destroy();
        this.editor.getExtensionByName('source').destroy();
    }

    updatePiece() {
        this.needSave() && this.options.onUpdate && this.options.onUpdate();
    }
}
