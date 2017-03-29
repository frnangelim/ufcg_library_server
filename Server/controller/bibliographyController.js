var db = require('../db_config.js');

exports.list = function(callback) {

    db.Bibliography.find({}, function(error, bibliographies) {

        if(error) {
            callback({error: 'Não foi possível retornar as bibliografias'});
        } else {
            callback(bibliographies);
        }
    });
};

exports.listBySubject = function(subjectName, callback) {

    db.Bibliography.find({subjectName: subjectName}, function(error, bibliographies) {

        if (error) {
            callback({error: 'Não foi possível retornar as bibliografias da disciplina'});
        } else {
            callback(bibliographies);
        }
    });
};

exports.bibliography = function(userId, subjectName, bookId, callback) {

    db.Bibliography.findOne({userId: userId, subjectName : subjectName, bookId: bookId}, function(error, bibliography) {

        if(error) {
            callback({error: 'Não foi possível retornar a bibliografia'});
        } else {
            callback(bibliography);
        }
    });
};

exports.save = function(userId, subjectName, bookId, callback) {

    db.Bibliography.findOne({userId: userId, subjectName : subjectName, bookId: bookId},
                                            function(error, bibliography) {

        if(error || bibliography != null) {
            callback({error: 'Não foi possível salvar a bibliografia'});
        } else{

            new db.Bibliography({
                'userId': userId,
                'subjectName': subjectName,
                'bookId': bookId
            }).save(function(error, bibliography) {

                if(error) {
                    callback({error: 'Não foi possível salvar a bibliografia'});
                } else {
                    callback(bibliography);
                }
            });
        }
    });
};

exports.delete = function(userId, subjectName, bookId, callback) {

    db.Bibliography.findOne({userId: userId, subjectName : subjectName, bookId : bookId},
                                            function(error, bibliography) {

        if(error) {
            callback({error: 'Não foi possível excluir a bibliografia'});
        } else {

            bibliography.remove(function(error) {

                if(!error) {
                    callback({response: 'Bibliografia excluida com sucesso'});
                }
            });
        }
    });
};
