import ImageManager from './ImageManager'
import ReactDOM from "react-dom";
import React, {Component} from "react"

const lazy = {
    imageManger: null,
    api: null
};

const lazyGetImageManager = (api, container)=>{
    if(lazy.imageManger) {
        return lazy.imageManager;
    }
    lazy.api = api;
    var popupNode = document.createElement("redaxtor-image-manager");
    lazy.imageManager = ReactDOM.render(
        <ImageManager api={api}/>,
        popupNode
    );
    container.appendChild(popupNode);
    return lazy.imageManager;
};

const init = (data) => {
    if(lazy.imageManger && lazy.api != data.api) {
        console.error("Image manager is singleton-ish and can't be recreated with different API")
    }
    lazyGetImageManager(data.api, data.container || document.body);
};

const get = () => {
    return lazy.imageManager;
};

export const imageManagerApi = {
    get: get,
    init: init
};