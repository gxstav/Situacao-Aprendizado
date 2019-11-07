var app = require('./config/express')();

app.listen(3000, () => {
    console.log(`SERVER ON PORT ${app.get('PORT')}`);
});