"use strict";
import MediumEditor from './mediumEditor';

class HistoryManager {
    constructor(start) {
        this.history = [];
        this.historyIndex = -1;
        this.applied = false;
        this.startState = start;
    }

    registerChange(content) {

        if(this.historyIndex>=0 && this.history[this.historyIndex] == content) {
            return; // Don't register same text as current history position
        }

        if (this.historyIndex < this.history.length - 1) {
            this.history.splice(this.historyIndex + 1);
        }

        this.history.push(content);
        this.historyIndex = this.history.length - 1;
    }

    undo() {
        this.applied = true;
        if (this.historyIndex >= 0) {
            this.historyIndex--;
            return this.history[this.historyIndex];
        } else {
            return this.startState;
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.applied = true;
            return this.history[this.historyIndex];
        } else {
            return void 0;
        }
    }
}

export default class HTMLEditor {
    constructor(node, options) {
        this.historyManager = new HistoryManager(node.innerHTML);

        var defaults = {
            buttonLabels: 'fontawesome',
            autoLink: true,
            stickyTopOffset: 5,
            toolbar: {
                buttons: [
                    'undo',
                    'redo',
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
                'redo': new MediumEditor.extensions.redoButton(),
                'undo': new MediumEditor.extensions.undoButton(),
                'reset': new MediumEditor.extensions.resetButton(),
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
        this.editor.subscribe('setCurrentSourcePieceId', this.setCurrentSourcePieceIdBinded);
        this.editor.subscribe('onToggleImagePopup', this.options.onToggleImagePopup);

        this.editor.historyManager = this.historyManager;

        this.onChangeDebounceTimer = null;
        this.onChangeDebounced = ()=> {
            console.log("History add", this.editor.getContent(), this.historyManager);
            this.historyManager.registerChange(this.editor.getContent());
        };
        this.editor.subscribe('editableInput', ()=> {
            this.onChange();
        });
        //Add separator class on li node
        var toolbarSeparators = this.editor.getExtensionByName('toolbar').toolbar.getElementsByClassName('separator');
        for (var index in toolbarSeparators) {
            toolbarSeparators[index].parentNode && toolbarSeparators[index].parentNode.classList.add('separator')
        }
    }

    onChange() {
        clearTimeout(this.onChangeDebounceTimer);
        if(this.historyManager.applied) {
            this.historyManager.applied = false; // Omit history event because it came from history manager
        } else {
            this.onChangeDebounceTimer = setTimeout(this.onChangeDebounced, 500);
        }

        options.onNeedResizeCheck();
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
        this.options.onEditorActive && this.options.onEditorActive(true);
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
            this.options.onEditorActive && this.options.onEditorActive(false);
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
