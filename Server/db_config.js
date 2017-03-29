var db_string = 'mongodb://127.0.0.1/library_app';

var mongoose = require('mongoose').connect(db_string);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Erro ao conectar no banco.'));

db.once('open', function() {

    var userSchema = mongoose.Schema({

        _id:{
            type: String,
            required: true,
            unique: true
        },
        firstName:{
            type: String,
            required: true
        },
        fullName:{
            type: String,
            required: true
        },
        course:{
            type: String
        },
        picture:{
            type: String
        },
        notifications: Boolean,
        firebaseToken:{
            type: String
        }
    });

    exports.User = mongoose.model('User', userSchema);

    var bookSchema = mongoose.Schema({

        _id:{
            type: String,
            required: true,
            unique: true
        },
        callNumber:{
            type: String,
            required: true
        },
        title:{
            type: String,
            required: true
        },
        author:{
            type: String
        },
        edition:{
            type: String
        },
        publishingCompany:{
            type: String
        },
        publishingPlace:{
            type: String
        },
        publishingYear:{
            type: String
        },
        ratingSum:{
            type: Number,
            default: 0
        },
        numRating:{
            type: Number,
            default: 0
        }
    });

    exports.Book = mongoose.model('Book', bookSchema);

    var borrowSchema = mongoose.Schema({

        userId: {
            type: String,
            ref: 'User',
            required: true
        },
        bookId: {
            type: String,
            ref: 'Book',
            required: true
        },
        borrowDate: {
            type: Date
        },
        borrowExpirationDate: {
            type: Date
        },
        borrowFinishDate: {
            type: Date
        },
    });

    exports.Borrow = mongoose.model('Borrow', borrowSchema);

    var ratedSchema = mongoose.Schema({

        userId: {
            type: String,
            ref: 'User',
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        bookId: {
            type: String,
            ref: 'Book',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            default: 0
        },
        commentary: {
            type: String
        }
    });

    exports.Rated = mongoose.model('Rated', ratedSchema);

    var subjectSchema = mongoose.Schema({

        name: {
            type: String,
            required:true,
        },
        period: {
            type: Number,
            default: 0
        },
        credits: {
            type: Number,
            default: 0
        },
        numBibliographies: {
            type: Number,
            default: 0
        },
        course: {
            type: String
        }


    });

    exports.Subject = mongoose.model('Subject', subjectSchema);

    var enrollmentSchema = mongoose.Schema({

        userId: {
            type: String,
            ref: 'User',
            required: true
        },
        subjectName: {
            type: String,
            ref: 'Subject',
            required: true
        },
        isFinished: {
            type: Boolean,
            default: false
        },
        course: {
            type: String
        }
    });

    exports.Enrollment = mongoose.model('Enrollment', enrollmentSchema);


    var bibliographySchema = mongoose.Schema({

        userId: {
            type: String,
            ref: 'User',
            required: true
        },
        subjectName: {
            type: String,
            ref: 'Subject',
            required: true
        },
        bookId: {
            type: String,
            ref: 'Book',
            required: true
        },
        isEment: {
            type: Boolean,
            default: false
        }
    });

    exports.Bibliography = mongoose.model('Bibliography', bibliographySchema);

    var desiredSchema = mongoose.Schema({

        userId: {
            type: String,
            ref: 'User',
            required: true
        },
        bookId: {
            type: String,
            ref: 'Book',
            required: true
        }
    });

    exports.Desired = mongoose.model('Desired', desiredSchema);

    var complaintSchema = mongoose.Schema({

        userId: {
            type: String,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        signature: {
            type: String
        }
    });

    exports.Complaint = mongoose.model('Complaint', complaintSchema);

    var courseSchema = mongoose.Schema({

        courseName: {
            type: String,
            unique: true
        },
        periods: {
            type: Number
        }
    });

    exports.Course = mongoose.model('Course', courseSchema);

});
