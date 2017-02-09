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
        this.element = this.editor.elements[0];
        if(!this.element) {
            console.error('Could not create MediumEditor on node for unknown reason ', node);
            return;
        }
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
        //Add separator class on li node
        var toolbarSeparators = this.editor.getExtensionByName('toolbar').toolbar.getElementsByClassName('separator');
        for (var index in toolbarSeparators){
            toolbarSeparators[index].parentNode && toolbarSeparators[index].parentNode.classList.add('separator')
        }
    }

    needSave() {
        return this.element.innerHTML != this.editor.startHTML
    }

    save() {
        if (!this.needSave())
            return;

        this.updatePiece();
        this.options.onSave && this.options.onSave();
        this.editor.startHTML = this.element.innerHTML;
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
         * Let blur event to settle. If blur was produced by editor button click it will be followed by focus soon and we don't really need to react on it
         * @type {number}
         */
        this.blurTimeout = setTimeout(()=>{
            this.updatePiece();
            if(this.needSave()) {
                this.options.onLeave && this.options.onLeave(()=>{
                    this.element.origElements.innerHTML = this.editor.startHTML;
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
}
