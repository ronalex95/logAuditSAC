const express = require('express');
const Log = require('../models/logs');
const moment = require('moment-timezone');
const router = express.Router();

//cargar Log 
router.post('/logs', async (req, res) => 
{

 try {
    // Parsear el JSON anidado en message
    const parsedMessage = JSON.parse(req.body.message);
    //ASignar la fecha -5 a la region ya que muestra la fecha con +5 horas
    const timestamp = parsedMessage.timestamp ? moment(parsedMessage.timestamp).toDate() : moment().tz('America/Bogota').toDate();
    logData = {
        user: parsedMessage.user,
        ip: parsedMessage.ip,
        level: parsedMessage.level,
        timestamp:timestamp,
        message: parsedMessage.message,
        additionalData: parsedMessage.additionalData
              };
    } 
    catch (error) 
    {
    console.error('Error al parsear JSON:', error);
    return res.status(400).json({ message: 'Error al parsear JSON del log' });
    }

    //console.info('logData:', logData); // Para depuración
    //const localTimestamp = moment().tz('America/Bogota').toDate();
    const newLog =  Log(logData);
    //  console.log(localTimestamp);
    //  newLog.timestamp = localTimestamp;
    
    try 
    {
        await newLog.save();
        const savedLogId = newLog._id;
        console.log('('+savedLogId+'):'+newLog.level+' '+ newLog.user+'-'+newLog.additionalData.NombreProceso+'-'+newLog.additionalData.FechaProceso);
        res.status(201).json(
            { message: 'Log guardado',
                id: savedLogId
            });
    } 
    catch (error) 
    {
      console.error('Error al guardar Log :', error);
      res.status(500).json(
            { message: 'Error al guardar',
                id:0
            });
    }
    
});



//obtener logs 
router.post('/logs/user', async (req, res) => {
    try 
    {
      const { user } = req.body;    
      if (!user || typeof user !== 'string') 
      {
        return res.status(400).json({ message: 'Usuario Invalido' });
      }
      const query = { user: user }; 
      const logsByUser = await Log.find(query);
      res.status(200).json(logsByUser);
    } catch (error) 
    {
        console.error('Error al buscar Log :', error);
        res.status(500).json(
            { message: 'Error al buscar Log',
                id: 0
            });
    }
});


// Obtener logs por usuario y fecha
router.post('/logs/userDate', async (req, res) => {
    try 
    {
      const { user, startDate, endDate } = req.body;
  
      if (!user || typeof user !== 'string') 
      {
        return res.status(400).json({ message: 'Usuario Invalido' });
      }
      const query = 
      {
        user: user,
        "additionalData.FechaProceso": {
            $gt: (startDate),
            $lt: (endDate)
        }
      };
    const logsByUser = await Log.find(query, {
        "additionalData.Resultado": 1,
        "additionalData.IdTipoProducto": 1,
        "additionalData.AccionDescripcion": 1,
        "additionalData.AdicionalRegistro": 1,
        "additionalData.NombrePersonaRef": 1,
        "additionalData.IdRegistroRef": 1,
        "additionalData.CuentaConsultaRef": 1,
        "additionalData.FechaProceso": 1,
        "additionalData.FechaSistema": 1,
        "additionalData.ReferidoAccion": 1,
        "additionalData.NombreProceso": 1,
        "additionalData.ResultadoNombrePersonaRef": 1
    }).sort({ "additionalData.FechaProceso": -1 }); // Ordenar por FechaProceso descendente
      res.status(200).json(logsByUser);
    } catch (error) {
      console.error('Error al buscar Log :', error);
      res.status(500).json({
        message: 'Error al buscar Log',
        id: 0,
      });
    }
  });


  //Conuslta de fecha y tipo
  router.post('/logs/userDate', async (req, res) => {
    try {
      const { user, startDate, endDate } = req.body;
  
      if (!user || typeof user !== 'string') {
        return res.status(400).json({ message: 'Usuario Invalido' });
      }
  
      const query = {
        user: user,
        "additionalData.FechaProceso": {
            $gt: (startDate),
            $lt: (endDate)
        }
    }; 
    const logsByUser = await Log.find(query, {
        user: 1,
        "additionalData.AccionDescripcion": 1,
        "additionalData.AdicionalRegistro": 1,
        "additionalData.NombrePersonaRef": 1,
        "additionalData.IdRegistroRef": 1,
        "additionalData.CuentaConsultaRef": 1,
        "additionalData.FechaProceso": 1,
        "additionalData.FechaSistema": 1,
        "additionalData.ReferidoAccion": 1,
        "additionalData.NombreProceso": 1,
        "additionalData.ResultadoNombrePersonaRef": 1
    }).sort({ "additionalData.FechaProceso": -1 }); // Ordenar por FechaProceso descendente
      
  console.log(logsByUser);
      res.status(200).json(logsByUser);
    } catch (error) {
      console.error('Error al buscar Log :', error);
      res.status(500).json({
        message: 'Error al buscar Log',
        id: 0,
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