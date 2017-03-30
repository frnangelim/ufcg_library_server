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
        user: 'ufcg.biblioteca@gmail.com',
        pass: 'libraryufcg'
    }
});


////////////////////////////////////////////////////////// Notificações

var schedule = require('node-schedule');

var bodyParser = require('body-parser');

var firebase = require("firebase");

var db = require('./db_config.js');

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

    var id = validator.trim(validator.escape(req.param('id')));

    userController.user(id, function(resp) {
        res.json(resp);
    });
});

app.post('/users', function(req, res) {

    var id = validator.trim(validator.escape(req.param('_id')));
    var fullName = validator.trim(validator.escape(req.param('fullName')));
    var firstName = validator.trim(validator.escape(req.param('firstName')));
    var course = validator.trim(validator.escape(req.param('course')));
    var picture = validator.trim(validator.escape(req.param('picture')));
    var notifications = validator.trim(validator.escape(req.param('notifications')));

    userController.save(id, firstName, fullName, course, picture, notifications, function(resp) {
        res.json(resp);
    });
});

app.put('/users', function(req, res) {

    var id = validator.trim(validator.escape(req.param('_id')));
    var fullName = validator.trim(validator.escape(req.param('fullName')));
    var firstName = validator.trim(validator.escape(req.param('firstName')));
    var course = validator.trim(validator.escape(req.param('course')));
    var notifications = validator.trim(validator.escape(req.param('notifications')));
    var picture = validator.trim(validator.escape(req.param('picture')));
    var firebaseToken = validator.trim(validator.escape(req.param('firebaseToken')));


    userController.update(id, fullName, firstName, course, notifications, picture, firebaseToken, function(resp) {
        res.json(resp);
    });
});

app.delete('/users/:id', function(req, res) {

    var id = validator.trim(validator.escape(req.param('id')));

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

    var title = validator.trim(validator.escape(req.param('titulo')));
    var author = validator.trim(validator.escape(req.param('autor')));
    var publishingCompany = validator.trim(validator.escape(req.param('editora')));
    var publishingPlace = validator.trim(validator.escape(req.param('local-publicacao')));
    var publishingInitialYear = validator.trim(validator.escape(req.param('ano-publicacao-inicial')));
    var publishingFinalYear = validator.trim(validator.escape(req.param('ano-publicacao-final')));
    var searchPagination = validator.trim(validator.escape(req.param('pagina')));

    bookController.book(title, author, publishingCompany, publishingPlace, publishingInitialYear,
                                        publishingFinalYear, searchPagination, function(resp) {
        res.json(resp)
    });
});

app.get('/books/:id', function(req, res) {

    var id = validator.trim(validator.escape(req.param('id')));

    bookController.bookId(id, function(resp) {
        res.json(resp);
    });
});

app.get('/books/:id/rating', function(req, res) {

    var id = validator.trim(validator.escape(req.param('id')));

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

    var id = validator.trim(validator.escape(req.param('_id')));
    var callNumber = validator.trim(validator.escape(req.param('callNumber')));
    var title = validator.trim(validator.escape(req.param('title')));
    var author = validator.trim(validator.escape(req.param('author')));
    var edition = validator.trim(validator.escape(req.param('edition')));
    var publishingCompany = validator.trim(validator.escape(req.param('publishingCompany')));
    var publishingPlace = validator.trim(validator.escape(req.param('publishingPlace')));
    var publishingYear = validator.trim(validator.escape(req.param('publishingYear')));

    bookController.save(id, callNumber, title, author, edition,
        publishingCompany, publishingPlace, publishingYear, function(resp) {
        res.json(resp);
    });
});

app.put('/books', function(req, res) {

    var id = validator.trim(validator.escape(req.param('_id')));
    var callNumber = validator.trim(validator.escape(req.param('callNumber')));
    var title = validator.trim(validator.escape(req.param('title')));
    var author = validator.trim(validator.escape(req.param('author')));
    var edition = validator.trim(validator.escape(req.param('edition')));
    var publishingCompany = validator.trim(validator.escape(req.param('publishingCompany')));
    var publishingPlace = validator.trim(validator.escape(req.param('publishingPlace')));
    var publishingYear = validator.trim(validator.escape(req.param('publishingYear')));

    bookController.update(id, callNumber, title, author, edition,
        publishingCompany, publishingPlace, publishingYear, function(resp) {
        res.json(resp);
    });
});

app.delete('/books/:id', function(req, res) {

    var id = validator.trim(validator.escape(req.param('id')));

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

    var userId = validator.trim(validator.escape(req.param('userId')));

    borrowController.listByUser(userId, function(resps) {
        res.json(resps);
    });
});

app.get('/borrows', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));

    borrowController.borrow(userId, bookId, function(resp) {
        res.json(resp);
    });
});

app.post('/borrows', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));
    var borrowDate = new Date(validator.trim(validator.escape(req.param('borrowDate'))));
    var borrowExpirationDate = new Date(validator.trim(validator.escape(req.param('borrowExpirationDate'))));
    var borrowFinishDate = new Date(validator.trim(validator.escape(req.param('borrowFinishDate'))));

    borrowController.save(userId, bookId, borrowDate,
        borrowExpirationDate, borrowFinishDate, function(resp) {
            res.json(resp);

            makeCron(borrowExpirationDate, userId, bookId);
            makeCron(borrowFinishDate, userId, bookId);
    });
});


app.put('/borrows', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));
    var borrowDate = new Date(validator.trim(validator.escape(req.param('borrowDate'))));
    var borrowExpirationDate = new Date(validator.trim(validator.escape(req.param('borrowExpirationDate'))));
    var borrowFinishDate = new Date(validator.trim(validator.escape(req.param('borrowFinishDate'))));

    borrowController.update( userId, bookId, borrowDate,
        borrowExpirationDate, borrowFinishDate, function(resp) {
            res.json(resp);

            makeCron(borrowExpirationDate, userId, bookId);
            makeCron(borrowFinishDate, userId, bookId);
    });
});

app.delete('/borrows', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));

    borrowController.delete(userId, bookId, function(resp) {
        res.json(resp);
    });
});

app.delete('/users/:userId/borrows/delete/:bookId', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var bookId= validator.trim(validator.escape(req.param('bookId')));

    borrowController.deleteByBook(userId, bookId, function(resp) {
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

    var userId = validator.trim(validator.escape(req.param('userId')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));

    ratedController.rating(userId, bookId, function(resp) {
        res.json(resp);
    });
});

app.get('/users/:userId/ratings', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));

    ratedController.listByUserId(userId, function(resp) {
        res.json(resp);
    });
});

app.get('/books/:bookId/ratings', function(req, res) {

    var bookId = validator.trim(validator.escape(req.param('bookId')));

    ratedController.listByBookId(bookId, function(resp) {
        res.json(resp);
    });
});

app.post('/ratings', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var userName = validator.trim(validator.escape(req.param('userName')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));
    var rating = new Number(validator.trim(validator.escape(req.param('rating'))));
    var commentary = validator.trim(validator.escape(req.param('commentary')));

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

    var userId = validator.trim(validator.escape(req.param('userId')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));
    var rating = parseInt(validator.trim(validator.escape(req.param('rating'))));
    var oldRating = parseInt(validator.trim(validator.escape(req.param('oldRating'))));
    var commentary = validator.trim(validator.escape(req.param('commentary')));

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

    var userId = validator.trim(validator.escape(req.param('userId')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));
    var oldRating = parseInt(validator.trim(validator.escape(req.param('oldRating'))));

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

    var course = validator.trim(validator.escape(req.param('course')));

    subjectsController.listByCourse(course, function(resp) {
        res.json(resp);
    });
});

app.get('/subjects', function(req, res) {

    var name = validator.trim(validator.escape(req.param('subjectName')));
    var course = validator.trim(validator.escape(req.param('course')));

    subjectsController.subject(name, course, function(resp) {
        res.json(resp);
    });
});

app.get('/subjects/period/:period', function(req, res) {

    var period = parseInt(validator.trim(validator.escape(req.param('period'))));
    var course = validator.trim(validator.escape(req.param('course')));

    subjectsController.listsubj(period, course, function(resp) {

        res.json(resp);
    });

});

app.post('/subjects', function(req, res) {

    var name = validator.trim(validator.escape(req.param('subjectName')));
    var period = parseInt(validator.trim(validator.escape(req.param('period'))));
    var credits = parseInt(validator.trim(validator.escape(req.param('credits'))));
    var course = validator.trim(validator.escape(req.param('course')));

    subjectsController.save(name, period, credits, course, function(resp) {
        res.json(resp);
    });
});


app.put('/subjects', function(req, res) {

    var name = validator.trim(validator.escape(req.param('subjectName')));
    var newName = validator.trim(validator.escape(req.param('newName')));
    var course = validator.trim(validator.escape(req.param('course')));
    var period = parseInt(validator.trim(validator.escape(req.param('period'))));

    // To don't update this field, assign a invalid value
    var numBibliographiesInvalid = "";

    subjectsController.update(name, newName, period, course, numBibliographiesInvalid, function(resp) {
            res.json(resp);
    });
});

app.delete('/subjects', function(req, res) {

    var name = validator.trim(validator.escape(req.param('subjectName')));
    var course = validator.trim(validator.escape(req.param('course')));

    subjectsController.delete(name, course, function(resp) {
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

    var userId = validator.trim(validator.escape(req.param('userId')));
    var subjectName = validator.trim(validator.escape(req.param('subjectName')));
    var course = validator.trim(validator.escape(req.param('course')));

    enrollmentsController.enrollment(userId, subjectName, course, function(respEnrollment) {
        res.json(respEnrollment);
    });
});

app.get('/users/:userId/enrollments', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var course = validator.trim(validator.escape(req.param('course')));

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

    var userId = validator.trim(validator.escape(req.param('userId')));
    var subjectName = validator.trim(validator.escape(req.param('subjectName')));
    var course = validator.trim(validator.escape(req.param('course')));
    var isFinished = validator.trim(validator.escape(req.param('isFinished')));

    enrollmentsController.save(userId, subjectName, course, isFinished, function(respEnrollment) {
        res.json(respEnrollment);
    });
});

app.put('/enrollments', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var subjectName = validator.trim(validator.escape(req.param('subjectName')));
    var course = validator.trim(validator.escape(req.param('course')));
    var isFinished = validator.trim(validator.escape(req.param('isFinished')));

    enrollmentsController.update(userId, subjectName, course, isFinished, function(resp) {
        res.json(resp);
    });
});

app.delete('/enrollments', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var subjectName = validator.trim(validator.escape(req.param('subjectName')));
    var course = validator.trim(validator.escape(req.param('course')));

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

    var userId = validator.trim(validator.escape(req.param('userId')));
    var subjectName = validator.trim(validator.escape(req.param('subjectName')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));

    bibliographyController.bibliography(userId, subjectName, bookId, function(respBibliography) {
        res.json(respBibliography);
    });
});

app.get('/bibliographies/subjects/:subjectName', function(req, res) {

    var subjectName = validator.trim(validator.escape(req.param('subjectName')));

    bibliographyController.listBySubject(subjectName, function(respBibliography) {
        res.json(respBibliography);
    });
});

app.post('/bibliographies', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var subjectName = validator.trim(validator.escape(req.param('subjectName')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));
    var course = validator.trim(validator.escape(req.param('course')));

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

    var userId = validator.trim(validator.escape(req.param('userId')));
    var subjectName = validator.trim(validator.escape(req.param('subjectName')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));
    var course = validator.trim(validator.escape(req.param('course')));

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

    var userId = validator.trim(validator.escape(req.param('userId')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));

    desiredController.desired(userId, bookId, function(resp) {
        res.json(resp);
    });
});

app.get('/users/:userId/desireds', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));

    desiredController.listByUser(userId,  function(resp) {
        res.json(resp);
    });
});

app.post('/desireds', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));

     desiredController.save(userId, bookId, function(resp) {
        res.json(resp);
    });
});

app.delete('/desireds', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var bookId = validator.trim(validator.escape(req.param('bookId')));

    desiredController.delete(userId, bookId, function(resp) {
        res.json(resp);
    });
});

/////////////////////////////////////////////////////////////////////////////////

app.get('/users/:userId/complaint', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));

    complaintController.list(userId, function(resp) {
        res.json(resp);
    });
});

app.post('/users/:userId/complaint', function(req, res) {

    var userId = validator.trim(validator.escape(req.param('userId')));
    var message = validator.trim(validator.escape(req.param('message')));
    var subject = validator.trim(validator.escape(req.param('subject')));
    var signature = validator.trim(validator.escape(req.param('signature')));

    sendEmail(message, subject, signature);

     complaintController.save(userId, message, subject, signature, function(resp) {
        res.json(resp);
    });
});


function sendEmail(message, subject, signature) {

    var email = {
        from: 'ufcg.biblioteca@gmail.com',
        to: 'ufcg.biblioteca@gmail.com',
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

    var courseName = validator.trim(validator.escape(req.param('courseName')));

    courseController.course(courseName, function(resp) {

        res.json(resp);
    });
});

app.post('/courses', function(req, res) {

    var courseName = validator.trim(validator.escape(req.param('courseName')));
    var periods = validator.trim(validator.escape(req.param('periods')));

    courseController.save(courseName, periods, function(resp) {
        res.json(resp);
    });
});

app.delete('/courses/:courseName', function(req, res) {

    var courseName = validator.trim(validator.escape(req.param('courseName')));

    courseController.delete(courseName, function(resp) {
        res.json(resp);
    });
});

////////////////////////////////////////////////////////////////////////////////
