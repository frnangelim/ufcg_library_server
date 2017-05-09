var app = require('./app_config.js');

var userController = require('./controller/userController');

var bookController = require('./controller/bookController');

var borrowController = require('./controller/borrowController');

var ratedController = require('./controller/ratedController');

var subjectsController = require('./controller/subjectsController');

var enrollmentsController = require('./controller/enrollmentsController');

var bibliographyController = require('./controller/bibliographyController');

var desiredController = require('./controller/desiredController');

var complaintController = require('./controller/complaintController');

var courseController = require('./controller/courseController');

var validator = require('validator');

var nodemailer = require('nodemailer');

var mailler = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'library.app.ufcg@gmail.com',
        pass: 'libraryufcg'
    }
});

////////////////////////////////////////////////////////// Notificações

var schedule = require('node-schedule');

var bodyParser = require('body-parser');

var firebase = require("firebase");

app.use(bodyParser.json())

firebase.initializeApp({
    serviceAccount: "./credentials/libraryapp-1a3c2-firebase-adminsdk-k5b7e-f024c263de.json",
    databaseURL: "https://libraryapp-1a3c2.firebaseio.com/"
});


function makeCron(borrowExpirationDate, userId, bookId){
    var cronDate = new Date(borrowExpirationDate);

    var dayCron = cronDate.getDate() + 1;
    var monthCron = cronDate.getMonth() + 1;
    var yearCron = cronDate.getFullYear(); // Not used

    var cron = schedule.scheduleJob('01 6 ' + dayCron + ' ' + monthCron + ' 0-7', function(){  //Notificação para as 6:00 do dia da data de entrega.(Minute, hour, day, month, day of week)
        sendNotificationToUser(userId, bookId, borrowExpirationDate);
    });

}

function sendNotificationToUser(userId, bookId, scheduleDate) {
    borrowController.borrow(userId, bookId, function(resp) {
        if(resp == null || resp.error){
            console.log(resp);
        }else{
            if(resp.borrowExpirationDate.getDate() == scheduleDate.getDate()
                && resp.borrowExpirationDate.getMonth() == scheduleDate.getMonth()){

                userController.notificationUser(userId, function(resp){
                    console.log(resp)
                });
            }else if(resp.borrowFinishDate.getDate() == scheduleDate.getDate()
                && resp.borrowFinishDate.getMonth() == scheduleDate.getMonth()){

                userController.notificationUserFinish(userId, function(resp){
                    console.log(resp)

                    scheduleDate.setHours(24);

                    repeatCron(scheduleDate, userId, bookId)
                });

            }else{
                 console.log("Data do schedule é diferente da data de expiração do borrow")
            }

        }
    });
}

function repeatCron(scheduleDate, userId, bookId){
    var cronDate = new Date(scheduleDate);

    var dayCron = cronDate.getDate() + 1;
    var monthCron = cronDate.getMonth() + 1;
    var yearCron = cronDate.getFullYear(); // Not used

    var cron = schedule.scheduleJob('01 6 ' + dayCron + ' ' + monthCron + ' 0-7', function(){  //Notificação para as 6:00 do dia da data de entrega.(Minute, hour, day, month, day of week)
        repeatNotification(userId, bookId, scheduleDate);
    });
}

function repeatNotification(userId, bookId, scheduleDate){
    borrowController.borrow(userId, bookId, function(resp) {
        if(resp == null || resp.error){
            console.log(resp);
        }else{
            if(resp.borrowFinishDate < scheduleDate){

                userController.notificationUserLate(userId, function(resp){
                    console.log(resp)
                    scheduleDate.setHours(24);
                    repeatCron(scheduleDate, userId, bookId)

                });
            }else{
                 console.log("Data do schedule é diferente da data de expiração do borrow")
            }

        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/', function(req, res) {

    res.end('Bem-vindo à Biblioteca UFCG!');
});

app.get('/users', function(req, res) {

    userController.list(function(resp) {

        res.json(resp);
    });
});

app.get('/users/:id', function(req, res) {

    var id = validator.trim(validator.escape(req.params.id));

    userController.user(id, function(resp) {
        res.json(resp);
    });
});

app.post('/users', function(req, res) {

    var id = validator.trim(validator.escape(req.body._id));
    var fullName = validator.trim(validator.escape(req.body.fullName));
    var firstName = validator.trim(validator.escape(req.body.firstName));
    var course = validator.trim(validator.escape(req.body.course));
    var picture = validator.trim(validator.escape(req.body.picture));
    var notifications = validator.trim(validator.escape(req.body.notifications));

    userController.save(id, firstName, fullName, course, picture, notifications, function(resp) {
        res.json(resp);
    });
});

app.put('/users', function(req, res) {

    var id = validator.trim(validator.escape(req.body._id));
    var fullName = validator.trim(validator.escape(req.body.fullName));
    var firstName = validator.trim(validator.escape(req.body.firstName));
    var course = validator.trim(validator.escape(req.body.course));
    var picture = validator.trim(validator.escape(req.body.picture));
    var notifications = validator.trim(validator.escape(req.body.notifications));
    var firebaseToken = validator.trim(validator.escape(req.body.firebaseToken));

    userController.update(id, fullName, firstName, course, notifications, picture, firebaseToken, function(resp) {
        res.json(resp);
    });
});

app.delete('/users/:id', function(req, res) {

    var id = validator.trim(validator.escape(req.params.id));

    userController.delete(id, function(resp) {
        res.json(resp);
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/books/all', function(req, res) {

    bookController.list(function(resp) {
        res.json(resp);
    });
});

app.get('/books', function(req, res) {

    var title = validator.trim(validator.escape(req.query.titulo));
    var author = validator.trim(validator.escape(req.query.autor));
    var publishingCompany = validator.trim(validator.escape(req.query.editora));
    var publishingPlace = validator.trim(validator.escape(req.query['local-publicacao']));
    var publishingInitialYear = validator.trim(validator.escape(req.query['ano-publicacao-inicial']));
    var publishingFinalYear = validator.trim(validator.escape(req.query['ano-publicacao-final']));
    var searchPagination = validator.trim(validator.escape(req.query.pagina));

    bookController.book(title, author, publishingCompany, publishingPlace, publishingInitialYear,
                                        publishingFinalYear, searchPagination, function(resp) {
        res.json(resp)
    });
});

app.get('/books/:id', function(req, res) {

    var id = validator.trim(validator.escape(req.params.id));

    bookController.bookId(id, function(resp) {
        res.json(resp);
    });
});

app.get('/books/:id/rating', function(req, res) {

    var id = validator.trim(validator.escape(req.params.id));

    bookController.bookId(id, function(resp) {
        if(resp.error) {
            res.json({error: 'Não foi possível retornar a avaliação do livro'});
        } else {
            var ratingSum = resp.ratingSum;
            var numRating = resp.numRating;

            if(numRating) {
                var rating = ratingSum / numRating;

                res.json(rating);
            } else {
                res.json(-1);
            }
        }
    });
});

app.post('/books', function(req, res) {

    var id = validator.trim(validator.escape(req.body._id));
    var callNumber = validator.trim(validator.escape(req.body.callNumber));
    var title = validator.trim(validator.escape(req.body.title));
    var author = validator.trim(validator.escape(req.body.author));
    var edition = validator.trim(validator.escape(req.body.edition));
    var publishingCompany = validator.trim(validator.escape(req.body.publishingCompany));
    var publishingPlace = validator.trim(validator.escape(req.body.publishingPlace));
    var publishingYear = validator.trim(validator.escape(req.body.publishingYear));

    bookController.save(id, callNumber, title, author, edition,
        publishingCompany, publishingPlace, publishingYear, function(resp) {
        res.json(resp);
    });
});

app.put('/books', function(req, res) {

    var id = validator.trim(validator.escape(req.body._id));
    var callNumber = validator.trim(validator.escape(req.body.callNumber));
    var title = validator.trim(validator.escape(req.body.title));
    var author = validator.trim(validator.escape(req.body.author));
    var edition = validator.trim(validator.escape(req.body.edition));
    var publishingCompany = validator.trim(validator.escape(req.body.publishingCompany));
    var publishingPlace = validator.trim(validator.escape(req.body.publishingPlace));
    var publishingYear = validator.trim(validator.escape(req.body.publishingYear));

    bookController.update(id, callNumber, title, author, edition,
        publishingCompany, publishingPlace, publishingYear, function(resp) {
        res.json(resp);
    });
});

app.delete('/books/:id', function(req, res) {

    var id = validator.trim(validator.escape(req.params.id));

    bookController.delete(id, function(resp) {
        res.json(resp);
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/borrows/all', function(req,res) {

    borrowController.list(function(resp) {
        res.json(resp);
    });
});

app.get('/users/:userId/borrows', function(req, res) {

    var userId = validator.trim(validator.escape(req.params.userId));

    borrowController.listByUser(userId, function(resps) {
        res.json(resps);
    });
});

app.get('/borrows', function(req, res) {

    var userId = validator.trim(validator.escape(req.query.userId));
    var bookId = validator.trim(validator.escape(req.query.bookId));

    borrowController.borrow(userId, bookId, function(resp) {
        res.json(resp);
    });
});

app.post('/borrows', function(req, res) {

    var userId = validator.trim(validator.escape(req.body.userId));
    var bookId = validator.trim(validator.escape(req.body.bookId));
    var borrowDate = new Date(validator.trim(validator.escape(req.body.borrowDate)));
    var borrowExpirationDate = new Date(validator.trim(validator.escape(req.body.borrowExpirationDate)));
    var borrowFinishDate = new Date(validator.trim(validator.escape(req.body.borrowFinishDate)));

    borrowController.save(userId, bookId, borrowDate,
        borrowExpirationDate, borrowFinishDate, function(resp) {
            res.json(resp);

            makeCron(borrowExpirationDate, userId, bookId);
            makeCron(borrowFinishDate, userId, bookId);
    });
});


app.put('/borrows', function(req, res) {

    var userId = validator.trim(validator.escape(req.body.userId));
    var bookId = validator.trim(validator.escape(req.body.bookId));
    var borrowDate = new Date(validator.trim(validator.escape(req.body.borrowDate)));
    var borrowExpirationDate = new Date(validator.trim(validator.escape(req.body.borrowExpirationDate)));
    var borrowFinishDate = new Date(validator.trim(validator.escape(req.body.borrowFinishDate)));

    borrowController.update( userId, bookId, borrowDate,
        borrowExpirationDate, borrowFinishDate, function(resp) {
            res.json(resp);

            makeCron(borrowExpirationDate, userId, bookId);
            makeCron(borrowFinishDate, userId, bookId);
    });
});

app.delete('/borrows', function(req, res) {

    var userId = validator.trim(validator.escape(req.query.userId));
    var bookId = validator.trim(validator.escape(req.query.bookId));

    borrowController.delete(userId, bookId, function(resp) {
        res.json(resp);
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/ratings/all', function(req, res) {

    ratedController.list(function(resp) {
        res.json(resp);
    });
});

app.get('/ratings', function(req, res) {

    var userId = validator.trim(validator.escape(req.query.userId));
    var bookId = validator.trim(validator.escape(req.query.bookId));

    ratedController.rating(userId, bookId, function(resp) {
        res.json(resp);
    });
});

app.get('/books/:bookId/ratings', function(req, res) {

    var bookId = validator.trim(validator.escape(req.params.bookId));

    ratedController.listByBookId(bookId, function(resp) {
        res.json(resp);
    });
});

app.post('/ratings', function(req, res) {

    var userId = validator.trim(validator.escape(req.body.userId));
    var userName = validator.trim(validator.escape(req.body.userName));
    var bookId = validator.trim(validator.escape(req.body.bookId));
    var rating = parseInt(validator.trim(validator.escape(req.body.rating)));
    var commentary = validator.trim(validator.escape(req.body.commentary));

    bookController.saveRating(bookId, rating, function(respBook) {

        if(respBook.error) {
            res.json({error: 'Não foi possível salvar a avaliação, ' +
                                        'livro não encontrado'});
        } else {

            ratedController.save(userId, userName, bookId, rating, commentary, function(respRated) {
                res.json(respRated);
            });
        }
    });
});

app.put('/ratings', function(req, res) {

    var userId = validator.trim(validator.escape(req.body.userId));
    var bookId = validator.trim(validator.escape(req.body.bookId));
    var rating = parseInt(validator.trim(validator.escape(req.body.rating)));
    var oldRating = parseInt(validator.trim(validator.escape(req.body.oldRating)));
    var commentary = validator.trim(validator.escape(req.body.commentary));

    bookController.updateRating(bookId, rating, oldRating, function(respBook) {
        if(respBook.error) {
            res.json({error: 'Não foi possível editar a avaliação, ' +
                            'livro não encontrado'});
        } else {

            ratedController.update(userId, bookId, rating, commentary, function(respRated) {
                res.json(respRated);
            });
        }
    });
});

app.delete('/ratings', function(req, res) {

    var userId = validator.trim(validator.escape(req.query.userId));
    var bookId = validator.trim(validator.escape(req.query.bookId));
    var oldRating = parseInt(validator.trim(validator.escape(req.query.oldRating)));

    bookController.deleteRating(bookId, oldRating, function(respBook) {

        if(respBook.error) {
            res.json(respBook);
        } else {

            ratedController.delete(userId, bookId, function(respRated) {
                res.json(respRated);
            });
        }
    });
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/subjects/all', function(req, res) {

   subjectsController.list(function(resp) {
        res.json(resp);
    });
});

app.get('/subjects/bycourse', function(req, res) {

    var course = validator.trim(validator.escape(req.query.course));

    subjectsController.listByCourse(course, function(resp) {
        res.json(resp);
    });
});

app.get('/subjects', function(req, res) {

    var name = validator.trim(validator.escape(req.query.subjectName));
    var course = validator.trim(validator.escape(req.query.course));

    subjectsController.subject(name, course, function(resp) {
        res.json(resp);
    });
});

app.post('/subjects', function(req, res) {

    var name = validator.trim(validator.escape(req.body.subjectName));
    var period = parseInt(validator.trim(validator.escape(req.params.period)));
    var credits = parseInt(validator.trim(validator.escape(req.params.credits)));
    var course = validator.trim(validator.escape(req.params.course));

    subjectsController.save(name, period, credits, course, function(resp) {
        res.json(resp);
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/enrollments/all', function(req, res) {

    enrollmentsController.list(function(resp) {
        res.json(resp);
    });
});

app.get('/enrollments', function(req, res) {

    var userId = validator.trim(validator.escape(req.query.userId));
    var subjectName = validator.trim(validator.escape(req.query.subjectName));
    var course = validator.trim(validator.escape(req.query.course));

    enrollmentsController.enrollment(userId, subjectName, course, function(respEnrollment) {
        res.json(respEnrollment);
    });
});

app.get('/users/:userId/enrollments', function(req, res) {

    var userId = validator.trim(validator.escape(req.params.userId));
    var course = validator.trim(validator.escape(req.query.course));

    userController.user(userId, function(respUser) {
        if(respUser.error) {
            res.json({error: 'Não foi possível retornar a matrícula, usuário não encontrado'});
        } else {
            enrollmentsController.listByUser(userId, course, function(respEnrollment) {
                res.json(respEnrollment);
            });
        }
    });
});

app.post('/enrollments', function(req, res) {

    var userId = validator.trim(validator.escape(req.body.userId));
    var subjectName = validator.trim(validator.escape(req.body.subjectName));
    var course = validator.trim(validator.escape(req.body.course));
    var isFinished = validator.trim(validator.escape(req.body.isFinished));

    enrollmentsController.save(userId, subjectName, course, isFinished, function(respEnrollment) {
        res.json(respEnrollment);
    });
});

app.put('/enrollments', function(req, res) {

    var userId = validator.trim(validator.escape(req.body.userId));
    var subjectName = validator.trim(validator.escape(req.body.subjectName));
    var course = validator.trim(validator.escape(req.body.course));
    var isFinished = validator.trim(validator.escape(req.body.isFinished));

    enrollmentsController.update(userId, subjectName, course, isFinished, function(resp) {
        res.json(resp);
    });
});

app.delete('/enrollments', function(req, res) {

    var userId = validator.trim(validator.escape(req.query.userId));
    var subjectName = validator.trim(validator.escape(req.query.subjectName));
    var course = validator.trim(validator.escape(req.query.course));

    enrollmentsController.delete(userId, subjectName, course, function(respEnrollment) {
        res.json(respEnrollment);
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/bibliographies/all', function(req, res) {

    bibliographyController.list(function(resp) {
        res.json(resp);
    });
});

app.get('/bibliographies', function(req, res) {

    var userId = validator.trim(validator.escape(req.query.userId));
    var subjectName = validator.trim(validator.escape(req.query.subjectName));
    var bookId = validator.trim(validator.escape(req.query.bookId));

    bibliographyController.bibliography(userId, subjectName, bookId, function(respBibliography) {
        res.json(respBibliography);
    });
});

app.get('/bibliographies/subjects/:subjectName', function(req, res) {

    var subjectName = validator.trim(validator.escape(req.params.subjectName));

    bibliographyController.listBySubject(subjectName, function(respBibliography) {
        res.json(respBibliography);
    });
});

app.post('/bibliographies', function(req, res) {

    var userId = validator.trim(validator.escape(req.body.userId));
    var subjectName = validator.trim(validator.escape(req.body.subjectName));
    var bookId = validator.trim(validator.escape(req.body.bookId));
    var course = validator.trim(validator.escape(req.body.course));

    bibliographyController.save(userId, subjectName, bookId, function(respBibliography) {
        if(respBibliography.error) {
            res.json(respBibliography);
        } else {

                var numBibliographiesIncreasement = 1;

                // To don't update these fields, assign invalid values
                var newNameInvalid = '';
                var periodInvalid = -1;

            subjectsController.update(subjectName, newNameInvalid, periodInvalid, course,
                                                    numBibliographiesIncreasement, function(resp) {
                    if(resp.error) {
                        res.json(resp);
                    } else {
                        res.json(respBibliography);
                    }
            });
        }
    });
});

app.delete('/bibliographies', function(req, res) {

    var userId = validator.trim(validator.escape(req.query.userId));
    var subjectName = validator.trim(validator.escape(req.query.subjectName));
    var bookId = validator.trim(validator.escape(req.query.bookId));
    var course = validator.trim(validator.escape(req.query.course));

    bibliographyController.delete(userId, subjectName, bookId, function(respBibliography) {
        if(respBibliography.error) {
            res.json(respBibliography);
        } else {

            var numBibliographiesDecreasement = -1;

            // To don't update these fields, assign invalid values
            var newNameInvalid = '';
            var periodInvalid = -1;

            subjectsController.update(subjectName, newNameInvalid, periodInvalid, course,
                                                    numBibliographiesDecreasement, function(resp) {
                    if(resp.error) {
                        res.json(resp);
                    } else {
                        res.json(respBibliography);
                    }
            });
        }
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/desireds/all', function(req, res) {

    desiredController.list( function(resp) {
        res.json(resp);
    });
});

app.get('/desireds', function(req, res) {

    var userId = validator.trim(validator.escape(req.query.userId));
    var bookId = validator.trim(validator.escape(req.query.bookId));

    desiredController.desired(userId, bookId, function(resp) {
        res.json(resp);
    });
});

app.get('/users/:userId/desireds', function(req, res) {

    var userId = validator.trim(validator.escape(req.params.userId));

    desiredController.listByUser(userId,  function(resp) {
        res.json(resp);
    });
});

app.post('/desireds', function(req, res) {

    var userId = validator.trim(validator.escape(req.body.userId));
    var bookId = validator.trim(validator.escape(req.body.bookId));

     desiredController.save(userId, bookId, function(resp) {
        res.json(resp);
    });
});

app.delete('/desireds', function(req, res) {

    var userId = validator.trim(validator.escape(req.query.userId));
    var bookId = validator.trim(validator.escape(req.query.bookId));

    desiredController.delete(userId, bookId, function(resp) {
        res.json(resp);
    });
});

/////////////////////////////////////////////////////////////////////////////////

app.get('/users/:userId/complaint', function(req, res) {

    var userId = validator.trim(validator.escape(req.params.userId));

    complaintController.list(userId, function(resp) {
        res.json(resp);
    });
});

app.post('/users/:userId/complaint', function(req, res) {

    var userId = validator.trim(validator.escape(req.body.userId));
    var message = validator.trim(validator.escape(req.body.message));
    var subject = validator.trim(validator.escape(req.body.subject));
    var signature = validator.trim(validator.escape(req.body.signature));

    sendEmail(message, subject, signature);

     complaintController.save(userId, message, subject, signature, function(resp) {
        res.json(resp);
    });
});


function sendEmail(message, subject, signature) {

    var email = {
        from: 'library.app.ufcg@gmail.com',
        to: 'library.app.ufcg@gmail.com',
        subject: 'Library App - ' + subject,
        html: message + '<br />' + '<br />' + 'De: ' + signature
    };

    mailler.sendMail(email, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(info);
        }
    });
};

////////////////////////////////////////////////////////////////////////////////

app.get('/courses/all', function(req, res) {

    courseController.list(function(resp) {

        res.json(resp);
    });
});

app.get('/courses', function(req, res) {

    var courseName = validator.trim(validator.escape(req.query.courseName));

    courseController.course(courseName, function(resp) {

        res.json(resp);
    });
});

app.post('/courses', function(req, res) {

    var courseName = validator.trim(validator.escape(req.body.courseName));
    var periods = validator.trim(validator.escape(req.body.periods));

    courseController.save(courseName, periods, function(resp) {
        res.json(resp);
    });
});