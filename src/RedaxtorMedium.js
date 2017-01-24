import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import _MediumEditor from './HTMLEditor'
import {imageManagerApi} from './imageManager/index';

export default class RedaxtorMedium extends Component {
    constructor(props) {
        super(props)
        this.state = {codeEditorActive: false};
    }

    componentDidMount() {
        imageManagerApi.init({api: this.props.api});
    };

    saveSelection() {
        this.savedRange = window.getSelection().getRangeAt(0);
    }

    restoreSelection() {
        if (this.savedRange !== null) {
            var s = window.getSelection();
            s.removeAllRanges();
            s.addRange(this.savedRange);
        }
    }

    onToggleImagePopup() {
        if (this.img) {
            imageManagerApi.get().setImageData({
                url: this.img.src,
                alt: this.img.alt || "",
                width: +this.img.width,
                height: +this.img.height
            })
        }
        this.medium.editor.saveSelection();
        //this.saveSelection()
        imageManagerApi.get().setImageData({
            onClose: this.cancelCallback.bind(this),
            onSave: this.saveCallback.bind(this),
            settings: {
                editDimensions: true,
                editBackground: false
            }
        })
        imageManagerApi.get().showPopup();
    }

    saveCallback(data) {
        this.medium.editor.restoreSelection()
        //this.restoreSelection()
        if (this.img) {
            this.img.src = data.url;
            this.img.alt = data.alt;
            this.img.style.width = data.width + "px";
            this.img.style.height = data.height + "px";
            this.img = null;
        } else {
            this.medium.editor.pasteHTML('<img src="' + (data.url || "") + '" alt="' +
                (data.alt || "") + 'style="' + 'width: "' + (data.width || "") +
                'px; height: "' + (data.height || "") + 'px">')
        }
        this.props.updatePiece(this.props.id, {data: {html: this.medium.editor.getContent()}})
    }

    cancelCallback() {
        this.medium.editor.restoreSelection()
        //this.restoreSelection();
    }

    /**
     * Prevent parent elements from getting our click
     */
    onClickPreventBubble(e) {
        console.trace("Prevent click 1", e);
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Handle clicking on image in html
     * @param e
     */
    onClick(e) {
        console.trace("Prevent click 2", e);
        e.preventDefault();
        e.stopPropagation();

        if (e.target.tagName.toLowerCase() !== 'img') {
            this.img = null;
        } else {
            this.img = e.target;
        }
        if (e.target.tagName.toLowerCase() !== 'img') return;
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNode(e.target);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    componentInit() {
        const dom = this.props.node;
        // const dom = ReactDOM.findDOMNode(this);
        this.medium = new _MediumEditor(dom, {
            onUpdate: () => {
                this.props.updatePiece(this.props.id, {data: {html: this.medium.editor.getContent()}})
            },
            onSave: () => {
                this.props.savePiece(this.props.id)
            },
            onLeave: (resetCallback) => {
                /* if(resetCallback) {
                 if(confirm("Save changes?")) {
                 this.props.savePiece(this.props.id);
                 } else {
                 resetCallback();
                 this.props.resetPiece(this.props.id);
                 }
                 } else {
                 //
                 }*/
                this.props.savePiece(this.props.id);
            },
            onSetCurrentSourcePieceId: () => {
                this.props.setCurrentSourcePieceId(this.props.id)
            },
            onToggleImagePopup: this.onToggleImagePopup.bind(this),
            pickerColors: this.props.options.pickerColors,
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        !nextProps.editorActive && this.die();
        return (this.medium && (nextProps.data.html !== this.medium.editor.getContent())) || (nextProps.editorActive !== this.props.editorActive);
    }

    die() {
        if (this.medium) {
            this.medium.editor.getExtensionByName('toolbar').destroy();
            this.medium.editor.destroy();
            delete this.medium;
        }

    };

    /**
     * Updates rendering of props that are not updated by react
     * Here that updates styles of background
     */
    renderNonReactAttributes(data) {
        if(this.props.editorActive){
            if(!this.medium) {
                this.componentInit();
                this.props.node.addEventListener('click', this.onClick.bind(this));
                this.props.node.className = this.props.className;
            }
        } else {
            this.props.node.removeEventListener('click', this.onClick.bind(this));
            this.props.node.className = '';

            // the die method called also from  the shouldComponentUpdate method and this. medium can not exist here
            if(this.medium) {
                this.die();
            }
        }

        if (!this.medium) {
            return;
        }

        let content = this.medium.editor.getContent();
        if (content != data.html) {
            this.medium.editor.setContent(data.html);
        }

    }

    componentWillUnmount() {
        this.die();
        console.log(`Medium editor ${this.props.id} unmounted`);
    }

    render() {
        this.renderNonReactAttributes(this.props.data);
        return React.createElement(this.props.wrapper, {})
    }
}

/**
 * Specify component should be rendered inside target node and capture all inside html
 * @type {string}
 */
RedaxtorMedium.__renderType = "BEFORE";
RedaxtorMedium.__name = "Html";