//C:\\Users\\Jessy\\source\\repos\\accessibility-backend\\src\\server.js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});