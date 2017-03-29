var db = require('../db_config.js');

exports.list = function(callback) {

    db.Rated.find({}, function(error, ratedList) {

        if(error) {
            callback({error: 'Não foi possível retornar as avaliações'});
        } else {
            callback(ratedList);
        }
    });
};

exports.rating = function(userId, bookId, callback) {

    db.Rated.findOne({userId: userId, bookId: bookId}, function(error, rated) {

        if(error) {
            callback({error: 'Não foi possível retornar a avaliação'});
        } else {
            callback(rated);
        }
    });
};

exports.listByUserId = function(userId, callback) {

    db.Rated.find({userId : userId}, function(error, ratedList) {

        if(error) {
            callback({error: 'Não foi possível retornar as avaliações'});
        } else {
            callback(ratedList);
        }
    });
};

exports.listByBookId = function(bookId, callback) {

    db.Rated.find({bookId : bookId}, function(error, ratedList) {

        if(error) {
            callback({error: 'Não foi possível retornar as avaliações'});
        } else {
            callback(ratedList);
        }
    });
};

exports.save = function(userId, userName, bookId, rating, commentary, callback) {

    new db.Rated({
        'userId': userId,
        'userName': userName,
        'bookId': bookId,
        'rating': rating,
        'commentary': commentary
    }).save(function(error, rated) {

        if(error) {
            callback({error: 'Não foi possível salvar a avaliação'});
        } else {
            callback(rated);
        }
    });
};

exports.update = function(userId, bookId, rating, commentary, callback) {

    db.Rated.findOne({userId: userId, bookId: bookId}, function(error, rated) {

        if(error || isNaN(rating)) {
            callback({error: 'Não foi possível editar a avaliação'});
        } else {

            rated.rating = rating;
            rated.commentary = commentary;

            rated.save(function(error, rated) {

                if(error) {
                    callback({error: 'Não foi possível editar a avaliação'});
                } else {
                    callback(rated);
                }
            });
        }
    });
};

exports.delete = function(userId, bookId, callback) {

    db.Rated.findOne({userId: userId, bookId: bookId}, function(error, rated) {

        if(error) {
            callback({error: error});
        } else {

            rated.remove(function(error) {

                if(error) {
                    callback({error: 'Não foi possível excluir a avaliação'});
                } else {
                    callback({response: 'Avaliação excluida com sucesso'});
                }
            });
        }
    });
};