var express = require("express"),
    app = express(),
    port = 3000,
    io = require('socket.io').listen(app.listen(process.env.PORT || port)),
    mongoose = require('mongoose'),
    users = {};

console.log("Listening on port " + port);

// Initialize Database
mongoose.connect(process.env.MONGO_URL, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to mongodb!');
    }
});

// Database Schema
var chatSchema = mongoose.Schema({
    nick: String,
    msg: String,
    created: {
        type: Date,
        default: Date.now
    }
});

// Creating the model for our purpose
var Chat = mongoose.model('Message', chatSchema);

// Express configuration
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// Homepage GET Request
app.get("/", function(req, res) {
    res.render("page");
});

// Socket.io
io.sockets.on('connection', function(socket) {
    // Sort and load eight most recent messages
    var query = Chat.find({});
    query.sort('-created').limit(8).exec(function(err, docs) {
        if (err) throw err;
        socket.emit('load old msgs', docs);
    })

    // Saving new users by getting input from client
    // And updating the client list of users as well
    socket.on('new user', function(data, callback) {
        if (data in users) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            users[socket.nickname] = socket;
            updateNicknames();
        }
    });

    // Function to update client side usernames
    function updateNicknames() {
        io.sockets.emit('usernames', Object.keys(users));
    }

    // Logic for deciding whether message is a whisper, urgent or standard
    socket.on('send message', function(data, callback) {
        var msg = data.trim();
        console.log('after trimming message is: ' + msg);

        // Private Message till ---
        if (msg.substr(0, 1) === '@') {
            msg = msg.substr(1);
            console.log(msg);
            var ind = msg.indexOf(' ');
            if (ind !== -1) {
                var name = msg.substring(0, ind);
                var msg = msg.substring(ind + 1);
                if (name in users) {
                    users[name].emit('whisper', {
                        msg: msg,
                        nick: socket.nickname
                    });
                    console.log('message sent is: ' + msg);
                    console.log('Whisper!');
                } else {
                    callback('Error!  Enter a valid user.');
                }
            } else {
                callback('Error!  Please enter a message for your whisper.');
            }
        }
        // ---

        //Urgent Message till ---
        else if (msg.substr(0, 1) === '!') {
            msg = msg.substr(1);
            console.log(msg);
            var ind = msg.indexOf(' ');
            if (ind !== -1) {
                var name = msg.substring(0, ind);
                var msg = msg.substring(ind + 1);
                if (name in users) {
                    users[name].emit('urgent', {
                        msg: msg,
                        nick: socket.nickname
                    });
                    console.log('message sent is: ' + msg);
                    console.log('URGENT!');
                } else {
                    callback('Error!  Enter a valid user.');
                }
            } else {
                callback('Error!  Please enter an urgent message.');
            }
        }
        // ---

        // Standard Message
        else {
            var newMsg = new Chat({
                msg: msg,
                nick: socket.nickname
            });

            // Emit Message and save it to Mongo
            newMsg.save(function(err) {
                if (err) throw err;
                io.sockets.emit('new message', {
                    msg: msg,
                    nick: socket.nickname
                });
            });
        }
    });

    // Remove user from chat room on browser exit
    socket.on('disconnect', function(data) {
        if (!socket.nickname) return;
        delete users[socket.nickname];
        updateNicknames();
    });
});
