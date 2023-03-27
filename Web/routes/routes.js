const express = require('express');
const router = express.Router();
const {
	checkForNewCard : check,
	deleteCardFromNewSection : dlt,
	createCard : create,
	postAttendance : attendIt,
	getAllTeachers,
	createBatch,
	getAllBatches,
	toggleActivate,
	getSpecificBatch,
	getStudents,
	getBatchStudents,
	deleteStudentFromBatch,
	getStudentsToAdd,
	renderAddStudentsToBatch,
	addStudentToBatch,
	editBatch,
	deleteBatch,
	deleteStudent,
	getSpecificAttendanceRecord,
	deleteBatchAttendanceRecords,
	getSpecificStudentDetails,
	updateSpecificStudentDetails
} = require('../controllers/controller.js');

const { protectionLayer, verifyAndLogin } = require('../controllers/utils');


/**
 * Login and logout Routes
 */
router.route('/login')
	.get((req, res) => {
		// sending back the login page to the client
		res.render('login.ejs', {message: req.flash('message')})
	})
	.post(verifyAndLogin) // Processing client (admin) login credentials and logging in or redirecting to login page again accordingly

router.use('/logout', protectionLayer);
router.route('/logout')
    .get((req, res) => { 
        if (req.session.userID) {
			req.session.userID = null; // Clearing out the current session
			req.flash('message', 'Successfully logged out!') // Setting up a flash message for a successful logout
		}
        res.redirect('/login') // Redirecting back to login page
	})

/**
 * Attendance Processing Route
 */
router.route('/attend')
	.get(attendIt)



router.use(protectionLayer); // All of the routes below this are gonna use this middleware
/*
 * Register Routes
 */
router.route('/register')
	.get((req, res) => { res.render('register.ejs'); })
	.post(create)
	.delete(dlt);

router.route('/register/check')
	.get(check)


/*
 * Batch Routes
 */
router.route('/createBatch')
	.get((req, res) => { res.render('createBatch.ejs'); })
	.post(createBatch)

router.route('/allBatches') // Renders the front-end
	.get((req, res) => { res.render('seeBatches.ejs'); })

router.route('/getAllBatches') // Gets the data
	.get(getAllBatches) // gets the data for all batches
	.put(toggleActivate) // activates/deactivates a specific batch
	.delete(deleteBatch) // deletes a specific batch

router.route('/getSpecificBatch')
	.post(getSpecificBatch);

router.route('/batchStudents')
	.post(getBatchStudents)
	.delete(deleteStudentFromBatch)

router.route('/addStudentsToBatch')
	.get(renderAddStudentsToBatch) // Renders the page that adds students to batches
	.post(addStudentToBatch)

router.route('/batchEdit')
	.post(editBatch)


/*
 * Student Routes
 */
router.route('/students')
	.get((req, res) => { res.render('students.ejs') })
	.post(getStudents)
	.delete(deleteStudent)
router.route('/specific-student-details')
	.get(getSpecificStudentDetails)
	.post(updateSpecificStudentDetails)

router.route('/getStudentsToAdd')
	.post(getStudentsToAdd)


/**
 * Track Routes
 */
router.route('/track')
	.get((req, res) => { res.render('track.ejs') })
	.delete(deleteBatchAttendanceRecords)

router.route('/track-specific-attendance')
	.post(getSpecificAttendanceRecord);


/*
 * Other Routes
 */
router.route('/getTeachers')
	.get(getAllTeachers)

router.route('/')
	.get((req, res) => { res.redirect('/login') })



module.exports = router