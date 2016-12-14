import React, {Component} from "react"
import Popup from './components/Popup'
import Gallery from './components/Gallery'
import request from "superagent"

export default class ImageManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: false
        }
    }

    toggleImagePopup() {
        this.setState({isVisible: !this.state.isVisible})
    }

    onClose() {
        this.toggleImagePopup();
        this.state.onClose && this.state.onClose();
        this.resetData();
    }

    onSave() {
        this.toggleImagePopup();
        this.state.onSave && this.state.onSave(this.getImageData());
        this.resetData();
    }

    onUrlChange(url) {
        this.setState({url: url, alt: ""});
        this.getImageSize(url);
    }

    getImageSize(url, getOriginalSizeOnly) {
        var that = this;
        var img = new Image();
        img.onload = function () {
            !getOriginalSizeOnly && that.setState({width: this.width, height: this.height});
            that.setState({originalWidth: this.width, originalHeight: this.height});
        }
        img.src = url;
    }

    onWidthChange(e) {
        let newWidth = e.target.value;
        this.setState({width: newWidth});
        if (this.state.proportions) {
            this.setState({height: parseInt(newWidth * this.state.originalHeight / this.state.originalWidth)});
        }
    }

    onHeightChange(e) {
        let newHeight = e.target.value;
        this.setState({height: newHeight});
        if (this.state.proportions) {
            this.setState({width: parseInt(newHeight * this.state.originalWidth / this.state.originalHeight)});
        }
    }

    closePopup() {
        this.setState({isVisible: false})
    }

    showPopup() {
        this.setState({isVisible: true})
    }

    getImageData() {
        return {
            url: this.state.url,
            alt: this.state.alt || "",
            width: this.state.width,
            height: this.state.height
        }
    }

    setImageData(data) {
        (!data.alt && data.url) && (data.alt = "");
        this.setState(data);
        data.url && this.getImageSize(data.url, !!data.width);
    }

    sendFile() {
        var that = this
        if (!this.state.file || !this.state.file[0]) return;
        var file = this.state.file[0],
            formdata = new FormData();
        formdata.append("image", file);
        request.post(that.state.imageUploadUrl)
            .send(formdata)
            .end(function (err, res) {
                var response = JSON.parse(res.text);
                that.onUrlChange(response.data.url);
                if (that.state.gallery) {
                    that.state.gallery.push(response.data.url);
                    that.setState({file: null})
                }
            });
    }

    selectGalleryItem(data) {
        if (typeof data === "object") {
            this.setImageData(data)
        } else {
            this.onUrlChange(data)
        }
    }

    deleteGalleryItem(id) {
        var that = this;
        request.post(this.state.imageDeleteUrl)
            .send({id: id})
            .end(function (err, res) {
                if (!err) {
                    var index = that.state.gallery.findIndex(element=> element.id === id);
                    that.state.gallery.splice(index, 1);
                    that.forceUpdate()
                }
            });
    }

    resetData() {
        this.setState({
            url: null,
            alt: null,
            width: null,
            height: null,
            originalHeight: null,
            originalWidth: null,
            onClose: null,
            onSave: null
        })
    }

    render() {
        return (
            <div>
                { this.state.isVisible && <Popup isOpen={this.state.isVisible}>
                    <div className="image-inputs-container">
                        <div className="image-left-part">
                            <div className="item-form">
                                <input onChange={e=>this.onUrlChange.call(this, e.target.value)}
                                       placeholder="Enter image URL" value={this.state.url||""}/>
                            </div>
                            <div className="item-form">
                                <input onChange={e=>this.setState({alt: e.target.value})}
                                       placeholder="Enter image alt" value={this.state.alt||""}/>
                            </div>
                            <div className="sizes item-form">
                                <div className="input-container">
                                    <input onChange={this.onWidthChange.bind(this)}
                                           placeholder="width" value={this.state.width||""}
                                           style={{width: "65px", marginRight: "10px"}}/>
                                </div>
                                X
                                <div className="input-container">
                                    <input onChange={this.onHeightChange.bind(this)}
                                           placeholder="height" value={this.state.height||""}
                                           style={{width: "65px", marginLeft: "10px"}}/>
                                </div>
                                <div className="sizes-checkbox">
                                    <input type="checkbox" id="proportions" name="proportions"
                                           onChange={e=>{this.setState({proportions: e.target.checked})}}
                                           defaultChecked={this.state.proportions}/>
                                    <label htmlFor="proportions">Constrain proportions</label>
                                </div>

                            </div>
                        </div>
                        <div className="image-right-part">
                            <img src={this.state.url} alt={this.state.alt}/>
                        </div>
                    </div>
                    {
                        this.state.imageUploadUrl &&
                        <div className="browse-wrap">
                            <div
                                className="title">{this.state.file ? this.state.file[0].name : "Choose a file to upload"}</div>
                            <input type="file" className="upload" title="Choose a file to upload"
                                   onChange={(e)=>{this.setState({file: e.target.files})}}/>
                            <button type="submit" className="button" onClick={this.sendFile.bind(this)}>Upload File
                            </button>
                        </div>
                    }
                    {
                        this.state.gallery &&
                        <Gallery gallery={this.state.gallery} deleteUrl={!!this.state.imageDeleteUrl}
                                 onChange={(url)=>{this.selectGalleryItem.call(this, url)}}
                                 onDelete={(id)=>this.deleteGalleryItem.call(this, id)}
                        />
                    }
                    <div className="actions-bar">
                        <div className="button button-cancel" onClick={this.onClose.bind(this)}>Cancel</div>
                        <div className="button button-save" onClick={this.onSave.bind(this)}>Save</div>
                    </div>
                </Popup>
                }
            </div>
        )
    }
}