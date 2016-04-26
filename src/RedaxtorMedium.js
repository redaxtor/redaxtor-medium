import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import _MediumEditor from './HTMLEditor'

export default class RedaxtorMedium extends Component {
    constructor(props) {
        super(props)
        this.state = {codeEditorActive: false, firstRun: true};
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
            this.props.saveImageData({url: this.img.src, alt: this.img.alt || "", width: +this.img.width, height: +this.img.height})
        }
        this.medium.editor.saveSelection();
        //this.saveSelection()
        this.props.setCancelCallback(this.cancelCallback.bind(this));
        this.props.setSaveCallback(this.saveCallback.bind(this));
        this.props.toggleImagePopup();
    }

    saveCallback() {
        this.medium.editor.restoreSelection()
        //this.restoreSelection()
        if (this.img) {
            this.img.src = this.props.images.url;
            this.img.alt = this.props.images.alt;
            this.img.width = this.props.images.width;
            this.img.height = this.props.images.height;
            this.img = null;
        } else {
            this.medium.editor.pasteHTML('<img src="' + (this.props.images.url || "") + '" alt="' +
                (this.props.images.alt || "") + '" width="' + (this.props.images.width || "") +
                'px" height="' + (this.props.images.height || "") + 'px">')
        }
        this.props.resetImageData()
        this.props.updatePiece(this.props.id, {data: {html: this.medium.element.innerHTML}})
    }

    cancelCallback() {
        this.medium.editor.restoreSelection()
        //this.restoreSelection();
        this.props.resetImageData()
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
        if (!this.medium) return false;
        return (nextProps.data.html !== this.medium.element.innerHTML) || (this.state.firstRun !== nextState.firstRun) || (nextProps.edit !== this.props.edit);
    }

    componentWillUnmount() {
        this.medium.editor.removeListeners();
        this.medium.editor.destroy();
    };

    render() {
        var settings;
        if (this.state.firstRun) {
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
                onBlur: ()=>this.props.updatePiece(this.props.id, {data: {html: this.medium.element.innerHTML}})
            }
        }
        return React.createElement(this.props.wrapper, settings)
    }
}