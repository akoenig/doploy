# doploy

A remote provisioning manager for the dokku platform (work in progress).

## Installation

```
npm install -g doploy
```

## SSH configuration example

`~/.ssh/config`

```sh
Host localhost.dev
   User dokku
   IdentityFile ~/.ssh/id_rsa
```

```sh
Usage: doploy [options] [command]


Commands:

  install <host>    installs the app on the given host
  uninstall <host>  uninstalls the app on the given host

Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

## Tests

    gulp test

## License

MIT © 2015, [André König](http://andrekoenig.info) (andre.koenig@posteo.de)
