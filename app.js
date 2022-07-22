if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const path = require('path')
const express = require('express')
const Handlebars = require('handlebars')
const { pages, apis } = require('./routes')

const handlebars = require('express-handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const flash = require('connect-flash')
const session = require('express-session')
const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'secret'
const passport = require('./config/passport')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const { getUser } = require('./helpers/auth-helpers')

const methodOverride = require('method-override')
app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers, handlebars: allowInsecurePrototypeAccess(Handlebars) }))
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize()) // 增加這行，初始化 Passport
app.use(passport.session()) // 增加這行，啟動 session 功能
app.use(flash())
app.use(methodOverride('_method'))
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages') // 設定 success_msg 訊息
  res.locals.error_messages = req.flash('error_messages') // 設定 warning_msg 訊息
  res.locals.user = getUser(req)
  res.locals.currentUser = getUser(req)
  next()
})
app.use('/api', apis)
app.use(pages)
app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
