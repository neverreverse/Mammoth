/**
 * Created with JetBrains WebStorm.
 * User: c-sailor.zhang
 * Date: 1/23/13
 * Time: 1:47 PM
 * To change this template use File | Settings | File Templates.
 */

var index = require('./index');
var user = require('./user');
var blog = require('./blog');
var melody = require('./melody');
module.exports = function (app) {
    app.get('/', index.index);
    

    app.get('/list', user.list);
    app.get('/blog', blog.list);
    //app.get('/user', user.list);

    //user entity
    app.post('/signup', user.create);
    app.get('/checklogin', index.getLoginUser);
	app.post('/login', user.login);
	app.get('/logout', user.logout);
    app.get('/user',   user.list);
    app.get('/user/:id', user.getUser);

    //melody entity
    app.get('/melody/:id', melody.getMelody);
    app.get('/melodyCollection/', melody.getMelodyCollection);
    app.post('/melody',melody.putMelody);
    app.post('/comment',melody.putComment);

    app.post('/track',melody.putTrack);

};