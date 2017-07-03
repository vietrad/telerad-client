var $sockets = {};
var $channels = {};

exports.add = function (socket) {
    $sockets[socket.id] = socket;

    socket.on('disconnect', function () {
        exports.remove(socket);
    });
};

exports.remove = function (socket) {
    if ($sockets[socket.id])
        delete $sockets[socket.id];
    for (var i in $channels) {
        var channel = $channels[i];
        if (channel[socket.id])
            delete channel[socket.id];
    }
};

exports.subscribe = function (channel, socket) {
    if (!$channels[channel])
        $channels[channel] = {};
    $channels[channel][socket.id] = socket;
};

//publish đến socket có trong tất cả channel truyền vào
exports.publish = function (channels, event, data) {
    if (typeof channels != 'object')
        channels = [channels];

    var firstChannel = $channels[channels[0]];
    if (!firstChannel)
        return;

    for (var i in firstChannel) {
        var socket = firstChannel[i];
        var ok = true;
        //kiểm tra socket có nằm trong các channel còn lại không
        for (var j = 1; j < channels.length; j++) {
            var channel = $channels[channels[j]];
            if (!channel[socket.id]) {
                ok = false;
                break;
            }
        }
        if (ok)  //nếu đúng gửi tin đi
            socket.emit(event, data);
    }
};

exports.getSocketByChannel = function(channel){
    if(!$channels[channel]){
        return [];
    }
    
    return $channels[channel];
};

function empty(obj) {
    for (var i in obj) {
        return false;
    }
    return true;
}

//garbage collector
setInterval(function () {
    for (var i in $channels) {
        if (empty($channels[i]))
            delete $channels[i];
    }
}, 10000);