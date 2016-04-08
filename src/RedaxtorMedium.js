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
        this.props.updatePiece(this.props.id, {data: {html: this.medium.element.innerHTML}})
        if (this.img) {
            this.props.saveImageData({url: this.img.src, alt: this.img.alt || ""})
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
            this.img.src = this.props.imageInsert.url;
            this.img.alt = this.props.imageInsert.alt;
            this.img = null;
        } else {
            this.medium.editor.pasteHTML('<img src="' + (this.props.imageInsert.url || "") + '" alt="' + (this.props.imageInsert.alt || "") + '">')
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
            //onToggleImagePopup: this.props.toggleImagePopup,
            //setCancelCallback: this.props.setCancelCallback,
            //setSaveCallback: this.props.setSaveCallback,
            //saveCallback: this.saveCallback.bind(this),
            //cancelCallback: this.cancelCallback.bind(this)

        });
        this.setState({firstRun: false})
    }

    //TODO think about this
    shouldComponentUpdate(nextProps, nextState) {
        if (!this.medium) return false;
        return (nextProps.data.html !== this.medium.element.innerHTML) || (this.state.firstRun!==nextState.firstRun);
    }

    componentWillUnmount() {
        this.medium.editor.removeListeners();
        this.medium.editor.destroy();
    };

    render() {
        var settings;
        if (this.state.firstRun) {
            settings = {
                style: this.props.style,
                dangerouslySetInnerHTML: {__html: this.props.data.html},
                onFocus: this.componentInit.bind(this),
                contentEditable: true
            }
        } else {
            settings = {
                style: this.props.style,
                dangerouslySetInnerHTML: {__html: this.props.data.html},
                contentEditable: true,
                onClick: this.onClick.bind(this)
            }
        }
        return React.createElement(this.props.wrapper, settings)
    }
}