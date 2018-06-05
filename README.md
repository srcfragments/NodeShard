# NodeShard

Embedded device communication hub for the SourceFragments project

### Installing
#### Install Node and NPM (Using PPA to get latest version)

Get the setup script:

```shell
$ cd ~
$ curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
```

Inspect that you have the script, then run with `sudo`:

```shell
$ vim nodesource_setup.sh
$ sudo bash nodesource_setup.sh
```

Now install Nodejs:

```shell
$ sudo apt-get install nodejs
```

The nodejs package contains the nodejs binary as well as npm, so you don't need to install npm separately. However, in order for some npm packages to work (such as those that require compiling code from source), you will need to install the build-essential package:

```shell
$ sudo apt-get install build-essential
```

#### Add Dependencies

Go to the root directory of the project and run:

```shell
$ npm install
```

## Deployment

Go to the root directory of the project and run:

```shell
$ nodejs ./main.js
```
After that try to open 'http://localhost:8080/' in your browser

## Authors

* **Georgi Kyuchukov** - *Initial work* - [srcfragments](https://github.com/srcfragments)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
