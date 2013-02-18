var server_url = 'https://cworklog.com';
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
var setup = document.getElementById('setup');
var setupOk = document.getElementById('setup-ok');
var form = document.getElementById('form');
var running;

var click = window.cordova ? 'tap' : 'click';

setup.addEventListener(click, function() {
    form.className = '';
}, false);

setupOk.addEventListener(click, function() {
    form.className = 'hide';
}, false);

function loginAndFetchTimeLogs(){
    localStorage['user'] = user.value;
    localStorage['pass'] = pass.value;

    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
        offline = false;
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
        offline = true;
        message.innerHTML = 'Offline mode: using stored worklogs';
        var worklogs = JSON.parse(localStorage['worklogs']);
        populateTasks(worklogs);
    }, false);

    var query = '?u=' + encodeURIComponent(user.value) +
        '&p=' + encodeURIComponent(pass.value);

    message.innerHTML = 'Fetching tasks ...';

    xhr.open('GET', server_url + '/api_worklog.php' + query, true);
    xhr.send(null);
}

fetch.addEventListener('click', function() {
   loginAndFetchTimeLogs();
}, false);


/** 
 * Upload time logs stored in local storage
 * to cworklog server
 */
function uploadTimeLogs(timelogs){
    timelogs = timelogs || JSON.parse(localStorage['timelogs'] || '[]');
     
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
        message.innerHTML = 'Offline mode: Cannot upload time logs';
    }, false);

    message.innerHTML = 'Uploading times ...';

    var json = {
        u: user.value,
        p: pass.value,
        entries: timelogs
    };

    xhr.open('POST', server_url + '/api_timelog.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(json));
}

upload.addEventListener('click', function() {
    localStorage['user'] = user.value;
    localStorage['pass'] = pass.value;
    uploadTimeLogs();
}, false);

function populateTasks(worklogs) {
    list.innerHTML = '';

    worklogs.forEach(function(item) {
        var li = document.createElement('li');
        li.innerHTML = item.title + ' (' + parseFloat(item.rate).toFixed(2) + '/hr) <div class="imglinks"><a target="_blank" title="View Work Log" href="'+ server_url +'/work_log.php?wid='+item.id+'"><img style="width:24px;" src="images/view_details.gif"/></a> <a target="_blank" title="View Detailed Time Log" href="'+ server_url +'/time_log_show.php?wid='+item.id+'"><img style="width:24px;" src="images/timelog.png"/></a></div>';
        
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
    
    var timelog = {
       work_log_id: running.id,
       start_time: new Date(running.startTime).toISOString(),
       stop_time: null
    }
    
    var timelogs = [];
    timelogs.push(timelog);
    uploadTimeLogs(timelogs);
    
    tasks.className = 'hide';
    current.className = '';
    $('#stopSliderContainer').show();
    toggleRunning('on');
    message.innerHTML = 'Task started';
}


function stopCurTimeLog(){
         if (!running){ return false; }
         
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
          $('#stopSliderContainer').hide();
          message.innerHTML = 'Task stopped';
          
          //go ahead and upload to server
          uploadTimeLogs();
}

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

local.addEventListener(click, function() {
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

timelogsClose.addEventListener(click, function() {
    timelogs.className = 'hide';
}, false);

function ready() {
    var hasUser = false;
    var savedUser = localStorage['user'];
    var savedPass = localStorage['pass'];
    if (savedUser !== undefined) {
        user.value = savedUser;
        hasUser = true;
    }
    if (savedPass !== undefined) {
        pass.value = savedPass;
        loginAndFetchTimeLogs();
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
        $('#stopSliderContainer').show();
        toggleRunning('on');
    }
    setInterval(updateCurrent, 1000);
    fetch.disabled = false;
    upload.disabled = false;
    local.disabled = false;
    message.innerHTML = hasUser ? 'Ready' : 'Please setup';
    switches();
    
    /*
    $('#sldStop').sliderbutton({
		text: "Stop Time Clock",
      slide: function(event, ui){
         if (ui.value >= 75){ 
            $(this).css('color', 'red');
         }
      },
      // {sliderbuttonslide}: Triggered when the slider handle is moving. The callback is provided the arguments event and ui where ui.value is the current value (position) of the handle in the range [0,100]. 0 means the slider is at the start (idle position) and 100 means the slider is at the end (activated).
		activate: function(){
        stopCurTimeLog();
      }
	});*/
}

if (window.cordova) {
    document.addEventListener('deviceready', ready, false);
} else {
    window.addEventListener('load', ready, false);
}

/*Switches Widget Plugin
*	This plugin creates native-like switches.  Each element with the secified class
*		and correct DOM structure will create a working switch.  There is no 'universal'
*		Widget solution for every theme.  It should be customized.
*/
function switches(){

	var switches = document.getElementsByClassName('switch');

	for (var i = 0; i < switches.length; i++)
	{
		switches[i].firstChild.ontouchstart = function(e)
		{
				leftVal = parseInt(this.style.left, 10);
				touch = event.touches[0];
				x = touch.pageX;

				this.ontouchmove = function(e){
					pos = e.changedTouches[0].pageX;
					curleftVal = parseInt(this.style.left, 10);
					if( pos < x){
						if(curleftVal> 0){
							this.style.left = leftVal - (x - pos)+"px";
							if( curleftVal >= 49  && this.classList.contains('on') === false){this.className = "on"; }
							if(curleftVal <= 50 && this.classList.contains('on') === true){this.className = "";}  

						}else{
							this.style.left = 0+"px";
							this.className = "";	
						}
					}

					if( pos > x){
						if(curleftVal<100){
							this.style.left = leftVal + (pos - x)+"px";

							if( curleftVal >= 49  && this.classList.contains('on') === false){this.className = "on"; }
							if(curleftVal <= 50 && this.classList.contains('on') === true){this.className = "";}  

						}else{
							this.style.left = 100+"px";	
							this.className = "on"; 
						}
					}

				}

				this.ontouchend = function(e){
					curleftVal = parseInt(this.style.left, 10);
					switchID = this.parentNode.id
					if(curleftVal >= 49){if(curleftVal != 100){this.style.left = "100px"; this.className = "on";}  switchCallback({state:"on", id:switchID});}
					if(curleftVal <= 50){if(curleftVal != 100){this.style.left = "0px"; this.className = "";} switchCallback({state:"off", id:switchID});}	  	
				}
		}
	}



}

function toggleRunning(state){
   if (state === true){ state = 'on'; }
   if (state == 'on'){
      $('div#toggle-stop div').removeClass('off').addClass('on').css('left', '100px');
   }else{
      $('div#toggle-stop div').removeClass('on').addClass('off').css('left', '0px');
      stopCurTimeLog();
   }
}

//Switch Widget Callback
	//@ switchID - ID of the switch
	//@ state - Current end state of the switch
function switchCallback(args){
	var switchID = args.id || null;
	var state = args.state || null;

		if(switchID === "toggle_running" && state === "on"){
			toggleRunning('on');
		}
		if(switchID === "toggle_running" && state === "off"){
         toggleRunning('off');
		}
	/*End Theme Specific Editible Code*/
}	