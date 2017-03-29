var db = require('../db_config.js');

exports.list = function(callback) {

    db.Subject.find({}, function(error, subjects) {

        if(error) {
            callback({error: 'Não foi possível retornar as disciplinas'});
        } else {
            callback(subjects);
        }
    });
};

exports.listByCourse = function(course, callback) {

    db.Subject.find({course : course}, function(error, subjects) {

        if(error) {
            callback({error: 'Não foi possível retornar as disciplinas'});
        } else {
            callback(subjects);
        }
    });
};

exports.listsubj = function(period, course, callback) {

    db.Subject.find({period : period , course : course}, function(error, subjects) {

        if(error) {
            callback({error: 'Não foi possível retornar os alugados'});
        } else {

            callback(subjects);
        }
    });
};


exports.subject = function(name, course, callback) {

    db.Subject.findOne({name: name, course: course}, function(error, subject) {

        if(error) {
            callback({error: 'Não foi possível retornar a disciplina'});
        } else {
            callback(subject);
        }
    });
};

exports.save = function(name, period, credits, course, callback) {

    new db.Subject({
        'name': name,
        'period': period,
        'credits': credits,
        'course': course
    }).save(function(error, subject) {

        if(error) {
            callback({error: 'Não foi possível salvar a disciplina'})
        } else {
            callback(subject);
        }
    });
};

exports.update = function(name, newName, period, course, factor, callback) {

    db.Subject.findOne({name : name, course: course}, function(error, subject) {

        if(newName) {
            subject.name = newName;
        }

        if(period > 0 && period <= 8) {
            subject.period = period;
        }

        if(factor) {
            subject.numBibliographies += factor;
        }

        subject.save(function(error, subject) {

            if(error) {
                callback({error: 'Não foi possível editar a disciplina'})
            } else {
                callback(subject);
            }
        });
    });
};

exports.delete = function(name, course, callback) {

    db.Subject.findOne({name : name, course: course}, function(error, subject) {

        if(error) {
            callback({error: 'Não foi possível excluir a disciplina'});
        } else {

            subject.remove(function(error) {

                if(!error) {
                    callback({response: 'Disciplina excluída com sucesso'});
                }
            });
        }
    });
};
