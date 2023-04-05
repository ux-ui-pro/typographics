import replace from "gulp-replace"
import browserSync from "browser-sync"
import ifPlugin from "gulp-if"

export const plugins = {
	replace: replace,
	browserSync: browserSync,
	if: ifPlugin
}
