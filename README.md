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
require('redaxtor-medium/lib/styles/redaxtor.css');

var components = {
    html: RedaxtorMedium
}

let redaxtor = new Redaxtor({
    pieces: {
        components: components
    }
});
```
