const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const server = require(__dirname + '/config/server.js')
const mysql = require('mysql');
const bodyParser = require("body-parser");


const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "barcelona9810",
    port: 3306,
    database: "kevdb"
});

conn.connect(function(err){
    if(err){
        throw err;
    }
    console.log("conectao");
    
});
conn.query('SELECT * FROM kevdb.user', function(err, res, fields){
    if(err) throw err;
    //res.map( e => console.log(e));
    console.log("datos seleccionados");
    //console.log('La soluçao es: ' + res);
});


//settings
app.set('appName', 'My first Minecraft server');
app.set('language', 'español' );
app.set('country', 'españita');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//middlewares
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//routes
app.post('/', function (req, res) {
    res.send('POST request to homepage');
    console.log("post");
  });

//LOGIN POST
//necesita sql injection
app.post('/login', (req, res) => {
    var objRecieve = req.body.obj;
    var sql = "INSERT INTO kevdb.user (name, firstName, lastName, email, age, phone, password) VALUES ('" + objRecieve.NAME + "','" + objRecieve.FIRSTNAME + "','" + objRecieve.LASTNAME +"','" + objRecieve.EMAIL +"','"+ objRecieve.AGE +"','" + objRecieve.PHONE +"','"+ objRecieve.PASSWORD+ "')";
    conn.query(sql, function (err, result) {
        if (err) throw err;
        console.log("record inserted" + result.insertId);
    });
    res.status(200).json({
        message: 'success!',
    })
});

app.post('/route', function(req, res){
    //res.send('Route has been send successfully!!!');
    console.log("ROUTE origin lat: "+ req.body.OR_latitude + '--  long: ' + req.body.OR_longitude);
    console.log("ROUTE desti lat: "+ req.body.DT_latitude + '--  long: ' + req.body.DT_longitude);
    res.status(200).json({
        message: 'Route has been send successfully!!!',
    })
});

app.listen(3000, ()=> {
    console.log("Functional server");
    console.log("App name: "+ app.get('appName'));
    console.log("App language: "+ app.get('language'));
    console.log("App country: "+ app.get('country'));
});
