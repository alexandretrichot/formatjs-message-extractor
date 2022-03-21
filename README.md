# formatjs-message-extractor

> Extract your messages defined in your React app and auto merge existing translations for defined locales.

## Install

First, add this package as development dependency :

```shell
$ yarn add -D formatjs-message-extractor
```

Then, add this following line in `"scripts"` in your *package.json* file.

```json
"intl": "formatjs-message-extractor src/lang -l en,fr"
```

This will create a *src/lang* directory with a json file for each locale specified by the `-l` option.

```
src/lang
├── en.json
└── fr.json
```

Later, when you have added other messages in your code, this same command will add the missing keys in the existing files and will delete the keys of the messages that no longer exist in your code.

## Options

A few options are available :

### `-l, --locales`

This allows you to choose the languages to be translated.

For example, the command: 

```shell
$ formatjs-message-extractor src/lang -l en,de,it
```
will create three locales files: *en.json*, *de.json* and *it.json*.

### `-d, --defaultLocale`

This define the locale used in default messages in your code.

By default this is set on `en`.
