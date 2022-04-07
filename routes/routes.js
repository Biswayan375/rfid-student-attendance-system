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
	addStudentToBatch
} = require('../controllers/controller.js');


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
	.get(getAllBatches)
	.put(toggleActivate)

router.route('/getSpecificBatch')
	.post(getSpecificBatch);

router.route('/batchStudents')
	.post(getBatchStudents)
	.delete(deleteStudentFromBatch)

router.route('/addStudentsToBatch')
	.get(renderAddStudentsToBatch) // Renders the page that adds students to batches
	.post(addStudentToBatch)

router.route('/students')
	.get((req, res) => { res.render('students.ejs') })
	.post(getStudents)

router.route('/getStudentsToAdd')
	.post(getStudentsToAdd)


/*
 * Other Routes
 */
router.route('/getTeachers')
	.get(getAllTeachers)

router.route('/attend/:uid')
	.get(attendIt)



module.exports = router