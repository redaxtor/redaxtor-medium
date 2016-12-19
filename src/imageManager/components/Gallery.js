import React, {Component} from "react"
import Popup from './Popup'
import Portal from './Portal'

export default class Gallery extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    confirmDelete() {
        this.props.onDelete && this.props.onDelete(this.state.image.id);
        this.setState({image: null});
    }

    cancelDelete() {
        this.setState({image: null});
    }

    render() {
        return (
            <div className="gallery-wrapper">
                <h2>Uploaded images</h2>
                <div className="gallery-container">
                    {Object.keys(this.props.gallery).map(index =>
                        <div key={this.props.gallery[index].id} className="gallery-item-container">
                            <div className="gallery-item"
                                 onClick={()=> {this.props.onChange(this.props.gallery[index])}}
                                 style={{backgroundImage: "url("+(this.props.gallery[index].url?this.props.gallery[index].url:this.props.gallery[index])+")"}}>
                                {this.props.deleteUrl &&
                                <span className="delete-icon"
                                      onClick={(e)=>{e.stopPropagation(); this.setState({image: this.props.gallery[index]})}}>
                                    <i className="im-icon-trash-empty"/>
                                </span>}
                            </div>
                        </div>
                    )}
                </div>
                {this.state.image &&
                <Portal portalId={"confirm"}>
                    <Popup contentClass={"confirm"}>
                        <div style={{textAlign: 'center'}}>
                            <p>Delete this image?</p>
                            <img className="gallery-item" src={this.state.image.url}
                                 style={{maxWidth: '200px', maxHeight: '200px'}}>
                            </img>
                        </div>
                        <div className="actions-bar" style={{textAlign: 'center'}}>
                            <div className="button button-cancel" onClick={this.cancelDelete.bind(this)}>Cancel</div>
                            <div className="button button-save" onClick={this.confirmDelete.bind(this)}>Confirm</div>
                        </div>
                    </Popup>
                </Portal>}
            </div>)
    }
}