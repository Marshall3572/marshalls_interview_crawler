#!/usr/bin/env node

const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const {prompt} = require('enquirer')
const http = require('http')
const handler = require('serve-handler')
const open = require('open')

async function start() {
    let result = {}

    let response = await prompt({
        type: 'input',
        name: 'count',
        message: '请输入想要面经的份数',
        initial: 30
    })
    result.count = parseInt(response.count)

    response = await prompt({
        type: 'input',
        name: 'job',
        message: '请输入你感兴趣的岗位方向',
        // choices: ['前端', 'Java', '后端', '测试', '产品经理', 'UI']
    })
    Object.assign(result, response)

    response = await prompt({
        type: 'input',
        name: 'company',
        message: '请输入你感兴趣的公司',
        // choices: ['阿里巴巴', '字节跳动', '腾讯', '拼多多', '百度', '华为']
    })
    Object.assign(result, response)
    console.log(result)
// ，将按相关度从高到底推送
    let page = 1
    let count = 0  //已经下载的数量
    let urls = []

    do {
        let url = `https://www.nowcoder.com/search?type=post&order=create&query=${result.company}+${result.job}&subType=2&tagId=&page=${page}`
        // console.log(url)
        console.log(`正在为您寻找最符合要求的${result.count}面经`)
        let res = await fetch(url)
        let body = await res.text()
        urls = body.match(/\/discuss\/\d+\?.+?"/g) || []
        urls = urls.map(text => `https://www.nowcoder.com${text.replace('"', '')}`)
        for (let i = 0; i < urls.length; i++) {
            console.log(`已推荐${i+1}篇`)
            fs.writeFileSync(path.join(process.cwd() + '/articles', `${result.job}_${result.company}_${count}.html`), body, 'utf-8')
            count++
            if (count >= result.count) break
            await new Promise(resolve => setTimeout(resolve, 200))
        }
        page++
    } while (count < result.count && urls.length > 0)
    console.log('推荐完毕，将自动跳转服务器预览地址')
    await new Promise(resolve => setTimeout(resolve, 2000))
    http.createServer(async (req, res) => {
        await handler(req, res)
    }).listen(3000, async () => {
        await open('http://localhost:3000/articles')
    })
    console.log('打开http://localhost:3000/articles')
}

start()

