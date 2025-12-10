# SWP.GMS.FE

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Cloudinary Image Upload

Configure the following environment variables in your `.env` (or `.env.local`) file so uploads can use Cloudinary:

```
VITE_CLOUDINARY_CLOUD_NAME=<your-cloud-name>
VITE_CLOUDINARY_UPLOAD_PRESET=<unsigned-upload-preset>
VITE_CLOUDINARY_API_KEY=<optional-api-key>
VITE_CLOUDINARY_FOLDER=<optional-default-folder>
```

Then import and call the service wherever you need to upload an image:

```js
import cloudinaryService from '@/services/cloudinary'

const { url } = await cloudinaryService.uploadImage(fileInput.files[0])
```
