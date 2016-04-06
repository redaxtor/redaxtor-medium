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
            }
        });
        this.setState({firstRun: false})
    }
    //TODO think about this
    //shouldComponentUpdate(nextProps, nextState) {
    //    debugger
    //    return false;
    //    // return nextProps.data.html !== this.medium.element.innerHTML;
    //}

    componentWillUnmount() {
        this.medium.editor.removeListeners();
        this.medium.editor.destroy();
    };

    render() {
        var settings;
        if (this.state.firstRun){
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
                contentEditable: true
            }
        }
        return React.createElement(this.props.wrapper, settings)
    }
}