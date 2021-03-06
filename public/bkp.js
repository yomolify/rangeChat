io.sockets.on('connection', function(socket) {
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

    function updateNicknames() {
        // Send only the keys of the users object
        io.sockets.emit('usernames', Object.keys(users));
    }

    socket.on('send message', function(data, callback) {
        var msg = data.trim();
        console.log('after trimming message is: ' + msg);
        if (msg.substr(0, 3) === '/w ') {
            msg = msg.substr(3);
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
        } else {
            io.sockets.emit('new message', {
                msg: msg,
                nick: socket.nickname
            });
        }
    });

    // Remove user on disconnecting from chat server
    socket.on('disconnect', function(data) {
        if (!socket.nickname) return;
        delete users[socket.nickname];
        updateNicknames();
    });
});