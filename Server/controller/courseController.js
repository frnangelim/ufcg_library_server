var db = require('../db_config.js');
var request = require('request');

exports.list = function(callback) {

    db.Course.find({}, function(error,course) {

        if(error) {
            callback({error: 'Não foi possível retornar os cursos'});
        } else {

            callback(course);
        }
    });
};

exports.course = function(courseName, callback) {

    db.Course.findOne({courseName : courseName}, function(error, course) {

        if(error) {
            callback({error: 'Não foi possível retornar os cursos'});
        } else {
            callback(course);
        }
    });
};

exports.save = function(courseName, periods, callback) {

    new db.Course({
        'courseName': courseName,
        'periods': periods
    }).save(function(error, course) {

        if(error) {
            console.log(error)
            callback({error: 'Não foi possível salvar o curso.'})
        } else {
            callback(course);
        }
    });

};

exports.delete = function(courseName, callback) {

    db.Course.findOne({courseName : courseName}, function(error, course) {

        if(error) {
            callback({error: 'Não foi possível excluir o curso'});
        } else {

            course.remove(function(error) {

                if(!error) {
                    callback({response: 'Curso excluído com sucesso'});
                }
            });
        }
    });
}