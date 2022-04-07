const conn = require('../db_connection/connectToDatabase.js');
require('dotenv').config();


/*
 * @TODO: I should have written the wrapper around the default mysql query method but I didn't
 * so I have to do it later😥😥😥
 */

function asyncQuery(sql) {
	return new Promise((resolve, reject) => {
		conn.query(sql, (err, result) => {
			if (!err) resolve(result);
			else reject(err);
		})
	});
}


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

function deleteCard(uid) {
	checkAndRefreshConnection();
	sql = `delete from new_card where uid='${uid}'`;
	conn.query(sql, (err, result) => {
		if (!err) return true;
		else {
			return false;
		}
	})
}

const createCard = (req, res) => {
	// 1st we need to register the card and then we need to delete that from the new_card table.
	checkAndRefreshConnection();
	console.log("creatin");
	sql = `
		insert into student values (
			'${req.body.uid}',
			'${req.body.name}',
			${req.body.std},
			${req.body.mobile}
		);
	`;
	conn.query(sql, async (err, result) => {
		if (!err) {
			sql = `delete from new_card where uid='${req.body.uid}'`;
			conn.query(sql, (err, result) => {
				if (!err) res.json({ status: true });
				else res.json({ status: false, "error_msg": err.message });
			})
		}
		else res.json({ status: false, "error_msg": err.message });
	});
}

const deleteCardFromNewSection = (req, res) => {
	if (deleteCard(req.body.uid)) res.json({ status: true });
	else res.status(500).json({ status: false, "error_msg": "cannot delete" });
}

const postAttendance = async (req, res) => {
	// 1st checking if the card is regsitered or not, if yes then posting attendance else send to new card
	checkAndRefreshConnection();
	try {
		let result = await asyncQuery(`select * from student where uid='${req.params.uid}'`);
		if (result.length == 0) {
			// the card is not registered yet
			result = await asyncQuery(`select * from new_card where uid='${req.params.uid}'`);
			if (result.length == 0)
				await asyncQuery(`insert into new_card values('${req.params.uid}')`);
			res.json({ status: true });
		} else {
			// the card is registered so put the attendance
			let bids = await asyncQuery(`
				select bid from student_to_batch sb, batch b
				where
					sb.bid = b.id and
					sb.sid = '${req.params.uid}' and
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
						sid = '${req.params.uid}' and
						bid = ${bid.bid} and
						date_time like '${time} %'
				`)
				console.log(`
					select * from attendance
					where
						sid = '${req.params.uid}' and
						bid = ${bid.bid} and
						date_time like '${time} %'
				`);
				if (result.length == 0)
					await asyncQuery(`insert into attendance values('${req.params.uid}', ${bid.bid}, current_timestamp)`)
			});
			res.json({ status: true });
		}
	} catch (e) { res.json({ status: false, err_msg: e }); }
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
		insert into batch(name, teacher_id, sem, active) values(
			'${req.body.name}',
			${req.body.teacher},
			${req.body.sem},
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
		select b.id, b.name as "bname", b.sem, t.name as "tname", b.active from batch b, teacher t
		where
			b.teacher_id = t.id
		order by b.active desc;
	`;

	conn.query(sql, (err, result) => {
		if (!err) res.json({ status: true, result });
		else res.json({ status: false });
	});
}

const toggleActivate = (req, res) => {
	checkAndRefreshConnection();
	conn.query(`select active from batch where id='${req.body.id}';`, (err, result) => {
		if (!err) {
			let val = 0;
			if (result[0].active == 0) val = 1;
			conn.query(`update batch set active=${val} where id=${req.body.id}`);
			res.json({ status: true });
		} else res.json({ status: false });
	});
}

const getSpecificBatch = (req, res) => {
	checkAndRefreshConnection();
	conn.query(`
		select b.id, b.name as "bname", b.sem, t.name as "tname" from batch b, teacher t
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

const getBatchStudents = (req, res) => {
	checkAndRefreshConnection();
	let sql = `
		select b.id as "bid", s.uid as "uid", s.name as "sname", s.sem as "sem" from student s, student_to_batch sb, batch b
		where
			s.uid = sb.sid and
			b.id = sb.bid and
			sb.bid = ${req.body.id}
	`;
	conn.query(sql, (err, result) => {
		if (!err) res.json({ status: true, result });
		else res.json({ status: false, err_msg: err.message });
	});
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
	addStudentToBatch
}