const express = require('express')
const router = express.Router()

router.get('/', (req,res) => {
    res.render('login')
})

router.get('/live-chat', (req,res) => {
    res.render('index')
})

 
module.exports = router