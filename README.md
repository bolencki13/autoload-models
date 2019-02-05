# autoload-models

autoload-models is a Nodejs Command Line Tool for translating json files into swift models automatically.

## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to install autoload-models.

```bash
npm i -g autoload-models
```

## Usage

### Xcode

Integrate autoload-models into an Xcode scheme to dynamically generate models
in the IDE. Just add a new "Run Script Phase" with:

```bash
if which autoload-models >/dev/null; then
  autoload-models --project . --path './models/' --output './autoload-models-test/models/'
else
  echo "warning: auto-load-models is not installed, download from https://github.com/bolencki13/autoload-models"
fi
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Resources
A number of resources were used for the development of this package. Here are some:

* https://github.com/rnpm/rnpm-plugin-link/tree/master/src/ios
* https://github.com/apache/cordova-node-xcode

## License
[MIT](https://choosealicense.com/licenses/mit/)
