import { EventEmitter } from 'events'
import { readdir, readFile, writeFile } from 'fs/promises'
import { basename, extname } from 'path'

import cheerio from 'cheerio'
import markdownIt from 'markdown-it'
import frontMatter from 'markdown-it-front-matter'
import { pEvent } from 'p-event'
import YAML from 'yaml'

import pkg from './package.json' assert { type: 'json' }

const mutex = new EventEmitter

const encoding = 'utf-8'
const context = {}
const md = markdownIt().use(frontMatter, async (fm) => {
    try {
        const { target } = context
        const { description } = YAML.parse(fm)
        const $ = cheerio.load(await readFile(target, encoding))
        $(`<meta name='description' content='${description}'>`).appendTo('head')
        await writeFile(target, $.html(), encoding)
        console.log(`Wrote metadata to ${target} file.`)
    }
    finally {
        mutex.emit('done')
    }
})

for (const file of await readdir(pkg.docpress.docs)) {
    const ext = extname(file)
    if (ext !== '.md') continue
    context.source = `${pkg.docpress.docs}/${file}`
    context.target = `${pkg.docpress.dist}/${basename(file, ext)}.html`
    const tokens = md.parse(await readFile(context.source, encoding))
    if (tokens.some(({ type }) => type === 'front_matter')) {
        await pEvent(mutex, 'done')
    }
}
