import React, {Component} from 'react';
import ReactDOM from 'react-dom';
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

    /**
     * That is a common public method that should activate component editor if it presents
     */
    activateEditor() {
        if(this.props.editorActive && !imageManagerApi.get().state.isVisible) {
            this.onToggleImagePopup();
        }
    }


    componentWillReceiveProps(newProps) {
        if(newProps.manualActivation) {
            this.props.onManualActivation(this.props.id);
            this.activateEditor();
        }
    }

    componentDidMount() {
        imageManagerApi.init({
            api: this.props.api,
            container: ReactDOM.findDOMNode(this),
            id: this.props.id});
        this.check();
        this.rect = this.props.node.getBoundingClientRect();
    };


    onToggleImagePopup() {
        imageManagerApi.get().setImageData({
            url: this.targetImg.src,
            alt: this.targetImg.alt || "",
            width: this.targetImg.width,
            height: this.targetImg.height,
            pieceData: {
                type: this.props.type,
                data: this.props.data,
                id: this.props.id
            }
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
        this.props.updatePiece(this.props.id, {data: {src: data.url, alt: data.alt}});
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
     * Based on external prop ensures editor is enabled or disabled and attaches-detaches non-react bindings
     */
    check() {
        if (this.props.editorActive) {
            this.componentInit();
        } else {
            this.die();
        }
    }

    /**
     * Updates rendering of props that are not updated by react
     * Here that updates IMG tag src and alt
     */
    renderNonReactAttributes(data) {
        this.targetImg.src = data.src;
        this.targetImg.alt = data.alt;
    }

    componentWillUnmount(){
        this.die();
        console.log(`Image editor ${this.props.id} unmounted`);
    }

    render() {
        this.check();
        this.renderNonReactAttributes(this.props.data);
        return React.createElement(this.props.wrapper, {})
    }

    componentDidUpdate() {
        this.checkifResized();
    }

    checkifResized() {
        const rect = this.props.node.getBoundingClientRect();
        if (this.nodeWasUpdated && this.changedBoundingRect(rect)) {
            this.setBoundingRect(rect);
            this.props.onNodeResized && this.props.onNodeResized(this.props.id);
        }
    }

    /**
     * Check if node size is different
     * @param rect {ClientRect}
     */
    changedBoundingRect(rect) {
        return !this.rect ||
            this.rect.top !== rect.top ||
            this.rect.left !== rect.left ||
            this.rect.bottom !== rect.bottom ||
            this.rect.right !== rect.right;
    }

    /**
     * Store node size
     * @param rect {ClientRect}
     */
    setBoundingRect(rect) {
        this.rect = rect;
    }
}

/**
 * Specify component should have a separate node and is not modifying insides or outsides of target node
 * @type {string}
 */
RedaxtorImageTag.__renderType = "BEFORE";
RedaxtorImageTag.__name = "Images";