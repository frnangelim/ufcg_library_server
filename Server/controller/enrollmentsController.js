var db = require('../db_config.js');

exports.list = function(callback) {

    db.Enrollment.find({}, function(error, enrollments) {

        if(error) {
            callback({error: 'Não foi possível retornar as matrículas'});
        } else {
            callback(enrollments);
        }
    });
};

exports.listByUser = function(userId, course, callback) {

    db.Enrollment.find({userId : userId , course : course}, function(error, enrollments) {

        if(error) {
            callback({error: 'Não foi possível retornar as matrículas do usuário'});
        } else {
            callback(enrollments);
        }
    });
};

exports.enrollment = function(userId, subjectName, course, callback) {

    db.Enrollment.findOne({userId : userId, subjectName : subjectName, course : course}, function(error, enrollment) {

        if(error) {
            callback({error: 'Não foi possível retornar a matrícula'});
        } else {
            callback(enrollment);
        }
    });
};

exports.save = function(userId, subjectName, course, isFinished, callback) {

    db.Enrollment.findOne({userId : userId, subjectName : subjectName, course: course}, function(error, enrollment) {
        if(error) {
            callback({error: 'Não foi possível salvar o enrollment'});
        } else if (enrollment != null) {
            if(isFinished) {
                enrollment.isFinished = isFinished;
            }
        } else {
            enrollment = new db.Enrollment({
                'userId': userId,
                'subjectName': subjectName,
                'isFinished': isFinished,
                'course': course
            });
        }

        enrollment.save(function(error, enrollment) {

            if(error) {
                callback({error: 'Não foi possível matricular a disciplina'});
            } else {
                callback(enrollment);
            }
        });
    });
};

exports.update = function(userId, subjectName, course, isFinished, callback) {

    db.Enrollment.findOne({userId : userId, subjectName : subjectName, course: course}, function(error, enrollment) {

        if(error || enrollment == null) {
            callback({error: 'Não foi possível editar o enrollment'});
        } else {
            if(isFinished) {
                enrollment.isFinished = isFinished;
            }

            enrollment.save(function(error, enrollment) {

                if(error) {
                    callback({error: 'Não foi possível editar o enrollment'});
                } else {
                    callback(enrollment);
                }
            });
        }
    });
};

exports.delete = function(userId, subjectName, course, callback) {

    db.Enrollment.findOne({userId : userId, subjectName : subjectName, course : course}, function(error, enrollment) {

        if(error || enrollment == null) {
            callback({error: 'Não foi possível excluir a matrícula'});
        } else {

            enrollment.remove(function(error) {

                if(!error) {
                    callback({response: 'Matrícula excluida com sucesso'});
                }
            });
        }
    });
};
