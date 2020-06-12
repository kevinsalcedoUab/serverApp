const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql');
const bodyParser = require("body-parser");
const socket = require('socket.io')
const _ = require('lodash');

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


//DATABASE FUNCTIONS
function updateData(id, value){
    var sql;
    if(value==null){
        sql = "UPDATE kevdb.user SET listFriends = (NULL) WHERE iduser = " + id ;
    }else{
        sql = "UPDATE kevdb.user SET listFriends = '" + value + "'WHERE iduser = " + id ;
    }
    conn.query(sql, function (err, res) {
        if (err) throw err;
        console.log("insert was successfull" + res.insertId);
    });
};

function updateMembersGroup(id, value){
    var sql;
    if(value==null){
        sql = "UPDATE kevdb.group SET listMembers = (NULL) WHERE idGroup = " + id ;
    }else{
        sql = "UPDATE kevdb.group SET listMembers = '" + value + "'WHERE idGroup = " + id ;
    }
    conn.query(sql, function (err, res) {
        if (err) throw err;
        console.log("update ListMembers was successful" + res.insertId);
    });
};

function selectListFriends(id, resolve){
    var sql = "SELECT listFriends FROM kevdb.user WHERE  iduser = ('"+ id +"')";
    conn.query(sql, function (err, res) {
        if (err) throw err;
        let result = JSON.stringify(res);
        let json = JSON.parse(result);
        console.log('ListFriends of ' + id + ' : ', json[0].listFriends);
        resolve(json[0].listFriends);
    });
};

function selectListMembers(idGroup, resolve){
    var sql = "SELECT listMembers FROM kevdb.group WHERE  idGroup = ('"+ idGroup +"')";
    conn.query(sql, function (err, res) {
        if (err) throw err;
        let result = JSON.stringify(res);
        let json = JSON.parse(result);
        console.log('ListMembers of ' + idGroup + ' : ', json[0].listMembers);
        resolve(json[0].listMembers);
    });
};

function createGroup(arrID, arrRoute, idMaster, resolve){
    var sql = "INSERT INTO kevdb.group (nMembers, listMembers, route, idMaster) VALUES ('1', '" + arrID + "', '" + arrRoute + "', '" + idMaster + "')";
    conn.query(sql, function (err, res) {
        if (err) throw err;
        //console.log("insert was successfull" + res.insertId);
        resolve("exito");
    });
};

//function that update the "idGroup" of idUser
function updateGrouptoUser(idUser, idGroup){
    var sql = "UPDATE kevdb.user SET idGroup = '" + idGroup + "'WHERE iduser = " + idUser ;
    conn.query(sql, function (err, res) {
        if (err) throw err;
        console.log("insert was successfull" + res.insertId);
    });
};

//function that update the "idGroup" of idUser to null
function updateUserGrouptoNull(idUser){
    var sql = "UPDATE kevdb.user SET idGroup = (NULL) WHERE iduser = " + idUser ;
    conn.query(sql, function (err, res) {
        if (err) throw err;
        console.log("insert was successfull" + res.insertId);
    });
};

//function that select and return a group using the idMaster(creator), also update the "idGroup" of idMaster
function selectGroupbyMaster(idMaster, res){
    var sql = "SELECT idGroup, nMembers, listMembers, route FROM kevdb.group WHERE  idMaster = ('" + idMaster + "')";
    conn.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Select Group by idMaster Succesfull");
        let result2 = JSON.stringify(result);
        let json = JSON.parse(result2);
        updateGrouptoUser(idMaster, json[0].idGroup);
        res.status(200).json({
            json
        })
    });
};

function selectGroupbyID(idGroup, res){
    var sql = "SELECT idGroup, nMembers, listMembers, route, idMaster FROM kevdb.group WHERE  idGroup = ('" + idGroup + "')";
    conn.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Select Group by idMaster Succesfull");
        let result2 = JSON.stringify(result);
        let json = JSON.parse(result2);
        res.status(200).json({
            json
        })
    });
};


//LOGIN POST
//necesita sql injection
app.post('/register', (req, res) => {
    var objRecieve = req.body.obj;
    var sql = "INSERT INTO kevdb.user (name, firstName, lastName, email, age, phone, password, type) VALUES ('" + objRecieve.NAME + "','" + objRecieve.FIRSTNAME + "','" + objRecieve.LASTNAME +"','" + objRecieve.EMAIL +"','"+ objRecieve.AGE +"','" + objRecieve.PHONE +"','"+ objRecieve.PASSWORD+ "','Client')";
    conn.query(sql, function (err, result) {
        if (err) throw err;
        console.log("record inserted" + result.insertId);
    });
    res.status(200).json({
        message: 'success!',
    })
});

app.post('/login', function (req, res) {
    var objRecieve = req.body.obj;
    var sql = "SELECT iduser, name, firstName, lastName, email, age, phone, password, type, listFriends, idGroup FROM kevdb.user WHERE  email = ('"+objRecieve.EMAIL +"')";
    conn.query(sql, function (err, result) {
        if (err){
            console.log('err: ', err);
            res.status(500).json({
                message: 'Something has gone wrong :(',
            })
        }else{
            console.log(req.body.obj);
            console.log('res: ', result);
            res.status(200).json(result);
        }
    });
});

app.post('/group', function (req, res) {
    console.log("GROUP -- ID: "+req.body.ID + " IDGROUP: " + req.body.IDGROUP);
    selectGroupbyID(req.body.IDGROUP, res);
    //res.status(200).json({message: 'SERVER GROUP good!!'});
});

app.post('/route', function(req, res){
    console.log("ID leader group: "+ req.body.ID + ' --  NAMe: ' + req.body.NAME);
    console.log("ROUTE origin lat: "+ req.body.OR_latitude + ' --  long: ' + req.body.OR_longitude);
    console.log("ROUTE desti lat: "+ req.body.DT_latitude + ' --  long: ' + req.body.DT_longitude);
    var arrRoute = [];
    arrRoute[0] = req.body.OR_latitude;
    arrRoute[1] = req.body.OR_longitude;
    arrRoute[2] = req.body.DT_latitude;
    arrRoute[3] = req.body.DT_longitude;
    jsonRoute = JSON.stringify(arrRoute);
    var arrID = []
    var objClient = {'id': req.body.ID, 'name': req.body.NAME}
    arrID.push(objClient)
    jsonID = JSON.stringify(arrID);

    var p1 = new Promise((resolve, reject)=>{
        createGroup(jsonID, jsonRoute, req.body.ID, resolve);
    });
    Promise.all([p1]).then((values)=>{
            selectGroupbyMaster(req.body.ID, res);
        }
    );
    
});

var server = app.listen(3000, ()=> {
    console.log("App name: "+ app.get('appName'));
    console.log("App language: "+ app.get('language'));
    console.log("App country: "+ app.get('country'));
});

var io = socket(server);
var clients = {};

function findObjinArrayy(array, obj){
    var found = false;
    for(var i = 0; i < array.length; i++) {
        if (array[i].id == obj.id) {
                found = true;
                break;
        }
    }
    return found; 
}

io.sockets.on('connection', newConnection);

function newConnection(socket){
    console.log("new connection: "+socket.id);
    console.log("query: " + socket.handshake.query.userClient);
    var idClient = socket.handshake.query.userClient;
    clients = Object.assign(clients, {[idClient]: socket.id})
    console.log("clients: ", clients);
    
    //EVENTS
    //chat
    socket.on("chat message", (data) => {
        console.log('mensaje:' + data.msg + ' From:' + idClient + ' To:' +data.idSend);
        io.to(clients[data.idSend]).emit("chat message", data.msg);
    });

    //friend
    socket.on("add friend", (data) => {
        console.log('add friend: User to add: ' + data.msg + ' From: ' + data.ID + ' Name: ' + data.NAME);
        var sql = "SELECT iduser FROM kevdb.user WHERE  name = ('"+ data.msg +"')";
        conn.query(sql, function (err, result) {
            if (err){
                console.log('err: ', err);
            }else{
                if(result.length==0){
                    console.log("add friend: Request has get empty");
                    //respuesta al emisor
                    io.to(clients[data.ID]).emit("add friend", 'Introduce a valid username');
                }else{
                    let res = JSON.stringify(result);
                    let json = JSON.parse(res);
                    console.log('add friend: To: ', json[0].iduser);
                    //msg al emisor y user al receptor
                    io.to(clients[data.ID]).emit("add friend", 'The request has been sent successfully');
                    //io.to(clients[json[0].iduser]).emit("request friend", {'nameT': data.NAME, 'idT': data.ID});
                    io.to(clients[json[0].iduser]).emit("request friend", {'nameT': data.NAME, 'idT': data.ID});
                }
            }
        });
    });

    socket.on("request friend", (data)=>{
        if(data.msg=='YES'){
            console.log(data);
            console.log('request friend: Reciever ' + data.TRANSMITTER + ' has response YES!');
            //RESPONSE FRIEND
            //TO RECEIVER 
            io.to(clients[data.ID]).emit("response friend", {'receiver': true, 'transmitter': false, 'msg': ''});
            //TO TRANSMITTER
            io.to(clients[data.IDTRANSMITTER]).emit("response friend", {'receiver': false, 'transmitter': true, 'msg': 'Receiver has response YES'});
            //GET ACTUAL LIST 
            var p1 = new Promise((resolve, reject)=>{
                selectListFriends(data.IDTRANSMITTER, resolve)
            });
            var p2 = new Promise((resolve, reject)=>{
                selectListFriends(data.ID, resolve);
            });
            Promise.all([p1,p2]).then((values)=>{
                console.log("values: ",values)
                //SAVE NEW FRIEND IN BOTH CLIENTS INTO DB
                var arrayTransmitter = [];
                var arrayReceiver = [];
                if(values[0]!=null){
                    let f = JSON.parse(values[0]);
                    arrayTransmitter = f;
                }
                if(values[1]!=null){
                    let f = JSON.parse(values[1]);
                    arrayReceiver = f;
                }
                var objT = {'id': data.ID, 'name': data.NAME};
                var objR = {'id': data.IDTRANSMITTER, 'name': data.TRANSMITTER};
                var found1 = findObjinArrayy(arrayTransmitter, objT);
                var found2 = findObjinArrayy(arrayReceiver, objR);
                if(!found1){
                    arrayTransmitter.push(objT);
                }
                if(!found2){
                    arrayReceiver.push(objR);    
                }
                var jsonTransmitter = JSON.stringify(arrayTransmitter);
                console.log("JSON TRANS: ", jsonTransmitter);
                io.to(clients[data.IDTRANSMITTER]).emit("update LFRIENDS", jsonTransmitter);
                var jsonReceiver = JSON.stringify(arrayReceiver);
                console.log("JSON RECE: ", jsonReceiver);
                io.to(clients[data.ID]).emit("update LFRIENDS", jsonReceiver);
                updateData(data.IDTRANSMITTER, jsonTransmitter);
                updateData(data.ID, jsonReceiver);
            });

        }else{
            console.log('request friend: Transmitter ' + data.TRANSMITTER + ' has response NO!');
            //RESPONSE FRIEND
            //TO RECEIVER
            io.to(clients[data.ID]).emit("response friend", {'receiver': true, 'transmitter': false, 'msg': ''});
            //TO TRANSMITTER
            io.to(clients[data.IDTRANSMITTER]).emit("response friend", {'receiver': false, 'transmitter': true, 'msg': 'Receiver has response NO'});
        }
    });

    socket.on("delete friend", (data) =>{
        console.log("delete friend: ", data);
        console.log("delete friend: ", typeof(data.NEWLFRIENDS));
        if(data.NEWLFRIENDS==0){
            data.NEWLFRIENDS = null;
            updateData(data.ID, data.NEWLFRIENDS);
        }else{
            let jsonTransmitter = JSON.stringify(data.NEWLFRIENDS);
            updateData(data.ID, jsonTransmitter);
        }
        var p1 = new Promise((resolve, reject)=>{
            selectListFriends(data.IDFRIEND, resolve);
        });
        Promise.all([p1]).then((values)=>{
            var arr =JSON.parse(values[0]);
            arr = _.reject(arr, function(el) { return el.id === data.ID; });
            io.to(clients[data.IDFRIEND]).emit("update LFRIENDS", JSON.stringify(arr));
            if(arr==0){
                arr = null;
                updateData(data.IDFRIEND, arr);
            }else{
                let jsonReceiver = JSON.stringify(arr);
                updateData(data.IDFRIEND, jsonReceiver);
            }
        });
    });

    //group

    socket.on("add member", (data) => {
        console.log('add member: User to add: ' + data.newMember + ' From: ' + data.ID + ' Name: ' + data.NAME);
        var sql = "SELECT iduser FROM kevdb.user WHERE  name = ('"+ data.newMember +"')";
        conn.query(sql, function (err, result) {
            if (err){
                console.log('err: ', err);
            }else{
                if(result.length==0){
                    console.log("add member: Request has get empty");
                    //respuesta al emisor
                    io.to(clients[data.ID]).emit("add friend", 'Introduce a valid username');
                }else{
                    let res = JSON.stringify(result);
                    let json = JSON.parse(res);
                    console.log('add member: To: ', json[0].iduser);
                    //msg al emisor y user al receptor
                    io.to(clients[data.ID]).emit("add member", 'The request has been sent successfully');
                    //io.to(clients[json[0].iduser]).emit("request friend", {'nameT': data.NAME, 'idT': data.ID});
                    io.to(clients[json[0].iduser]).emit("request member", {'nameT': data.NAME, 'idT': data.ID, 'group': data.IDGROUP, 'route': data.ROUTE});
                }
            }
        });
    });

    socket.on("request member", (data)=>{
        if(data.msg=='YES'){
            console.log(data);
            console.log('request member: Reciever ' + data.ID + ' has response YES!');
            //RESPONSE FRIEND
            //TO RECEIVER 
            io.to(clients[data.ID]).emit("response member", {'receiver': true, 'transmitter': false, 'msg': ''});
            //TO TRANSMITTER
            io.to(clients[data.IDTRANSMITTER]).emit("response member", {'receiver': false, 'transmitter': true, 'msg': 'Receiver has response YES'});
            //GET ACTUAL LIST 
            var p1 = new Promise((resolve, reject)=>{
                selectListMembers(data.GROUP, resolve)
            });
            Promise.all([p1]).then((values)=>{
                console.log("values: ",values)
        
                var arrayGroup = [];
                if(values[0]!=null){
                    let f = JSON.parse(values[0]);
                    arrayGroup = f;
                }
                var objGroup = {'id': data.ID, 'name': data.NAME};  
                var found = findObjinArrayy(arrayGroup, objGroup);
                if(!found){
                    arrayGroup.push(objGroup);
                }
                var jsonGroup = JSON.stringify(arrayGroup);
                console.log("JSON Group: ", jsonGroup);
                io.to(clients[data.IDTRANSMITTER]).emit("update LMEMBERS", jsonGroup);
                io.to(clients[data.ID]).emit("update LMEMBERS2", {'idGroup': data.GROUP,'lMembers': jsonGroup, 'route': data.ROUTE});
                updateMembersGroup(data.GROUP, jsonGroup);
                updateGrouptoUser(data.ID, data.GROUP);
            });

        }else{
            console.log('request member: Transmitter ' + data.TRANSMITTER + ' has response NO!');
            //RESPONSE FRIEND
            //TO RECEIVER
            io.to(clients[data.ID]).emit("response member", {'receiver': true, 'transmitter': false, 'msg': ''});
            //TO TRANSMITTER
            io.to(clients[data.IDTRANSMITTER]).emit("response member", {'receiver': false, 'transmitter': true, 'msg': 'Receiver has response NO'});
        }
    });

    socket.on("delete member", (data) =>{
        console.log("delete member: ", data);
        if(data.NEWLMEMBER==0){
            data.NEWLMEMBER = null;
            updateMembersGroup(data.IDGROUP, data.NEWLMEMBER);
        }else{
            let jsonGroup = JSON.stringify(data.NEWLMEMBER);
            updateMembersGroup(data.IDGROUP, jsonGroup);
        }
        io.to(clients[data.IDMEMBER]).emit("update LMEMBERS", JSON.stringify(data.NEWLMEMBER));
        updateUserGrouptoNull(data.IDMEMBER);
        /*
        var p1 = new Promise((resolve, reject)=>{
            selectListFriends(data.IDMEMBER, resolve);
        });
        Promise.all([p1]).then((values)=>{
            var arr =JSON.parse(values[0]);
            arr = _.reject(arr, function(el) { return el.id === data.ID; });
            io.to(clients[data.IDMEMBER]).emit("update LMEMBERS", JSON.stringify(arr));
            if(arr==0){
                arr = null;
                updateData(data.IDMEMBER, arr);
            }else{
                let jsonReceiver = JSON.stringify(arr);
                updateData(data.IDMEMBER, jsonReceiver);
            }
        });*/
    });
};