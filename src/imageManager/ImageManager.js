import React, {Component} from "react"
import Popup from './components/Popup'
import Gallery from './components/Gallery'
import vanillaColorPicker from '../helpers/VanillaColorPicker';
import RxCheckBox from './components/RxCheckBox';

export default class ImageManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: false,
            settings: {}
        };

        this.updateImageList();

    }

    updateImageList(){
        this.props.api && this.props.api.getImageList && this.props.api.getImageList(this.state.pieceRef).then((list) => {
            // add index to item if not set by the server
            list.forEach((item, index) => {
                if(!item.id){
                    item.id = index;
                }
            });
            this.setState({gallery: list})
        });
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

    onUrlChange(imageData) {
        this.setState({url: imageData.url, alt: ""});
        this.getImageSize(imageData);
    }

    getImageSize(imageData, getOriginalSizeOnly) {

        //if is image from gallery
        if(imageData.width &&  imageData.height) {
            !getOriginalSizeOnly && this.setState({width: imageData.width, height: imageData.height});
            this.setState({originalWidth: imageData.width, originalHeight: imageData.height});
        } else {
            //if set by hands
            var that = this;
            var img = new Image();
            img.onload = function () {
                !getOriginalSizeOnly && that.setState({width: this.width, height: this.height});
                that.setState({originalWidth: this.width, originalHeight: this.height});
            }
            img.src = imageData.url;
        }

    }

    setBgSize(e) {
        let bgSize = e.target.value;
        this.setState({bgSize});
    }

    setBgPosition(e) {
        let bgPosition = e.target.value;
        this.setState({bgPosition});
    }

    setBgColor(e) {
        let bgColor = e.target.value;
        this.setState({bgColor});
    }

    pickBgColor(e) {
        this.attachPickerAndInvoke();
    }

    setBgRepeat(e) {
        let bgRepeat = e.target.value;
        this.setState({bgRepeat});
    }

    attachPickerAndInvoke() {
        // colors for picker
        let pickerColors = [
            "inherit",
            "#9b59b6",
            "#34495e",
            "#16a085",
            "#27ae60",
            "#2980b9",
            "#8e44ad",
            "#2c3e50",
            "#f1c40f",
            "#e67e22",
            "#e74c3c",
            "#bdc3c7",
            "#95a5a6",
            "#666",
            "#212121",
            "#f39c12",
            "#d2d064",
            "#4fbbf7",
            "#ffffff"
        ];

        /**
         * If we have previously created color picker that is not bound to correct element, kill it
         */
        if (this.picker) {
            if (this.picker.__boundElement != this.colorDiv) {
                this.picker.destroyPicker();
                this.picker = null;
            }
        }

        /**
         * If we still have a picker, open it
         */
        if (this.picker) {
            this.picker.openPicker();
        } else {
            //Create new picker
            this.picker = vanillaColorPicker(this.colorDiv);
            this.picker.set("customColors", pickerColors);
            this.picker.set("positionOnTop");
            this.picker.openPicker();
            this.picker.on("colorChosen", (color) => {
                if (color == "inherit") {
                    this.setState({
                        bgColor: ""
                    })
                } else {
                    this.setState({
                        bgColor: color
                    })
                }
            });
            this.picker.__boundElement = this.colorDiv;
        }
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
        let data = {
            url: this.state.url,
            alt: this.state.alt || "",
        };

        /**
         * If image was resized, export new sizes
         */
        if (this.state.originalHeight != this.state.height || this.state.originalWidth != this.state.width) {
            data = {
                width: this.state.width,
                height: this.state.height,
                ...data
            }
        }

        /**
         * If editing background, pass backgrounds too
         */
        if (this.state.settings.editBackground) {
            data = {
                bgColor: this.state.bgColor,
                bgPosition: this.state.bgPosition,
                bgRepeat: this.state.bgRepeat,
                bgSize: this.state.bgSize,
                ...data
            }
        }

        return data;
    }

    setImageData(data) {
        (!data.alt && data.url) && (data.alt = "");
        this.setState(data);
        data.url && this.getImageSize(data, !!data.width);
        this.updateImageList();
    }

    sendFile() {
        if (this.props.api.uploadImage) {
            if (!this.state.file || !this.state.file[0]) return;
            var file = this.state.file[0],
                formdata = new FormData();

            formdata.append("image", file);

            this.props.api.uploadImage(formdata).then((response) => {
                let newImageData = {
                    url: response.url,
                    thumbnailUrl: response.thumbnailUrl,
                    width: response.width,
                    height: response.height,
                    id: response.id || this.state.gallery.length
                };

                this.onUrlChange(newImageData);
                if (this.state.gallery) {
                    this.state.gallery.push(newImageData);
                    this.setState({file: null})
                }
            })
        }
    }

    /**
     * save new images data
     * @param data {object} new image data
     */
    selectGalleryItem(data) {

        //change URL
        if(data.url != this.state.url){
            this.onUrlChange(data)
        }
        data.pieceRef = this.state.pieceRef;
        this.setImageData(data)

    }

    deleteGalleryItem(id) {
        if (this.props.api.deleteImage) {
            this.props.api.deleteImage(id).then(() => {
                var index = this.state.gallery.findIndex(element => element.id === id);
                this.state.gallery.splice(index, 1);
                this.forceUpdate()
            })
        }
    }

    resetData() {
        this.setState({
            url: null,
            alt: null,
            api: {},
            width: null,
            height: null,
            originalHeight: null,
            originalWidth: null,
            onClose: null,
            onSave: null,
            settings: {}
        })
    }

    render() {
        return (
            <div>
                { this.state.isVisible && <Popup isOpen={this.state.isVisible}>
                    <div className="r_modal-title">
                        <div className="r_modal-close" onClick={this.onClose.bind(this)}>
                            <i className="rx_icon rx_icon-close">&nbsp;</i>
                        </div>
                        <span>Insert Image</span>
                    </div>
                    <div className="image-inputs-container">
                        <div className="image-left-part">
                            <div className="item-form">
                                <input onChange={e => this.onUrlChange.call(this, {url: e.target.value})}
                                       placeholder="Enter image URL" value={this.state.url || ""}/>
                            </div>
                            {!this.state.settings.editBackground &&
                            <div className="item-form">
                                <input onChange={e => this.setState({alt: e.target.value})}
                                       placeholder="Enter image alt" value={this.state.alt || ""}/>
                            </div>}
                            {this.state.settings.editDimensions &&
                            <div className="sizes item-form">
                                <div className="input-container">
                                    <input onChange={this.onWidthChange.bind(this)}
                                           placeholder="width" value={this.state.width || ""}
                                           style={{width: "65px", marginRight: "10px"}}/>
                                </div>&times;<div className="input-container">
                                    <input onChange={this.onHeightChange.bind(this)}
                                           placeholder="height" value={this.state.height || ""}
                                           style={{width: "65px", marginLeft: "10px"}}/>
                                </div>
                                <div className="proportions-checkbox" onClick={e => {
                                    this.setState({proportions: !this.state.proportions})
                                }}>
                                    <label>Constrain proportions</label>
                                    <RxCheckBox checked={this.state.proportions}/>
                                </div>

                            </div>
                            }
                            {this.state.settings.editBackground &&
                            <div className="sizes item-form">
                                <div className="input-container">
                                    <select name="background-size" value={this.state.bgSize}
                                            onChange={this.setBgSize.bind(this)}>
                                        <option value="">Don't Resize</option>
                                        <option value="cover">Resize to Fill</option>
                                        <option value="contain">Resize to Fit</option>
                                    </select>
                                </div>
                                <div className="input-container">
                                    <select name="background-repeat" value={this.state.bgRepeat}
                                            onChange={this.setBgRepeat.bind(this)}>
                                        <option value="no-repeat">No Tiling</option>
                                        <option value="repeat">Tile</option>
                                        <option value="repeat-x">Tile Horizontally</option>
                                        <option value="repeat-y">Tile Vertically</option>
                                    </select>
                                </div>
                                <div className="input-container">
                                    <select name="background-position" value={this.state.bgPosition}
                                            onChange={this.setBgPosition.bind(this)}>
                                        <option value="50% 50%">Center</option>
                                        <option value="0px 0px">Top Left</option>
                                    </select>
                                </div>
                            </div>}
                            {this.state.settings.editBackground &&
                            <div className="sizes item-form">
                                <div className="input-container">
                                    <input ref={(input) => {
                                        this.colorInput = input;
                                    }} onChange={this.setBgColor.bind(this)}
                                           onClick={this.pickBgColor.bind(this)}
                                           placeholder="Color" value={this.state.bgColor || ""}
                                           style={{width: "130px", marginRight: "5px"}}/>
                                    <div color={this.state.bgColor} ref={(div) => {
                                        this.colorDiv = div;
                                    }} onClick={this.pickBgColor.bind(this)} className="color-pick"
                                         style={{backgroundColor: this.state.bgColor || ""}}>
                                    </div>
                                </div>
                            </div>
                            }
                        </div>
                        <div className="image-right-part">
                            {this.props.api.uploadImage &&
                            <div>
                                <div className="browse-wrap">
                                    <div className="button button-default">{this.state.file ? this.state.file[0].name : "Choose File"}
                                        <input type="file" className="upload" title="Choose a file to upload"
                                               onChange={(e) => {
                                                   this.setState({file: e.target.files})
                                               }}/>
                                    </div>
                                    <div className="button">
                                        <button type="submit" className="button" onClick={this.sendFile.bind(this)}>
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            </div>}
                            <div className="preview-wrapper"><img src={this.state.url} alt={this.state.alt}/></div>
                        </div>
                    </div>

                    {
                        this.state.gallery &&
                        <Gallery gallery={this.state.gallery} api={this.props.api}
                                 onChange={(imageData) => {
                                     this.selectGalleryItem.call(this, imageData)
                                 }}
                                 onDelete={(id) => this.deleteGalleryItem.call(this, id)}
                        />
                    }
                    <div className="r_modal-actions-bar">
                        <div className="button button-save" onClick={this.onSave.bind(this)}>Save</div>
                    </div>
                </Popup>
                }
            </div>
        )
    }
}