module.exports = (doc = {}, style = "") => {
    const { header, main, bottom } = doc
    return View(header, main, bottom, style)
}

const View = (header = {}, main = {}, bottom = {}, style) => {
    return (
        `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        *{
                            margin:0px;
                            padding:0px;
                            box-sizing:border-box;
                        }
                        ${style || ''}
                    </style>
                    <title>Document</title>
                </head>
                <body>
                    <div id="doc">
                        <div id="doc__header">
                            <div id="doc__header__left">${header.left || ''}</div>    
                            <div id="doc__header__right">${header.right || ''}</div>     
                        </div>
                        <div id="doc__main">
                            <div id="doc__main__top">${main.top || ''}</div>
                            <div id="doc__main__bottom">${main.bottom || ''}</div>
                        </div>
                        <div id="doc__bottom">
                            <div id="doc__bottom__left">${bottom.left || ''}</div>
                            <div id="doc__bottom__right">${bottom.right || ''}</div>
                        </div>
                    </div>
                </body>
        </html>
        `
    )
}