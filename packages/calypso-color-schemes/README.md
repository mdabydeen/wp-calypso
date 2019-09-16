# Calypso Color Schemes

This package contains a number of CSS custom properties used in Calypso.

![Color scheme thumbnails](screenshot@2x.png)

## Installation

```sh
npm install @automattic/calypso-color-schemes
```

## Usage

### CSS

Add this packages CSS from `dist/calypso-color-schemes.css` in order to access the CSS custom
properties.

### SASS

You may import the sass to use the variables directly:

```sass
@import 'src/shared/_colors';
```

Your app is responsible for ensuring the CSS properties are available by enqueing the CSS directly or by importing the SASS to include the CSS properties.

```sass
@import '~@automattic/calypso-color-schemes/src/calypso-color-schemes';
```
