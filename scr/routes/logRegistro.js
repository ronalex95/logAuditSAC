const express = require('express');
const Log = require('../models/logs');
const moment = require('moment-timezone');
const router = express.Router();

//cargar Log 
router.post('/logs', async (req, res) => {

   // console.info((req.body.message));
  
 try {
    // Parsear el JSON anidado en message
    const parsedMessage = JSON.parse(req.body.message);

    const timestamp = parsedMessage.timestamp ? moment(parsedMessage.timestamp).toDate() : moment().tz('America/Bogota').toDate();

    //console.log(timestamp);
    logData = {
        user: parsedMessage.user,
        ip: parsedMessage.ip,
        level: parsedMessage.level,
        timestamp:timestamp,
        message: parsedMessage.message,
        additionalData: parsedMessage.additionalData
    };
} catch (error) {
    console.error('Error al parsear JSON:', error);
    return res.status(400).json({ message: 'Error al parsear JSON del log' });
}

//console.info('logData:', logData); // Para depuración
//const localTimestamp = moment().tz('America/Bogota').toDate();
    const newLog =  Log(logData);
  //  console.log(localTimestamp);
  //  newLog.timestamp = localTimestamp;
    
    try {
        await newLog.save();
        const savedLogId = newLog._id;
        console.log(newLog);
        res.status(201).json(
            { message: 'Log guardado correctamente',
                id: savedLogId
            });
    } catch (error) {
        console.error('Error al guardar Log :', error);
        res.status(500).json(
            { message: 'Error al guardar Log',
                id:0
            });
    }
    
});



//obtener logs 
router.post('/logs/user', async (req, res) => {
    try {
        const { user } = req.body;
     //   console.info(req);
    if (!user || typeof user !== 'string') {
        return res.status(400).json({ message: 'Usuario Invalido' });
      }

      const query = { user: user }; 
      const logsByUser = await Log.find(query);
    res.status(200).json(logsByUser);
    } catch (error) {
        console.error('Error al buscar Log :', error);
        res.status(500).json(
            { message: 'Error al buscar Log',
                id: 0
            });
    }
});


//Obtener todos los Logs
router.get('/Alllogs', async (req, res) => {
    try {
        const allLogs =  await Log.find();       
        res.status(200).json(
            allLogs);
    } catch (error) {
        console.error('Error al guardar Log :', error);
        res.status(500).json(
            { message: 'Error al guardar Log',
                id:0
            });
    }
});

module.exports = router;