import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import _MediumEditor from './HTMLEditor'
import {imageManagerApi} from './imageManager/index';

export default class RedaxtorMedium extends Component {
    constructor(props) {
        super(props)
        this.state = {codeEditorActive: false, firstRun: true};
        this.props.images && this.props.images.galleryGetUrl && imageManagerApi.init({galleryGetUrl: this.props.images.galleryGetUrl})
        this.props.images && this.props.images.imageUploadUrl && imageManagerApi.init({imageUploadUrl: this.props.images.imageUploadUrl})
    }

    componentDidMount() {

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
            imageManagerApi.setImageData({url: this.img.src, alt: this.img.alt || "", width: +this.img.width, height: +this.img.height})
        }
        this.medium.editor.saveSelection();
        //this.saveSelection()
        imageManagerApi.setImageData({
            onClose: this.cancelCallback.bind(this),
            onSave: this.saveCallback.bind(this)
        })
        imageManagerApi.showPopup();
    }

    saveCallback(data) {
        this.medium.editor.restoreSelection()
        //this.restoreSelection()
        if (this.img) {
            this.img.src = data.url;
            this.img.alt = data.alt;
            this.img.style.width = data.width+"px";
            this.img.style.height = data.height+"px";
            this.img = null;
        } else {
            this.medium.editor.pasteHTML('<img src="' + (data.url || "") + '" alt="' +
                (data.alt || "") + 'style="' + 'width: "' + (data.width || "") +
                'px; height: "' + (data.height || "") + 'px">')
        }
        this.props.updatePiece(this.props.id, {data: {html: this.medium.element.innerHTML}})
    }

    cancelCallback() {
        this.medium.editor.restoreSelection()
        //this.restoreSelection();
    }

    onClick(e) {
        if (e.target.tagName.toLowerCase() !== 'img') {
            this.img = null;
        } else {
            this.img = e.target;
        }
        if (e.target.tagName.toLowerCase() !== 'img') return
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNode(e.target);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    componentInit() {
        const dom = ReactDOM.findDOMNode(this);
        this.medium = new _MediumEditor(dom, {
            onUpdate: ()=> {
                this.props.updatePiece(this.props.id, {data: {html: this.medium.element.innerHTML}})
            },
            onSave: ()=> {
                this.props.savePiece(this.props.id)
            },
            onSetCurrentSourcePieceId: ()=> {
                this.props.setCurrentSourcePieceId(this.props.id)
            },
            onToggleImagePopup: this.onToggleImagePopup.bind(this)
        });
        this.setState({firstRun: false})
    }

    shouldComponentUpdate(nextProps, nextState) {
        !nextProps.edit && this.die()
        return (this.medium && (nextProps.data.html !== this.medium.element.innerHTML)) || (this.state.firstRun !== nextState.firstRun) || (nextProps.edit !== this.props.edit);
    }

    die() {
        if (this.medium) {
            this.medium.editor.getExtensionByName('toolbar').destroy();
            this.medium.editor.destroy();
        }
        this.state.firstRun = true;
    };

    render() {
        var settings;
        if (!this.props.edit){
            settings = {
                className: this.props.className,
                dangerouslySetInnerHTML: {__html: this.props.data.html}
            }
        }
        else if (this.state.firstRun) {
            settings = {
                className: this.props.className,
                dangerouslySetInnerHTML: {__html: this.props.data.html},
                onFocus: this.componentInit.bind(this),
                contentEditable: true
            }
        } else {
            settings = {
                className: this.props.className,
                dangerouslySetInnerHTML: {__html: this.props.data.html},
                contentEditable: true,
                onClick: this.onClick.bind(this),
                onBlur: ()=>{this.props.updatePiece(this.props.id, {data: {html: this.medium.element.innerHTML}}); this.props.savePiece(this.props.id)}
            }
        }
        return React.createElement(this.props.wrapper, settings)
    }
}