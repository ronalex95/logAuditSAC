const express = require('express');
const Log = require('../models/logs');
const moment = require('moment-timezone');
const router = express.Router();

function asegurarObjeto(json) {
    if (typeof json === 'string') {
        try {
            return JSON.parse(json);
        } catch (e) {
            console.warn('MensajeJson no es JSON válido');
            return {};
        }
    }
    return json || {};
}

function obtenerComparacion({ Accion, IdTipoProducto }) {
    if (Accion === 7) {
        if (IdTipoProducto === 'USU') {
            return { comparar: true, campo: 'additionalData.AdicionalRegistro' };
        } else {
            return { comparar: true, campo: 'additionalData.IdRegistroRef' };
        }
    }
    // Si quieres mantener también la condición de PER/9
    if (Accion === 9 && IdTipoProducto === 'PER') {
        return { comparar: true, campo: 'additionalData.AdicionalRegistro' };
    }
    return { comparar: false };
}


function compararMensajeJson(nuevo, antiguo) {
    const diferencias = {};

    const claves = new Set([...Object.keys(nuevo), ...Object.keys(antiguo)]);

    for (const clave of claves) {
        const valorNuevo = nuevo[clave];
        const valorAntiguo = antiguo[clave];

        // Si ambos son objetos, comparamos recursivamente
        if (
            typeof valorNuevo === 'object' &&
            valorNuevo !== null &&
            typeof valorAntiguo === 'object' &&
            valorAntiguo !== null
        ) {
            const subDif = compararMensajeJson(valorNuevo, valorAntiguo);
            if (Object.keys(subDif).length > 0) {
                diferencias[clave] = subDif;
            }
        } else {
            // Comparación directa
            if (JSON.stringify(valorNuevo) !== JSON.stringify(valorAntiguo)) {
                diferencias[clave] = {
                    antiguo: valorAntiguo,
                    nuevo: valorNuevo
                };
            }
        }
    }

    return diferencias;
}

//cargar Log 
router.post('/logs', async (req, res) => 
{
let logData;
 try {
        // Validación básica
        if (!req.body.message || typeof req.body.message !== 'string') {
            return res.status(400).json({ message: 'Mensaje inválido o ausente' });
        }

        const parsedMessage = JSON.parse(req.body.message);
        const timestamp = parsedMessage.timestamp
            ? moment(parsedMessage.timestamp).toDate()
            : moment.tz('America/Bogota').toDate();
        // Construcción base del log
        logData = {
            user: parsedMessage.user,
            ip: parsedMessage.ip,
            level: parsedMessage.level,
            timestamp,
            message: parsedMessage.message,
            additionalData: parsedMessage.additionalData
        };
                // 1. Guardas el valor original (string o lo que venga)
        const mensajeJsonOriginal = logData.additionalData.MensajeJson;
const mensajeJsonNuevoObj = asegurarObjeto(mensajeJsonOriginal);

const { Accion, IdTipoProducto, AdicionalRegistro, IdRegistroRef, NombreProceso } = logData.additionalData;

const regla = obtenerComparacion({ Accion, IdTipoProducto });

if (regla.comparar) {
    // Determinar valor de búsqueda según campo
    const valorBusqueda = regla.campo.endsWith('AdicionalRegistro')
        ? AdicionalRegistro
        : IdRegistroRef;

    if (valorBusqueda) {
        const logAnterior = await Log.findOne({
            [regla.campo]: valorBusqueda,
            'additionalData.NombreProceso': NombreProceso // mantener filtro por proceso
        })
        .sort({ timestamp: -1 })
        .exec();

        if (logAnterior?.additionalData?.MensajeJson) {
            const mensajeJsonAntiguoObj = asegurarObjeto(logAnterior.additionalData.MensajeJson);
            const diferencias = compararMensajeJson(mensajeJsonNuevoObj, mensajeJsonAntiguoObj);

            logData.diferenciasMensajeJson = JSON.stringify(diferencias, null, 2);
            //console.log('Diferencias encontradas:', diferencias);
        }
    }
}




// Guardar el valor original como string
logData.additionalData.MensajeJson = typeof mensajeJsonOriginal === 'string'
    ? mensajeJsonOriginal
    : JSON.stringify(mensajeJsonOriginal);
    } catch (error) {
        console.error('Error al parsear JSON:', error);
        return res.status(400).json({ message: 'Error al parsear JSON del log' });
    }

    try {
        const newLog = new Log(logData);
        await newLog.save();
        const savedLogId = newLog._id;

        const { NombreProceso = 'ProcesoDesconocido', FechaProceso = 'FechaDesconocida' } = newLog.additionalData || {};
        //console.log(`(${savedLogId}): ${newLog.level} ${newLog.user} - ${NombreProceso} - ${FechaProceso}`);

        res.status(201).json({ message: 'Log guardado', id: savedLogId });
    } catch (error) {
        console.error('Error al guardar Log:', error);
        res.status(500).json({ message: 'Error al guardar', id: 0 });
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