var db = require('../db_config.js');

exports.list = function(userId, callback) {

    db.Complaint.find({userId : userId}, function(error, complaints) {

        if(error) {
            callback({error: 'Não foi possível retornar as reclamações·'});
        } else {
            callback(complaints);
        }
    });
};

exports.save = function(userId, message, subject, signature, callback) {

    new db.Complaint({
        'userId': userId,
        'message': message,
        'subject': subject,
        'signature': signature
    }).save(function(error, user) {

        if(error) {
            console.log(error)
            callback({error: 'Não foi possível salvar a reclamação.'})
        } else {
            callback(user);
        }
    });
};
