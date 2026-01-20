
const mongoose = require('mongoose');

const additionalDataSchema = new mongoose.Schema({
  Accion: { type: Number },
  AccionDescripcion: { type: String },
  Resultado: { type: String },
  ReferidoAccion: { type: String },
  NombreProceso: { type: String },
  IdRegistroRef: { type: Number },
  CuentaConsultaRef: { type: String },
  NombrePersonaRef: { type: String },
  AdicionalRegistro: { type: String },
  IdTipoProducto: { type: String },
  MensajeJson: { type: mongoose.Schema.Types.Mixed }, // puede ser objeto o string
  AdicionalDecimal: { type: mongoose.Schema.Types.Mixed }, // puede ser null o número
  FechaSistema: { type: String },
  FechaProceso: { type: Date }
}, { _id: false });


const logSchema = new mongoose.Schema({
  user: { type: String, required: true },
  ip: { type: String },
  timestamp: { type: Date },
  level: { type: String },
  message: { type: String },
  additionalData: additionalDataSchema,
  diferenciasMensajeJson: { type: mongoose.Schema.Types.Mixed } // opcional para guardar diferencias
});

/*
logSchema.pre('save', function (next) {
    if (!this.timestamp) {
        this.timestamp = Date.now();
    }
    next();
});
*/
module.exports = mongoose.model('logs', logSchema);