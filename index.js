const express = require('express')
const app = express();
const path = require('path')
const http = require('http').Server(app);
const PORT = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('index'))
app.get('/makeTeams', (req, res) => res.render('makeTeams'));

http.listen(PORT, () => console.log(`Listening on ${ PORT }`))


