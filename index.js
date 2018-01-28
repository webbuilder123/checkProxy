const request = require('request')
const cheerio = require('cheerio')
const app = require('express')()
const url = require('url')
app.set("view engine", "ejs")
app.get('/', (req, res) => {
    const query = url.parse(req.url, true).query
    console.log(query)
    const len = parseInt(query.l) || 30
    const start = parseInt(query.s) || 0
    const timeout = parseInt(query.t) || 2000
    request('https://www.proxy.org/', (e, r, b) => {
        if (e) throw e
        if (!e && r.statusCode === 200) {
            let arr = []
            let good = []
            let completed = []
            const $ = cheerio.load(b)
            $('tbody tr').each((i, el) => {
                if (i < (len + start + 1) && i > start)
                    arr.push([$($(el).find('td')[0]).text(), $($(el).find('td')[1]).text()])
            }
            )
            arr.forEach((el, i) => {
                try {
                    request({
                        'url': 'http://yandex.ru',
                        'proxy': `http://${el[0]}:${el[1]}`,
                        timeout
                    }, (error, response, body) => {
                        completed.push(i)
                        if (body && body.length > 10000)
                            good.push([[`${el[0]}`], [`${el[1]}`]])
                        if (arr.length == completed.length) {
                            if (good.length > 0)
                                res.render('index', { good })
                            else
                                res.send('')
                        }
                    })
                }
                catch (e) {
                    console.log(e)
                    completed.push(i)
                }
            })
        }

    })
})

app.listen(process.env.PORT || 5000, _ => console.log('started'))
