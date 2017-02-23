"use strict";
import MediumEditor from './mediumEditor';


export default class HTMLEditor {
    constructor(node, options) {
        var defaults = {
            buttonLabels: 'fontawesome',
            autoLink: true,
            stickyTopOffset: 5,
            toolbar: {
                buttons: [
                    'save',
                    'undo',
                    'source',
                    'removeFormat',
                    'link',
                    'imageInsert',
                    'separator',
                    'bold',
                    'italic',
                    'underline',
                    'strikethrough',
                    'subscript',
                    'superscript',
                    'colorPicker',
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'quote',
                    'pre',
                    'orderedlist',
                    'unorderedlist',
                    'indent',
                    'outdent',
                    'justifyLeft',
                    'justifyCenter',
                    'justifyRight',
                    'justifyFull'
                ],
                static: true,
                updateOnEmptySelection: true,
                sticky: true
            },
            extensions: {
                imageDragging: new MediumEditor.extensions.imageDrag(),
                //imageResize: new MediumEditor.extensions.imageResize(),
                'undo': new MediumEditor.extensions.undoButton(),
                'save': new MediumEditor.extensions.saveButton(),
                'source': new MediumEditor.extensions.sourceButton(),
                'imageInsert': new MediumEditor.extensions.imageInsertButton(),
                'link': new MediumEditor.extensions.link(),
                'separator': new MediumEditor.extensions.toolbarSeparator(),
                'colorPicker': new MediumEditor.extensions.colorPicker({
                    pickerColors: options.pickerColors
                })
            },
            anchor: {
                linkValidation: true,
                placeholderText: 'Paste or type a link',
                targetCheckbox: true,
                targetCheckboxText: 'Open in new window'
            },
            'imageDragging': true
        };

        this.options = {
            ...defaults,
            ...options
        };

        this.editor = new MediumEditor(node, this.options);
        this.savedContent = null;
        if (!this.editor.elements[0]) {
            console.error('Could not create MediumEditor on node for unknown reason ', node);
            return;
        }
        this.onFocusBinded = this.onFocus.bind(this);
        this.onBlurBinded = this.onBlur.bind(this);
        this.onNeedResizeCheckBinded = options.onNeedResizeCheck.bind(this);
        this.saveBinded = this.save.bind(this);
        this.setCurrentSourcePieceIdBinded = this.setCurrentSourcePieceId.bind(this);
        this.startHTML = this.editor.getContent();
        this.editor.subscribe('focus', this.onFocusBinded);
        this.editor.subscribe('blur', this.onBlurBinded);
        this.editor.subscribe('save', this.saveBinded);
        this.editor.subscribe('editableInput', this.onNeedResizeCheckBinded);
        this.editor.subscribe('setCurrentSourcePieceId', this.setCurrentSourcePieceIdBinded);
        this.editor.subscribe('onToggleImagePopup', this.options.onToggleImagePopup);
        //Add separator class on li node
        var toolbarSeparators = this.editor.getExtensionByName('toolbar').toolbar.getElementsByClassName('separator');
        for (var index in toolbarSeparators) {
            toolbarSeparators[index].parentNode && toolbarSeparators[index].parentNode.classList.add('separator')
        }
    }

    getEditorContent() {
        if (this.editor) {
            return this.editor.getContent();
        } else {
            return this.savedContent;
        }
    }

    saveData() {
        this.savedContent = this.editor ? this.editor.getContent() : this.savedContent;
    }

    needSave() {
        return this.getEditorContent() != this.startHTML;
    }

    save() {
        if (!this.needSave())
            return;

        this.updatePiece();
        this.options.onSave && this.options.onSave();
        this.startHTML = this.getEditorContent();
    }

    setCurrentSourcePieceId() {
        this.options.onSetCurrentSourcePieceId && this.options.onSetCurrentSourcePieceId();
    }

    onFocus() {
        this.options.onFocus && this.options.onFocus();
        clearTimeout(this.blurTimeout);
    }

    onBlur() {
        /**
         * We can send text update immediately
         */
        this.updatePiece();

        /**
         * Let blur event to settle before calling onLeave. If blur was produced by editor button click it will be followed by focus soon and we don't really need to react on it
         */
        this.blurTimeout = setTimeout(()=> {
            if (this.needSave()) {
                this.options.onLeave && this.options.onLeave(()=> {
                    /**
                     * This callback happens on data reset
                     */
                    this.editor && this.editor.setContent(this.startHTML);
                    this.updatePiece();
                });
            } else {
                this.options.onLeave && this.options.onLeave();
            }
        }, 100);
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

    destroy() {
        if (this.editor) {
            this.saveData();
            this.editor.getExtensionByName('toolbar').destroy();
            this.editor.destroy();
            delete this.editor;
        } else {
            throw Error("Editor already destroyed");
        }
    }
}
