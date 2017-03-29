var db = require('../db_config.js');

exports.list = function(callback) {

    db.Desired.find({}, function(error, desireds) {

        if(error) {
            callback({error: 'Não foi possível retornar os desejados'});
        } else {

            callback(desireds);
        }
    });
};

exports.desired = function(userId, bookId, callback) {

    db.Desired.findOne({userId: userId, bookId: bookId}, function(error, desired) {

        if(error) {
            callback({error: 'Não foi possível retornar o desejado'});
        } else {
            callback(desired);
        }
    });
};

exports.listByUser = function(userId, callback) {

    db.Desired.find({userId: userId}, function(error, desireds) {

        if(error) {
            callback({error: 'Não foi possível retornar os desejados do usuário'});
        } else {
            callback(desireds);
        }
    });
};

exports.save = function(userId, bookId, callback) {

    new db.Desired({
        'userId': userId,
        'bookId': bookId
    }).save(function(error, desired) {

        if(error) {
            callback({error: 'Não foi possível salvar o desejado'});
        } else {
            callback(desired);
        }
    });
};

exports.delete = function(userId, bookId, callback) {

    db.Desired.findOne({userId: userId, bookId: bookId}, function(error, desired) {

        if(error) {
            callback({error: 'Não foi possível excluir o desejado'});
        } else {

            desired.remove(function(error) {

                if(!error) {
                    callback({response: 'Desejado excluido com sucesso'});
                }
            });
        }
    });
};