const puppeteer = require("puppeteer")
const path = require("path")

module.exports = async (template = "", options = {}, isDownload = false) => {
    if (isDownload && !options.path) throw new Error("path est obligatoire")

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
    const page = await browser.newPage()
    await page.setContent(template)

    const opts = options
    if (opts.height) {
        const pageHeigth = await page.evaluate(() => document.body.offsetHeight)
        opts.height = `${pageHeigth}px`
        // opts.pageRanges = "1"
    }
    const pdfBuffer = await page.pdf({ ...opts })

    await page.close()
    await browser.close()

    const resolveLink = isDownload && path.resolve("doc", options.path.split("./doc/")[1])
    return isDownload ? resolveLink : pdfBuffer
}