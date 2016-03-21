# Redaxtor-medium
Redaxtor-medium is a MediumEditor plugin for Redaxtor library

## Build for example
```
npm install
npm run build:umd:example
```

## The Gist (Redaxtor)
```js
import Redaxtor from 'Redaxtor'

//import your components for the Redaxtor
import MediumEditor from "./components/MediumEditor/"
let components = {
    navigation: Navigation,
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
    i18n: i18n,
    state: {}
});
```
