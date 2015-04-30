$(document).ready(function() {
    var socket = io.connect(),
        $nickForm = $('#setNick'),
        $nickError = $('#nickError'),
        $nickBox = $('#nickname'),
        $users = $('#users'),
        $messageForm = $('#send-message'),
        $messageBox = $('#message'),
        $chat = $('#chat'),
        $history = $('#history'),
        $msgs = $('#msg'),
        $feature = $('.feature'),
        $footer = $('.footer'),
        currentUser = null,
        // To control the show recent msgs logic
        shownHistory = false,
        firstMsgRec = false;

    $nickBox.focus();

    // Username Input
    $nickForm.submit(function(e) {
        e.preventDefault();
        if ($nickBox.val().trim() == '') {
            alert('Please input a username!');
        } else {
            currentUser = $nickBox.val();
            socket.emit('new user', currentUser, function(data) {
                if (data) {
                    $('#nickWrap').hide();
                    $('#contentWrap').fadeIn(200);
                    $messageBox.focus();
                    $feature.hide();
                    $footer.hide();
                } else {
                    $nickError.html('That username is already taken!  Try again.');
                }
            });
            $nickBox.val('');
        }
    });

    // Show recent messages
    $history.click(function() {
        $history.hide();
        $('span.oldmsg').css({
            'display': 'inline'
        });
        shownHistory = true;
        firstMsgRec = true;
    });

    // Get all the online users and update currentUser in bold
    socket.on('usernames', function(data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            // Current user bold
            if (data[i] == currentUser) {
                html += '<b>' + data[i] + '</b>' + '<br>'
            } else {
                html += data[i] + '<br>'
            }
        }
        $users.html(html);
    });

    // Sending Messages
    $messageForm.submit(function(e) {
        e.preventDefault();
        if (shownHistory == false) {
            $chat.empty();
            shownHistory = true;
        }
        if ($messageBox.val().trim() == '') {
            alert('Please input a message!');
        } else {
            socket.emit('send message', $messageBox.val(), function(data) {
                $chat.append('<span class="error">' + data + "</span><br/>");
            });
            $messageBox.val('');
            $('span.msg').css({
                'display': 'inline'
            });
            $history.hide();
        }
    });

    // Load recent messages (number of which is hardcoded as 8 in backend)
    socket.on('load old msgs', function(docs) {
        for (var i = docs.length - 1; i >= 0; i--) {
            displayOldMsg(docs[i]);
        }
    });

    // Recieving a new message from another user
    socket.on('new message', function(data) {
        if (firstMsgRec == false) {
            $chat.empty();
            shownHistory = true;
            firstMsgRec = true;
        }
        displayNewMsg(data);
    });

    // Whisper (private) Message
    socket.on('whisper', function(data) {
        $chat.append('<span class="whisper"><b>' + data.nick + ': </b>' + data.msg + "</span><br/>");
    });

    // Urgent (private) Message
    socket.on('urgent', function(data) {
        alert("URGENT MSG FROM " + data.nick + ": " + data.msg);
    });

    // Functions to display messages
    function displayOldMsg(data) {
        $chat.append('<span class="oldmsg"><b>' + data.nick + ': </b>' + data.msg + "</span><br/>");
    }

    function displayNewMsg(data) {
        $chat.append('<span class="msg"><b>' + data.nick + ': </b>' + data.msg + "</span><br/>");
    }
});