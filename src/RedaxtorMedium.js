import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Piece} from "redaxtor"
import _MediumEditor from './HTMLEditor'

export default class RedaxtorMedium extends Component {
    componentDidMount() {
        const dom = ReactDOM.findDOMNode(this);
        this.state = {codeEditorActive: false};
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
    };

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
        return (<Piece dangerouslySetInnerHTML={{__html: this.props.data.html}}
        highlight={this.props.highlight} edit={this.props.edit}/>

        )
    }
}