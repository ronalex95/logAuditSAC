const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        await mongoose.connect('mongodb://192.168.1.205:27017/logs');//, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = dbConnection;

//dbConnection(); // Conectarse a MongoDB

//saveLog('Error', 'Ocurrió un error al procesar el archivo.', { archivo: 'archivo.txt', error: 'Excepción no controlada' });