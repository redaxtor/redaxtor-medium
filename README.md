# Redaxtor-medium
Redaxtor-medium is a MediumEditor plugin for Redaxtor library

## Build for example
```
npm install
npm run build:umd:example
```

## The Gist
```js
var Redaxtor = require('redaxtor');
var RedaxtorMedium = require('redaxtor-medium');
require('!style!css!medium-editor/dist/css/medium-editor.css');
require('!style!css!redaxtor-medium/lib/redaxtor-medium.css');

var components = {
    html: RedaxtorMedium
}

let redaxtor = new Redaxtor({
    pieces: {
        components: components
    }
});
```
