var express = require('express')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

var mongoose = require('mongoose')
const { db } = require('./config.js')

mongoose.Promise = global.Promise

var app = express()

mongoose.connect(`mongodb://${db.user}:${db.password}@ds135486.mlab.com:35486/${db.name}`, { useMongoClient: true })
	.then(function (info) {
		console.log("Conexion MongoDB mlab exitosa...")

	}).catch(function (error) {
		console.log("Error MongoDB mlab", error)

	})

// view engine setup
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

app.use((req, res, next) => {

	if (req.headers['content-type'])
		res.set('Content-Type', req.headers['content-type'])

	var date = new Date()
	var secs = 60*30

	res.set('Cache-Control', `private, max-age=${secs}`)
	res.set('Date', date.toUTCString())

	date.setSeconds(date.getSeconds() + secs)

	res.set('Expires', date.toUTCString())

	next()
})

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(favicon(`${__dirname}/public/images/favicon.ico`))
app.use(cookieParser())
app.use(express.static(__dirname + '/public'))

app.use('/', require('./routes/index'))
app.use('/', require('./routes/dbtest'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found')
	err.status = 404
	next(err)
})

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})


module.exports = app