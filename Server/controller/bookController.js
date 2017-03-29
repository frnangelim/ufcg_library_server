var db = require('../db_config.js');
var util = require('../util.js');

exports.list = function(callback) {

    db.Book.find({}, function(error, books) {

        if(error) {
            callback({error: 'Não foi possível retornar os livros'});
        } else {
            callback(books);
        }
    });
};

exports.bookId = function(id, callback) {

    db.Book.findById(id, function(error, book) {

        if(error) {
            callback({error: 'Não foi possível retornar o livro'});
        } else {
            callback(book);
        }
    });
};

exports.book = function(title, author, publishingCompany, publishingPlace,
    publishingInitialYear, publishingFinalYear, searchPagination, callback) {

    db.Book.find({}, function(error, books) {
        if(error || books == null) {
            callback({error: 'Não foi possível retornar os livros'});
        } else {
            if(books.length == 0) {
                callback(books);
            }

            var booksMatched = getBooksMatched(books, title, author, publishingCompany, publishingPlace,
                                                        publishingInitialYear, publishingFinalYear, searchPagination);

            callback(booksMatched);
        }
    });
};

function getBooksMatched(books, title, author, publishingCompany, publishingPlace,
    publishingInitialYear, publishingFinalYear, searchPagination) {

    var booksMatched = [];
    var booksByPage = 30, numBooksMatched = 0;
    var tempBook, matches;

    var i = 0;

    while(i < books.length && booksMatched.length < booksByPage) {
        matches = true;
        tempBook = books[i];

        if(matches && title && tempBook.title) {
            matches = matchesBookAttr(tempBook.title, title);
        }

        if(matches && author && tempBook.author) {
            matches = matchesBookAttr(tempBook.author, author);
        }

        if(matches && publishingCompany && tempBook.publishingCompany) {
            matches = matchesBookAttr(tempBook.publishingCompany, publishingCompany);
        }

        if(matches && publishingPlace && tempBook.publishingPlace) {
            matches = matchesBookAttr(tempBook.publishingPlace, publishingPlace);
        }

        if(tempBook.publishingYear) {
            if(matches && publishingInitialYear) {
                matches = tempBook.publishingYear >= publishingInitialYear;
            }

            if(matches && publishingFinalYear) {
                matches = tempBook.publishingYear <= publishingFinalYear;
            }
        }

        if(matches) {
            numBooksMatched++;

            if(numBooksMatched > ((searchPagination-1) * booksByPage) && numBooksMatched <= (searchPagination * booksByPage)) {
                booksMatched.push(tempBook);
            }
        }

        i++;
    }

    return booksMatched;
};

function matchesBookAttr(bookAttr, attr) {
    bookAttr = util.cleanString(bookAttr);
    attr = util.cleanString(attr);

    return bookAttr.includes(attr);
}

exports.save = function(id, callNumber, title, author, edition,
        publishingCompany, publishingPlace, publishingYear, callback) {

    new db.Book({
        '_id': id,
        'callNumber': callNumber,
        'title': title,
        'author': author,
        'edition': edition,
        'publishingCompany': publishingCompany,
        'publishingPlace': publishingPlace,
        'publishingYear': publishingYear,
        'created_at': new Date()
    }).save(function(error, book) {

        if(error) {
            callback({error: 'Não foi possível salvar o livro.'});
        } else {
            callback(book);
        }
    });
};

exports.update = function(id, callNumber, title, author, edition,
        publishingCompany, publishingPlace, publishingYear, callback) {

    db.Book.findById(id, function(error, book) {

        if(error) {
            callback({error: 'Não foi possível editar o livro.'});
        } else {
            if(callNumber) {
                book.callNumber = callNumber;
            }

            if(title) {
                book.title = title;
            }

            if(author) {
                book.author = author;
            }

            if(edition) {
                book.edition = edition;
            }

            if(publishingCompany) {
                book.publishingCompany = publishingCompany;
            }

            if(publishingPlace) {
                book.publishingPlace = publishingPlace;
            }

            if(publishingYear) {
                book.publishingYear = publishingYear;
            }

            book.save(function(error, book) {

                if(error) {
                    callback({error: 'Não foi possível editar o livro.'});
                } else {
                    callback(book);
                }
            });
        }
    });
};

exports.delete = function(id, callback) {

    db.Book.findById(id, function(error, book) {

        if(error) {
            callback({error: 'Não foi possível excluir o livro'});
        } else {

            book.remove(function(error) {

                if(!error) {
                    callback({response: 'Livro excluido com sucesso.'});
                }
            });
        }
    });
};

exports.saveRating = function(id, rating, callback) {

    db.Book.findById(id, function(error, book) {

        if(error) {
            callback({error: 'Não possível adicionar uma avaliação ao livro'});
        } else {

            var ratingString = rating + '';

            if(ratingString) {
                book.ratingSum = book.ratingSum + rating;
                book.numRating++;
            }

            book.save(function(error, book) {

                if(error) {
                    callback({error: 'Não possível adicionar uma avaliação ao livro'});
                } else {
                    callback(book);
                }
            });
        }
    });
};

exports.updateRating = function(id, newRating, oldRating, callback) {

    db.Book.findById(id, function(error, book) {

        if(error) {
            callback({error: 'Não foi possível alterar a avaliação do livro'});
        } else {

            var newRatingString = newRating + '';
            var oldRatingString = oldRating + '';

            if(newRatingString && oldRatingString) {
                book.ratingSum -= oldRating;
                book.ratingSum += newRating;
            }

            book.save(function(error, book) {
                if(error) {
                    callback({error: 'Não possível editar a avaliação do livro'});
                } else {
                    callback(book);
                }
            });
        }
    });
};

exports.deleteRating = function(id, oldRating, callback) {

    db.Book.findById(id, function(error, book) {

        if(error) {
            callback({error: error});
        } else {
            if(book.numRating) {
                book.ratingSum -= oldRating;
                book.numRating--;

                book.save(function(error, book) {

                    if(error) {
                        callback({error: error});
                    } else {
                        callback(book);
                    }
                });
            } else {
                callback({error: 'Não foi possível excluir a avaliação, ' +
                                'o livro não foi avaliado anteriormente'})
            }
        }
    });
};