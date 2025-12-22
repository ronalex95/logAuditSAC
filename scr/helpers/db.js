const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        await mongoose.connect('mongodb://logsUser:log*2025Sac@192.168.1.205:27017/logs');//, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Contectado a MongoDB correctamente con logsUser');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = dbConnection;

//dbConnection(); // Conectarse a MongoDB

//saveLog('Error', 'Ocurrió un error al procesar el archivo.', { archivo: 'archivo.txt', error: 'Excepción no controlada' });