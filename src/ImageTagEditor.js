import React, {Component} from 'react'
import {imageManagerApi} from './imageManager/index';

export default class RedaxtorImageTag extends Component {
    constructor(props) {
        super(props);

        this.targetImg = props.node;
        if (this.targetImg.nodeName != "IMG") {
            throw new Error("Image editor should be set on image");
        }

        this.state = {firstRun: true};
        this.active = false;//TODO: Think how to do that more "react" way. This flag allows to handle events bound to PARENT node. Ideally we should not have parent node at all.
        this.onClickBind = this.onClick.bind(this);

    }

    componentDidMount() {
        imageManagerApi.init({api: this.props.api});

        this.check();
    };


    onToggleImagePopup() {
        imageManagerApi.get().setImageData({
            url: this.targetImg.src,
            alt: this.targetImg.alt || "",
            width: this.targetImg.width,
            height: this.targetImg.height
        });
        imageManagerApi.get().setImageData({
            onClose: this.cancelCallback.bind(this),
            onSave: this.saveCallback.bind(this),
            settings: {
                editDimensions: false,
                editBackground: false
            }
        });
        imageManagerApi.get().showPopup();
    }

    saveCallback(data) {
        this.targetImg.src = data.url;
        this.targetImg.alt = data.alt;
        this.props.updatePiece(this.props.id, {data: {src: this.targetImg.src, alt: this.targetImg.alt}});
        this.props.savePiece(this.props.id);
    }

    cancelCallback() {
    }

    onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.onToggleImagePopup();
    }

    /**
     * Ensures editor is enabled
     */
    componentInit() {
        if (!this.active && this.targetImg) {
            this.targetImg.addEventListener("click", this.onClickBind);
            this.targetImg.classList.add("r_editor");
            this.targetImg.classList.add("r_edit");
            this.active = true;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.data.src !== this.targetImg.src || nextProps.data.alt !== this.targetImg.alt || nextState.editorActive !== this.props.editorActive);
    }

    /**
     * Ensures editor is disabled
     */
    die() {
        if (this.active && this.targetImg) {
            this.targetImg.removeEventListener("click", this.onClickBind);
            this.targetImg.classList.remove("r_editor");
            this.targetImg.classList.remove("r_edit");
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

    componentWillUnmount(){
        this.die();
        console.log(`Image editor ${this.props.id} unmounted`);
    }

    render() {
        this.check();
        return React.createElement(this.props.wrapper, {})
    }
}

/**
 * Specify component should have a separate node and is not modifying insides or outsides of target node
 * @type {string}
 */
RedaxtorImageTag.__renderType = "BEFORE";
RedaxtorImageTag.__name = "Images";