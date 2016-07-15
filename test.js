var Seneca = require('seneca')();
const senecaGenerator = require('seneca-generator');
const seneca = senecaGenerator(Seneca);
var mongoose = require('mongoose');
var plugin = require('./seneca-mongoose');
var Promise = require("bluebird");
mongoose.Promise = require('bluebird');

var blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    body: String,
    comments: [{body: String, date: Date}],
    date: {type: Date, default: Date.now},
    hidden: Boolean,
    meta: {
        votes: Number,
        favs: Number
    }
});

mongoose.model('S_Artikel', blogSchema);

seneca.use(plugin, {
    dbURI: 'mongodb://localhost/ConnectionTest',
    mongoose: mongoose,
    map: {
        Artikel: 'S_Artikel'
    }
});
seneca.ready(function () {
    Promise.coroutine(function*() {

        var result = yield seneca.actAsync({role: 'Artikel', cmd: 'findByIdAndRemove'}, {data: '5789295fc302acb065a33a13'});
        console.log(result);
        result = yield seneca.actAsync({role: 'Artikel', cmd: 'find'}, {data: {}});
        console.log(result);

    })();

    console.log("ready");
});
