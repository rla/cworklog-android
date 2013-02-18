var user = document.getElementById('user');
var pass = document.getElementById('pass');
var fetch = document.getElementById('fetch');
var tasks = document.getElementById('tasks');
var list = document.getElementById('list');
var message = document.getElementById('message');
var current = document.getElementById('current');
var stop = document.getElementById('stop');
var upload = document.getElementById('upload');
var local = document.getElementById('local');
var timelogs = document.getElementById('timelogs');
var timelogsList = document.getElementById('timelogs-list');
var timelogsClose = document.getElementById('timelogs-close');
var running;

fetch.addEventListener('click', function() {
    localStorage['user'] = user.value;
    localStorage['pass'] = pass.value;

    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
        var json = JSON.parse(this.responseText);
        if (json.error) {
            message.innerHTML = json.response.message;
        } else {
            var worklogs = json.response.work_logs;
            localStorage['worklogs'] = JSON.stringify(worklogs);
            populateTasks(worklogs);
            message.innerHTML = 'Received tasks';
        }
    }, false);
    xhr.addEventListener('error', function() {
        message.innerHTML = 'XHR error occurred';
    }, false);

    var query = '?u=' + encodeURIComponent(user.value) +
        '&p=' + encodeURIComponent(pass.value);

    message.innerHTML = 'Fetching tasks ...';

    xhr.open('GET', 'https://cworklog.com/api_worklog.php' + query, true);
    xhr.send(null);

}, false);

upload.addEventListener('click', function() {
    localStorage['user'] = user.value;
    localStorage['pass'] = pass.value;

    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
        var json = JSON.parse(this.responseText);
        if (json.error) {
            message.innerHTML = json.response.message;
        } else {
            localStorage.removeItem('timelogs');
            message.innerHTML = 'Uploaded times';
        }
    }, false);
    xhr.addEventListener('error', function() {
        message.innerHTML = 'XHR error occurred';
    }, false);

    message.innerHTML = 'Uploading times ...';

    var json = {
        u: user.value,
        p: pass.value,
        entries: JSON.parse(localStorage['timelogs'] || '[]')
    };

    xhr.open('POST', 'https://cworklog.com/api_timelog.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(json));

}, false);

function populateTasks(worklogs) {
    list.innerHTML = '';

    worklogs.forEach(function(item) {
        var li = document.createElement('li');
        li.innerHTML = item.title;
        li.addEventListener('click', function() {
            startTask(item);
        }, false);
        list.appendChild(li);
    });
}

function startTask(task) {
    task.startTime = Date.now();
    running = task;
    localStorage['running'] = JSON.stringify(task);
    tasks.className = 'hide';
    current.className = '';
    stop.className = '';
    message.innerHTML = 'Task started';
}

stop.addEventListener('click', function() {
    var timelog = {
        work_log_id: running.id,
        start_time: new Date(running.startTime).toISOString(),
        stop_time: new Date().toISOString()
    };
    var timelogs = JSON.parse(localStorage['timelogs'] || '[]');
    timelogs.push(timelog);
    localStorage['timelogs'] = JSON.stringify(timelogs);
    localStorage.removeItem('running');
    running = undefined;
    tasks.className = '';
    current.className = 'hide';
    stop.className = 'hide';
    message.innerHTML = 'Task stopped';
}, false);

function updateCurrent() {
    if (running !== undefined) {
        var diff = Math.floor((Date.now() - running.startTime) / 1000);
        var minutes = Math.floor(diff / 60);
        var seconds = Math.floor(diff % 60);
        current.innerHTML = running.title + ': ' + minutes + 'm ' + seconds + 's';
    } else {
        current.innerHTML = '';
    }
}

local.addEventListener('click', function() {
    var logs = JSON.parse(localStorage['timelogs'] || '[]');
    var worklogs = JSON.parse(localStorage['worklogs'] || '[]');

    function title(id) {
        for (var i = worklogs.length - 1; i >= 0; i--) {
            if (worklogs[i].id === id) {
                return worklogs[i].title;
            }
        }

        return '';
    }

    timelogsList.innerHTML = '';

    logs.forEach(function(entry) {
        var li = document.createElement('li');
        var start = Date.parse(entry.start_time);
        var stop = Date.parse(entry.stop_time);
        var diff = (stop - start) / 1000;
        var minutes = Math.floor(diff / 60);
        var seconds = Math.floor(diff % 60);
        li.innerHTML = title(entry.work_log_id) + ' ' + minutes + 'm ' + seconds + 's';
        timelogsList.appendChild(li);
    });
    timelogs.className = '';
}, false);

timelogsClose.addEventListener('click', function() {
    timelogs.className = 'hide';
}, false);

function ready() {
    var savedUser = localStorage['user'];
    var savedPass = localStorage['pass'];
    if (savedUser !== undefined) {
        user.value = savedUser;
    }
    if (savedPass !== undefined) {
        pass.value = savedPass;
    }
    var savedWorklogs = localStorage['worklogs'];
    if (savedWorklogs !== undefined) {
        populateTasks(JSON.parse(savedWorklogs));
    }
    var savedRunning = localStorage['running'];
    if (savedRunning !== undefined) {
        running = JSON.parse(savedRunning);
        tasks.className = 'hide';
        current.className = '';
        stop.className = '';
    }
    setInterval(updateCurrent, 1000);
    fetch.disabled = false;
    upload.disabled = false;
    local.disabled = false;
    message.innerHTML = 'Ready';
}

if (window.cordova) {
    document.addEventListener('deviceready', ready, false);
} else {
    window.addEventListener('load', ready, false);
}
