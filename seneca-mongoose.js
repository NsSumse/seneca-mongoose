const senecaGenerator = require('seneca-generator');

module.exports = mongoosePlugin;

function mongoosePlugin (options) {
    if(!this.addAsync){
        senecaGenerator(this);
    }
    var pluginName = 'mongoosePlugin', map, mongoose = options.mongoose;

    this.add({init: pluginName}, function (args, done) {

        mongoose.connect(options.dbURI);
        mongoose.connection.on('connected', function () {
            console.log('Mongoose default connection open to ' + options.dbURI);
            done();
        });

        mongoose.connection.on('error', function (err) {
            console.log('Mongoose default connection error: ' + err);
            done(new Error('Mongoose default connection error: ' + err))
        });

        mongoose.connection.on('disconnected', function () {
            console.log('Mongoose default connection disconnected');
            done(new Error('Mongoose default connection disconnected'))
        });

    });

    for (map in options.map) {
        this.addAsync({role: map, cmd: 'findOne', data: '*'}, function*(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.findOne(args.data).exec();
        });

        this.addAsync({role: map, cmd: 'find', data: '*'}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.find(args.data).exec();
        });

        this.addAsync({role: map, cmd: 'create', data: '*'}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.create(args.data);
        });

        this.addAsync({role: map, cmd: 'update', data: {query: '*', data: '*'}}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.update(args.data.query, args.data.data);
        });

        this.addAsync({role: map, cmd: 'findOneAndUpdate', data: {query: '*', data: '*'}}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.findOneAndUpdate(args.data.query, args.data.data, args.data.options || {});
        });

        this.addAsync({role: map, cmd: 'findOneAndRemove', data: '*'}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.findOneAndRemove(args.data);
        });

        this.addAsync({role: map, cmd: 'findByIdAndRemove', data: '*'}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.findByIdAndRemove(args.data);
        });
    }
    return pluginName;
}