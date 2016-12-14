import ImageManager from './ImageManager'
import ReactDOM from "react-dom";
import React, {Component} from "react"
import request from "superagent"


var popupNode = document.createElement("DIV");
var imageManager = ReactDOM.render(
    <ImageManager/>,
    popupNode
);
document.body.appendChild(popupNode);
var init = (data) => {
    if (data.galleryGetUrl){
        request.post(data.galleryGetUrl)
            .end(function (err, res) {
                var response = JSON.parse(res.text);
                imageManager.setImageData({gallery: response.data.list})
            });
    }
    if (data.imageUploadUrl){
        imageManager.setImageData({imageUploadUrl: data.imageUploadUrl})
    }
    if (data.imageDeleteUrl){
        imageManager.setImageData({imageDeleteUrl: data.imageDeleteUrl})
    }
}

export const imageManagerApi = {
    showPopup: imageManager.showPopup.bind(imageManager),
    setImageData: imageManager.setImageData.bind(imageManager),
    init: init
}