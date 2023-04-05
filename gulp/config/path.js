import * as nodePath from 'path'

const rootFolder = nodePath.basename(nodePath.resolve())

const buildFolder = `./dist`
const srcFolder = `./src`

export const path = {
    build: {
        css: `${buildFolder}/css/`,
        html: `${buildFolder}/`
    },
    src: {
        scss: `${srcFolder}/typographics.scss`,
        html: `${srcFolder}/**/*.{html,json}`
    },
    watch: {
        scss: `${srcFolder}/typographics.scss`,
        html: `${srcFolder}/**/*.html`
    },
    clean: buildFolder,
    buildFolder: buildFolder,
    srcFolder: srcFolder,
    rootFolder: rootFolder
}
