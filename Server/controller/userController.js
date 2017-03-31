var db = require('../db_config.js');
var request = require('request');

var API_KEY = "AAAA8bIbfUc:APA91bE4MslT_pMIZYvxXTy-vvNWFqTzX6q3sSVppl1ed3aDUXTdBOKkPGjGmLWZOoTneTdWeU-gondtMKPmoxAeTq07O_K_cm3QbEvBLeipb91rQoPB8YqO4CKex92a693DfAD4EbRQ"; // Your Firebase Cloud Messaging Server API key


exports.list = function(callback) {

    db.User.find({}, function(error,users) {

        if(error) {
            callback({error: 'Não foi possível retornar os usuários'});
        } else {

            callback(users);
        }
    });
};

exports.user = function(id, callback) {

    db.User.findById(id, function(error,user) {

        if(error) {
            callback({error: 'Não foi possível retornar o usuário'});
        } else {

            callback(user);
        }
    });
};

exports.save = function(id, firstName, fullName, course, picture, notifications, callback) {

    new db.User({
        '_id': id,
        'firstName': firstName,
        'fullName': fullName,
        'course': course,
        'picture': picture,
        'notifications': notifications,
        'created_at': new Date()
    }).save(function(error, user) {

        if(error) {
            console.log(error)
            callback({error: 'Não foi possível salvar o usuário.'})
        } else {
            callback(user);
        }
    });
};

exports.update = function(id, fullName, firstName, course, notifications, picture, firebaseToken, callback) {

    db.User.findById(id, function(error, user) {

        if(error || user == null) {
            callback({error: 'Não foi possível editar o usuário.'});
        } else {
            if(fullName) {

                user.fullName = fullName;
            }

            if(firstName) {

                user.firstName = firstName;
            }

            if(course) {

                user.course = course;
            }

            if(notifications) {

                user.notifications = notifications;
            }

            if(picture) {

                user.picture = picture;
            }

            if(firebaseToken) {
                user.firebaseToken = firebaseToken;
            }

            user.save(function(error, user) {

                if(error) {
                    callback({error: 'Não foi possível editar o usuário.'});
                } else {
                    callback(user);
                }
            });
        }
    });
};

exports.delete = function(id, callback) {

    db.User.findById(id, function(error,user) {

        if(error || user == null) {
            callback({error: 'Não foi possível excluir o usuário'});
        } else {

            user.remove(function(error) {

                if(!error) {
                    callback({response: 'Usuário excluido com sucesso.'});
                }
            });
        }
    });
};

exports.notificationUser = function(userId, callback){

    db.User.findById(userId, function(error,user) {

        if(error || user == null) {
            callback({error: 'Não foi possível retornar o usuário'});
        } else {
            token = user.firebaseToken
            enabledNotifications = user.notifications

            if(enabledNotifications == false){
                callback({response: 'Notificações do usuário desativadas.'})
            }else{
                request({
                    url: 'https://fcm.googleapis.com/fcm/send',
                    method: 'POST',
                    headers: {
                        'Content-Type': ' application/json',
                        'Authorization': 'key=' + API_KEY
                    },
                    body: JSON.stringify({
                        notification: {
                            title: 'Biblioteca UFCG',
                            body: "Você tem um livro para devolver hoje."
                        },
                        to: token
                    })
                }, function (error, response, body) {
                    if (error) {
                        callback(error);
                    }else if (response.statusCode >= 400) {
                         callback({response: 'HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage});
                    }
                    else {
                         callback({response: 'Notificação enviada.'});
                    }
                });
            }

        }
    });
}

exports.notificationUserFinish = function(userId, callback){

    db.User.findById(userId, function(error,user) {

        if(error || user == null) {
            callback({error: 'Não foi possível retornar o usuário'});
        } else {
            token = user.firebaseToken
            enabledNotifications = user.notifications

            if(enabledNotifications == false){
                callback({response: 'Notificações do usuário desativadas.'})
            }else{
                request({
                    url: 'https://fcm.googleapis.com/fcm/send',
                    method: 'POST',
                    headers: {
                        'Content-Type': ' application/json',
                        'Authorization': 'key=' + API_KEY
                    },
                    body: JSON.stringify({
                        notification: {
                            title: 'Biblioteca UFCG',
                            body: "Hoje é o último dia para devolver seu livro!"
                        },
                        to: token
                    })
                }, function (error, response, body) {
                    if (error) {
                        callback(error);
                    }else if (response.statusCode >= 400) {
                         callback({response: 'HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage});
                    }
                    else {
                         callback({response: 'Notificação enviada.'});
                    }
                });
            }

        }
    });
}

exports.notificationUserLate = function(userId, callback){

    db.User.findById(userId, function(error,user) {

        if(error || user == null) {
            callback({error: 'Não foi possível retornar o usuário'});
        } else {
            token = user.firebaseToken
            enabledNotifications = user.notifications

            if(enabledNotifications == false){
                callback({response: 'Notificações do usuário desativadas.'})
            }else{
                request({
                    url: 'https://fcm.googleapis.com/fcm/send',
                    method: 'POST',
                    headers: {
                        'Content-Type': ' application/json',
                        'Authorization': 'key=' + API_KEY
                    },
                    body: JSON.stringify({
                        notification: {
                            title: 'Biblioteca UFCG',
                            body: "Ei, você esqueceu de devolver um livro!"
                        },
                        to: token
                    })
                }, function (error, response, body) {
                    if (error) {
                        callback(error);
                    }else if (response.statusCode >= 400) {
                         callback({response: 'HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage});
                    }
                    else {
                         callback({response: 'Notificação enviada.'});
                    }
                });
            }
        }
    });
}