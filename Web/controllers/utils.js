// For login and authetication
function protectionLayer(req, res, next) {
    if (req.session.userID) next();
    else {
        req.flash('message', 'Please login first');
        res.redirect('/login');
    }
}

function verifyAndLogin(req, res) {
    if (req.body.username == process.env.ADMIN_USERNAME && req.body.password == process.env.ADMIN_PASSWORD) {
        req.session.userID = req.body.username;
        res.redirect('/allBatches');
    } else {
        req.flash('message', 'invalid credentials provided');
        res.redirect('/login')
    }
}

module.exports = {
    protectionLayer,
    verifyAndLogin
}