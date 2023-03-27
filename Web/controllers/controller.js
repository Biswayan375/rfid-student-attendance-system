const conn = require('../db_connection/connectToDatabase.js');
require('dotenv').config();

// For writing mysql queries with syntactical sugar...
function asyncQuery(sql) {
	return new Promise((resolve, reject) => {
		conn.query(sql, (err, result) => {
			if (!err) resolve(result);
			else reject(err);
		})
	});
}

// For checking mysql connection
function checkAndRefreshConnection() {
	if (!conn) {
		conn.end();
		conn = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD || '',
			database: process.env.DB_NAME
		});
	}
}


const checkForNewCard = (req, res) => {
	checkAndRefreshConnection();
	sql = `select * from new_card`;
	conn.query(sql, (err, result) => {
		if (!err) {
            if (result.length == 0) res.json({"success": false, "error_msg": "No Card To Register"});
            else res.json({ "success": true, result });
        } else res.status(500).json({ "success": false, "error_msg": err.message });
	});
}

async function deleteCard(uid) {
	checkAndRefreshConnection();
	sql = `delete from new_card where uid='${uid}'`;
	try {
		await asyncQuery(sql);
		return true;
	} catch {
		return false;
	}
}

const createCard = async (req, res) => {
	// 1st we need to register the card and then we need to delete that from the new_card table.
	checkAndRefreshConnection();
	sql = `
		insert into student values (
			'${req.body.uid}',
			'${req.body.name}',
			${req.body.sem},
			'${req.body.roll}',
			${req.body.mobile}
		);
	`;
	try {
		await asyncQuery(sql);
		await asyncQuery(`delete from new_card where uid='${req.body.uid}'`);
		res.json({ status: true });
	} catch (e) {
		res.json({ status: false, "error_msg": e.message });
	}
}

const deleteCardFromNewSection = async (req, res) => {
	if (await deleteCard(req.body.uid)) res.json({ status: true });
	else res.json({ status: false, "error_msg": "cannot delete" });
}

const postAttendance = async (req, res) => {
	// 1st checking if the card is regsitered or not, if yes then posting attendance else send to new card
	/************************************************************************************************************
	 *	Response Status Codes -																					*
	 *		810 -> Unsuccessful Attendance (Card not registered or error)										*
	 *		800 -> Successful/Unsuccessful Attendance (Card is registered but batch may or maynot be activated) *
	 ************************************************************************************************************
	 */
	checkAndRefreshConnection();
	try {
		let result = await asyncQuery(`select * from student where uid='${req.query.uid}'`);
		if (result.length == 0) {
			// the card is not registered yet
			result = await asyncQuery(`select * from new_card where uid='${req.query.uid}'`);
			if (result.length == 0)
				await asyncQuery(`insert into new_card values('${req.query.uid}')`);
			res.status(810);
			res.json({ status: true, message: "card is not registered" });
		} else {
			// the card is registered so put the attendance
			let bids = await asyncQuery(`
				select bid from student_to_batch sb, batch b
				where
					sb.bid = b.id and
					sb.sid = '${req.query.uid}' and
					b.active=1
			`);
			bids.forEach(async bid => {
				let d = new Date(), m, day;
				if (d.getMonth() < 10) m = '0' + (d.getMonth() + 1);
				else m = d.getMonth();
				if (d.getDate() < 10) day = '0' + d.getDate();
				else day = d.getDate();

				let time = `${d.getFullYear()}-${m}-${day}`;
				result = await asyncQuery(`
					select * from attendance
					where
						sid = '${req.query.uid}' and
						bid = ${bid.bid} and
						date_time like '${time} %'
				`)
				if (result.length == 0)
					await asyncQuery(`insert into attendance values('${req.query.uid}', ${bid.bid}, current_timestamp)`)
			});
			res.status(800);
			res.json({ status: true, message: "attendance registered if batch is activated" });
		}
	} catch (e) { res.status(810); res.json({ status: false, err_msg: e }); }
}

const getAllTeachers = (req, res) => {
	checkAndRefreshConnection();
	conn.query(`select id, name from teacher`, (err, result) => {
		if (!err) res.json({ status: true, result });
		else res.json({ status: false });
	});
}

const createBatch = (req, res) => {
	checkAndRefreshConnection();
	sql = `
		insert into batch(name, teacher_id, active) values(
			'${req.body.name}',
			${req.body.teacher},
			0
		);
	`;
	conn.query(sql, (err, result) => {
		if (!err) res.json({ status: true });
		else res.json({ status: false, "err_msg": err.message });
	});
}

const getAllBatches = (req, res) => {
	checkAndRefreshConnection();
	sql = `
		select b.id, b.name as "bname", t.name as "tname", b.active from batch b, teacher t
		where
			b.teacher_id = t.id
		order by b.active desc;
	`;

	conn.query(sql, (err, result) => {
		if (!err) res.json({ status: true, result });
		else res.json({ status: false });
	});
}

const toggleActivate = async (req, res) => {
	checkAndRefreshConnection();
	try {
		let result = await asyncQuery(`select active from batch where id='${req.body.id}'`);
		let val = 0;
		if (result[0].active == 0) val = 1;
		asyncQuery(`update batch set active=${val} where id=${req.body.id}`);

		if (val == 1) {
			// when the batch is activated from deactivated state we need to insert the date into batch_dates table to keep track of total class days
			let d = new Date(), m, day;
			if (d.getMonth() < 10) m = '0' + (d.getMonth() + 1);
			else m = d.getMonth();
			if (d.getDate() < 10) day = '0' + d.getDate();
			else day = d.getDate();
			let sqlStyleDate = `${d.getFullYear()}-${m}-${day}`;

			let result = await asyncQuery(`select * from batch_dates where date_time like '${sqlStyleDate} %' and bid=${req.body.id}`);
			
			if (result.length == 0)
				asyncQuery(`insert into batch_dates(bid, date_time) values(${req.body.id}, current_timestamp())`);
		}
		res.json({ status: true, message: `successfully activated batch - ${req.body.id}` });
	} catch (e) {
		res.json({ status: false, message: e.message })
	}
}

const getSpecificBatch = (req, res) => {
	checkAndRefreshConnection();
	conn.query(`
		select b.id, b.name as "bname", t.name as "tname" from batch b, teacher t
		where
			b.teacher_id = t.id and
			b.id = ${req.body.id};
	`, (err, result) => {
		if (!err) res.json({ status: true, result });
		else res.json({ status: false, "err_msg": err.message });
	});
}

const getStudents = (req, res) => {
	checkAndRefreshConnection();
	let sql = `select * from student`;
	if (req.body.sem) sql += ` where sem=${req.body.sem}`
	sql += ' order by sem';

	conn.query(sql, (err, result) => {
		if (!err) res.json({ status: true, result });
		else res.json({ status: false, err_msg: err.message });
	});
}

const getBatchStudents = async (req, res) => {
	checkAndRefreshConnection();
	let sql = `
		select b.id as "bid", s.uid as "uid", s.name as "sname", s.sem as "sem", s.roll as "roll" from student s, student_to_batch sb, batch b
		where
			s.uid = sb.sid and
			b.id = sb.bid and
			sb.bid = ${req.body.id}
	`;

	let attendanceResultSql = `
		select s.uid, s.name, count(*) as "totalAttendedDays" from student s, attendance a
		where
			s.uid = a.sid and
			a.bid = ${req.body.id}
		group by
			s.uid, s.name
	`;

	let totalClassDaysSql = `
		select count(*) as "totalClassDays" from batch_dates
		where
			bid = ${req.body.id}
	`;
	try {
		let result = await asyncQuery(sql);
		let attendanceResult = await asyncQuery(attendanceResultSql);
		let totalClassDays = await asyncQuery(totalClassDaysSql);
		res.json({ status: true, "result": result, "attendanceResult": attendanceResult, "totalClassDays": totalClassDays[0].totalClassDays });
	} catch (e) {
		res.json({ status: false, err_msg: err.message });
	}
}

const deleteStudentFromBatch = (req, res) => {
	checkAndRefreshConnection();
	let sql = `
		delete from student_to_batch
		where
			sid='${req.body.sid}' and
			bid=${req.body.bid}
	`
	conn.query(sql, (err, result) => {
		if (!err) res.json({ status: true });
		else res.json({ status: false, err_msg: err.message });
	});
}

const getStudentsToAdd = (req, res) => {
	checkAndRefreshConnection();
	var sql1 = `
		select s.uid, s.name, s.sem from student s
		where
			s.uid in (
				select s1.sid from student_to_batch s1
				where not exists (
					select * from student_to_batch s2
					where
						s2.bid = ${req.body.bid} and
						s2.sid = s1.sid
				)
			)
	`;

	var sql2 = `
		select s.uid, s.name, s.sem from student s
		where uid not in (
			select sid from student_to_batch
		)
	`;

	if (req.body.sem != 0) {
		sql1 += ` and\ns.sem = ${req.body.sem};`;
		sql2 += ` and\ns.sem = ${req.body.sem};`;
	}
	conn.query(sql1, (err, result1) => {
		if (!err) {
			conn.query(sql2, (err, result2) => {
				if (!err) res.json({ status: true, result: result1.concat(result2) })
				else res.json({ status: false, err_msg: err.message });
			})
		}
		else res.json({ status: false, err_msg: err.message });
	})
}

const renderAddStudentsToBatch = (req, res) => {
	checkAndRefreshConnection();
	conn.query(`select name from batch where id=${req.query.bid}`, (err, result) => {
		if (!err)
			res.render('addStudentsToBatch.ejs', { bid: req.query.bid, name: result[0].name })
		else res.json({ status: false, err_msg: err.message });
	});
}


const addStudentToBatch = (req, res) => {
	checkAndRefreshConnection();
	conn.query(`insert into student_to_batch values('${req.body.sid}', ${req.body.bid})`, (err, result) => {
		if (!err) res.json({ status: true });
		else res.json({ status: false });
	})
}

const editBatch = async (req, res) => {
	let id = req.body.batchID,
		name = req.body.batchName,
		teacher = req.body.batchTeacher;
	checkAndRefreshConnection();
	try {
		await asyncQuery(`update batch set name = '${name}', teacher_id = ${teacher} where id = ${id}`);
		res.redirect('/allBatches');
	} catch(e) {
		res.status(500);
		res.json({status: false, message: e.message});
	}
}

const deleteBatch = async (req, res) => {
	let id = req.body.id;
	checkAndRefreshConnection();
	try {
		await asyncQuery(`delete from batch where id = ${id}`);
		res.redirect('/allBatches');
	} catch(e) {
		res.status(500);
		res.json({status: false, message: e.message});
	}
}

const deleteStudent = async (req, res) => {
	let id = req.body.id;
	checkAndRefreshConnection();
	try {
		await asyncQuery(`delete from student where uid='${id}'`);
		res.json({ status: true, message: "successfully deleted" });
	} catch(e) {
		res.status(500);
		res.json({status: false, message: e.message})
	}
}

const getSpecificAttendanceRecord = async (req, res) => {
	let batchID = req.body.id;
	try {
		let classDates = await asyncQuery(`
			select b.id as "batchID", b.name as "batchName", bd.date_time as "classDates" from batch b, batch_dates bd
			where
				b.id = bd.bid and
				b.id = ${batchID}
		`);

		let studentsData = await asyncQuery(`
			select s.name as "studentName", s.sem as "studentSem", s.roll as "studentRoll", a.date_time as "attendanceDate" from student s, attendance a, batch b
			where
				s.uid = a.sid and
				b.id = a.bid and
				b.id = ${batchID}
		`);

		res.json({ success: true, batchData: classDates, studentData: studentsData });
	} catch(e) {
		res.status(500);
		res.json({ status: false, message: e.message })
	}
}

const deleteBatchAttendanceRecords = async (req, res) => {
	let batchID = req.body.id;
	try {
		await asyncQuery(`delete from attendance where bid = ${batchID}`);
		await asyncQuery(`delete from batch_dates where bid = ${batchID}`);
		res.json({ status: true });
	} catch (e) {
		res.json({ status: false, message: e.message });
	}
}

const getSpecificStudentDetails = async (req, res) => {
	let uid = req.query.uid;
	try {
		let result = await asyncQuery(`select * from student where uid = ${uid}`);
		res.json({ status: true, result });
	} catch (e) {
		res.json({ status: false, message: e.message });
	}
}

const updateSpecificStudentDetails = async (req, res) => {
	let uid = req.body.UID,
		name = req.body.name,
		sem = req.body.sem,
		roll = req.body.roll,
		mobile = req.body.mobile;
	try {
		await asyncQuery(`update student set name = '${name}', sem = ${sem}, roll = '${roll}', mobile = ${mobile} where uid = '${uid}'`);
		res.redirect('students');
	} catch (e) {
		res.json({ status: false, message: e.message });
	}
}



module.exports = {
	checkForNewCard,
	createCard,
	deleteCardFromNewSection,
	postAttendance,
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
}