'use strict'

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const compression = require('compression')
const path = require('path')
const session = require('express-session')
const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy

// Constants
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'
const TW_CONSUMER_KEY = process.env.TW_CONSUMER_KEY || ''
const TW_CONSUMER_SECRET = process.env.TW_CONSUMER_SECRET || ''
const SESSION_SECRET = process.env.SESSION_SECRET || ''

// App
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(morgan('common'))
app.use(compression())
app.use(session({ secret: SESSION_SECRET }))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')

// Don't serve favicon
app.get('/favicon.ico', function (req, res) {
  res.status(204)
})

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TW_CONSUMER_KEY,
      consumerSecret: TW_CONSUMER_SECRET,
      callbackURL: 'https://bisiler.herokuapp.com/auth/twitter/callback'
    },
    function (token, tokenSecret, profile, done) {
      const user = {
        token: token,
        tokenSecret: tokenSecret,
        profile: profile
      }
      console.log(user)
      done(null, user)
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

// Routes
app.get('/', (req, res) => res.render('index'))
app.get('/auth/twitter', passport.authenticate('twitter'))
app.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/ok',
    failureRedirect: '/nok'
  })
)
app.get('/ok', (req, res) => res.render('ok'))
app.get('/nok', (req, res) => res.render('nok'))

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})
