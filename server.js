const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB)
    .then(con => {
        console.log("CONNECTED TO DATABASE");
    }).catch(error => {
        console.log('err', error);
    });


const port = 3000;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
