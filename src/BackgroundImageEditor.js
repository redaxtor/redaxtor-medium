import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {imageManagerApi} from './imageManager/index';

export default class RedaxtorBackgroundEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {firstRun: true};
        this.active = false;//TODO: Think how to do that more "react" way. This flag allows to handle events bound to PARENT node. Ideally we should not have parent node at all.
        this.onClickBind = this.onClick.bind(this);
        this.targetDiv = props.node;
    }

    componentDidMount() {
        imageManagerApi.init({api: this.props.api});
        this.check();
    };


    onToggleImagePopup() {
        imageManagerApi.get().setImageData({
            url: this.targetDiv.style.backgroundImage && this.targetDiv.style.backgroundImage.slice(4, -1).replace(/"/g, ""),
            bgColor: this.targetDiv.style.backgroundColor,
            bgRepeat: this.targetDiv.style.backgroundRepeat,
            bgSize: this.targetDiv.style.backgroundSize,
            bgPosition: this.targetDiv.style.backgroundPosition,
            alt: this.targetDiv.title || ""
        });
        imageManagerApi.get().setImageData({
            onClose: this.cancelCallback.bind(this),
            onSave: this.saveCallback.bind(this),
            settings: {
                editDimensions: false,
                editBackground: true
            }
        });
        imageManagerApi.get().showPopup();
    }

    saveCallback(data) {
        this.applyStyling(data);
        this.props.updatePiece(this.props.id, {
            data: {
                url: data.url,
                alt: data.alt,
                bgSize: data.bgSize,
                bgRepeat: data.bgRepeat,
                bgPosition: data.bgPosition,
                bgColor: data.bgColor
            }
        });
        this.props.savePiece(this.props.id);
    }

    cancelCallback() {
    }

    findRedaxtor (el) {
        while (el && el.tagName.toLowerCase() != 'redaxtor') {
            el = el.parentElement;
        }
        return el;
    }

    onClick(e) {
        if(this.findRedaxtor(e.target)) {
            // Here we try dealing with mix of native and React events
            // We find if event was triggered within redaxtor tag
            // This can only happen when this element is wrapped in editor that needs exclusive access to element
            // Background editor is not that kind of editor so that is 100% not "our" click, so skip it
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.onToggleImagePopup();
    }

    /**
     * Ensures editor is enabled
     */
    componentInit() {
        if (!this.active && this.targetDiv) {
            this.targetDiv.addEventListener("click", this.onClickBind);
            this.targetDiv.classList.add("r_editor");
            this.targetDiv.classList.add("r_edit");
            this.active = true;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.data.url !== this.targetDiv.url
        || nextProps.data.bgColor !== this.targetDiv.bgColor
        || nextProps.data.bgSize !== this.targetDiv.bgSize
        || nextProps.data.bgRepeat !== this.targetDiv.bgRepeat
        || nextProps.data.bgPosition !== this.targetDiv.bgPosition
        || nextState.editorActive !== this.props.editorActive);
    }

    /**
     * Ensures editor is disabled
     */
    die() {
        if (this.active && this.targetDiv) {
            this.targetDiv.removeEventListener("click", this.onClickBind);
            this.targetDiv.classList.remove("r_editor");
            this.targetDiv.classList.remove("r_edit");
            this.active = false;
        }
    };

    /**
     * Based on external prop ensures editor is enabled or disabled
     */
    check() {
        if (this.props.editorActive) {
            this.componentInit();
        } else {
            this.die();
        }
    }

    applyStyling(data) {
        if (this.targetDiv) {
            this.targetDiv.style.backgroundImage = `url(${data.url})`;
            this.targetDiv.style.backgroundSize = data.bgSize;
            this.targetDiv.style.backgroundRepeat = data.bgRepeat;
            this.targetDiv.style.backgroundPosition = data.bgPosition;
            this.targetDiv.style.backgroundColor = data.bgColor;
            this.targetDiv.title = data.alt;
        }
    }

    render() {
        this.check();
        this.applyStyling(this.props.data);
        return React.createElement(this.props.wrapper, {})
    }
}


/**
 * Specify component should have a separate node and is not modifying insides or outsides of target node
 * @type {string}
 */
RedaxtorBackgroundEditor.__renderType = "BEFORE";