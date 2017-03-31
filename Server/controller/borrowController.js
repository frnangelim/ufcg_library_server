var db = require('../db_config.js');

exports.list = function(callback) {

    db.Borrow.find({}, function(error, borrows) {

        if(error) {
            callback({error: 'Não foi possível retornar os alugados'});
        } else {
            callback(borrows);
        }
    });
};

exports.listByUser = function(userId, callback) {

    db.Borrow.find({userId : userId}, function(error, borrows) {

        if(error) {
            callback({error: 'Não foi possível retornar os alugados do usuário'});
        } else {
            callback(borrows);
        }
    });
};

exports.borrow = function(userId, bookId, callback) {

    db.Borrow.findOne({userId: userId, bookId: bookId}, function(error, borrow) {

        if(error || borrow == null) {
            callback({error: 'Não foi possível retornar o alugado'});
        } else {
            callback(borrow);
        }
    });
};

exports.save = function(userId, bookId, borrowDate,
    borrowExpirationDate, borrowFinishDate, callback) {

    new db.Borrow({
        'userId': userId,
        'bookId': bookId,
        'borrowDate': borrowDate,
        'borrowExpirationDate': borrowExpirationDate,
        'borrowFinishDate': borrowFinishDate
    }).save(function(error, borrow) {

        if(error) {
            callback({error: 'Não foi possível salvar o alugado'});
        } else {
            callback(borrow);
        }
    });
};

exports.update = function(userId, bookId, borrowDate,
    borrowExpirationDate, borrowFinishDate, callback) {

    db.Borrow.findOne({userId : userId, bookId : bookId}, function(error, borrow) {

        if(error || borrow == null) {
            callback({error: 'Não foi possível editar o alugado'});
        } else {
            if(userId) {
                borrow.userId = userId;
            }

            if(bookId) {
                borrow.bookId = bookId;
            }

            if(borrowDate) {
                borrow.borrowDate = borrowDate;
            }

            if(borrowExpirationDate) {
                borrow.borrowExpirationDate = borrowExpirationDate;
            }

            if(borrowFinishDate) {
                borrow.borrowFinishDate = borrowFinishDate;
            }

            borrow.save(function(error, borrow) {

                if(error) {
                    console.log(error)
                    callback({error: 'Não foi possível editar o alugado'})
                } else {
                    callback(borrow);
                }
            });
        }
    });
};

exports.updateExtend = function(userId, bookId, borrowExpirationDate, callback) {

    db.Borrow.findOne({userId : userId, bookId : bookId}, function(error, borrow) {

        if(error || borrow == null) {
            callback({error: 'Não foi possível extender o aluguel'});
        } else {
            if(userId) {
                borrow.userId = userId;
            }

            if(bookId) {
                borrow.bookId = bookId;
            }

            if(borrowExpirationDate) {
                borrow.borrowExpirationDate = borrowExpirationDate;
            }

            borrow.save(function(error, borrow) {

                if(error) {
                    console.log(error)
                    callback({error: 'Não foi possível editar o alugado'})
                } else {
                    callback(borrow);
                }
            });
        }
    });
};

exports.delete = function(userId, bookId, callback) {

    db.Borrow.findOne({userId: userId, bookId: bookId}, function(error, borrow) {

        if(error || borrow == null) {
            callback({error: 'Não foi possível excluir o alugado'});
        } else {

            borrow.remove(function(error) {

                if(!error) {
                    callback({response: 'Alugado excluido com sucesso'});
                }
            });
        }
    });
};

exports.deleteByBook = function(userId, bookId, callback) {

    db.Borrow.findOne({userId: userId, bookId: bookId}, function(error, borrow) {

        if(error || borrow == null) {
            callback({error: 'Não foi possível excluir o alugado'});
        } else {

            borrow.remove(function(error) {

                if(!error) {
                    callback({response: 'Alugado excluido com sucesso'});
                }
            });
        }
    });
};