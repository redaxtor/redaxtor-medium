import React, {Component, PropTypes,} from 'react'
import ReactDOM from 'react-dom'
import {Piece} from "redaxtor"
import _MediumEditor from './HTMLEditor'

export default class RedaxtorMedium extends Component {
    static propTypes = {
        tag: PropTypes.string,
        text: PropTypes.string,
        options: PropTypes.any,
        onChange: PropTypes.func,
        flushEditorDOM: PropTypes.bool
    };

    static defaultProps = {
        tag: 'div',
        initialHTML: '',
        onChange: () => {
        }
    };

    componentDidMount() {
        const dom = ReactDOM.findDOMNode(this);
        this.medium = new _MediumEditor(dom, {
            onUpdate: ()=> {
                this.props.updatePiece(this.props.id, {data: {html: this.medium.element.innerHTML}})
            },
            onSave: ()=> {
                this.props.savePiece(this.props.id)
            }
        });
    };

    shouldComponentUpdate(nextProps, nextState) {
        return false;
        // return nextProps.data.html !== this.medium.element.innerHTML;
    }

    componentWillUnmount() {
        this.medium.editor.removeListeners();
        this.medium.editor.destroy();
    };

    render() {
        return <Piece dangerouslySetInnerHTML={{__html: this.props.node.innerHTML}}
        highlight={this.props.highlight} edit={this.props.edit}/>
    }
}