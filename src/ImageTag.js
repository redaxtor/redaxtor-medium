import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {imageManagerApi} from './imageManager/index';

export default class RedaxtorImageTag extends Component {
    constructor(props) {
        super(props);
        this.state = {codeEditorActive: false, firstRun: true};
        this.onToggleImagePopupBind = this.onToggleImagePopup.bind(this);
    }

    componentDidMount() {
        imageManagerApi.init({api: this.props.api});
        this.dom = ReactDOM.findDOMNode(this);
        this.targetImg = this.dom.parentNode;
        if(this.targetImg.nodeName!="IMG") {
            throw new Error("Image editor should be set on image");
        }
        this.targetImg.addEventListener("click", this.onToggleImagePopupBind);
        this.targetImg.classList.add("r_editor");
        this.targetImg.classList.add("r_edit");
    };


    onToggleImagePopup() {
        imageManagerApi.get().setImageData({url: this.targetImg.src, alt: this.targetImg.alt || "", width: this.targetImg.width, height: this.targetImg.height});
        imageManagerApi.get().setImageData({
            onClose: this.cancelCallback.bind(this),
            onSave: this.saveCallback.bind(this)
        });
        imageManagerApi.get().showPopup();
    }

    saveCallback(data) {
        this.targetImg.src = data.url;
        this.targetImg.alt = data.alt;
        this.props.updatePiece(this.props.id, {data: {html: this.dom.innerHTML}});
        this.props.savePiece(this.props.id);
    }

    cancelCallback() {
    }

    onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.onToggleImagePopup();
    }

    componentInit() {
    }

    shouldComponentUpdate(nextProps, nextState) {
        !nextProps.editorActive && this.die()
        return (nextProps.data.html !== this.dom.innerHTML);
    }

    die() {
        this.targetImg.removeEventListener("click", this.onToggleImagePopupBind);
        this.targetImg.classList.remove("r_editor");
        this.targetImg.classList.remove("r_edit");
    };

    render() {
        return React.createElement(this.props.wrapper, {})
    }
}