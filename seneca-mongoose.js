const senecaGenerator = require('seneca-generator');

module.exports = mongoosePlugin;

var createQuery = function (model, query) {
    if (query.skip) {
        model = model.skip(query.skip);
    }
    if (query.limit) {
        model = model.limit(query.limit);
    }
    if (query.sort) {
        model = model.sort(query.sort);
    }
    if (query.select) {
        model = model.select(query.select);
    }
    return model;
};

function mongoosePlugin(options) {
    if (!this.addAsync) {
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
        this.addAsync({role: map, cmd: 'findOne'}, function*(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.findOne(args.query || {}).exec();
        });

        this.addAsync({role: map, cmd: 'find'}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield createQuery(model.find(args.query || {}), data).exec();
        });

        this.addAsync({role: map, cmd: 'create'}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.create(args.data);
        });

        this.addAsync({role: map, cmd: 'update'}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.update(args.query, args.data);
        });

        this.addAsync({role: map, cmd: 'findOneAndUpdate'}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.findOneAndUpdate(args.query, args.data, args.options || {});
        });

        this.addAsync({role: map, cmd: 'findOneAndRemove'}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.findOneAndRemove(args.query);
        });

        this.addAsync({role: map, cmd: 'findByIdAndRemove'}, function *(args) {
            var model = mongoose.model(options.map[map]);
            return yield model.findByIdAndRemove(args.query);
        });
    }
    return pluginName;
}
