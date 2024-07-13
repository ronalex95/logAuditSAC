const express =  require('express');
const bodyParser = require('body-parser');
const path = require('path');
//Inicializaciones
const Log = require('./models/logs');
const dbConnection = require('./helpers/db');
const logsRoutes  = require('./routes/logRegistro');

const app = express();
//Settings
app.set('port',process.env.PORT || 3000);
app.set('' ,path.join(__dirname,''));

//Middelwares

app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/api',logsRoutes)
//Global
dbConnection();

//Routes
app.get("/",(req,res)=>{
res.send("Welcome to my API");
});
//Server Init
app.listen(app.get('port') , () =>{
 
console.log('Sevidor en puerto ',app.get('port') );
});

