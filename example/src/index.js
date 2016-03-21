import Redaxtor from 'redaxtor'
import MediumEditor from "../../src/index"
let components = {
    html: MediumEditor
}

//initialise Redaxtor with options
//ANY option and suboption is optional and has default value
let redaxtor = new Redaxtor({
    pieces: {
        attribute: "data-piece",
        idAttribute: "data-id",
        fetchAttribute: "data-fetch",
        saveAttribute: "data-save",
        components: components,
        initialState: {}
    },
    state: {}
});
