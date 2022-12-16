// Select Elements
const taskContainer = document.querySelector('.tasks-container');
const addTask = document.getElementById('add-task');
const newTaskBtn = document.getElementById('new-task-btn');
const newTaskModule = document.querySelector('.adding-task-container');
const closeBtn = document.getElementById('close-box');
const noTasks = document.querySelector('.no-tasks');
const progCircle = document.querySelector('.meter-1');
const progValue = document.querySelector('#done span');
const userName = document.getElementById('username');
const profileImg = document.getElementById('p-pic');
const profileInput = document.querySelector('.inputfile');
// showing results selectors
const endBtn = document.getElementById('end-day');
const rContainer = document.querySelector('.showing-results');
const rUserName = document.getElementById('r-username');
const rProfilePic = document.getElementById('r-p-pic');
const rDate = document.getElementById('date');
const rTasks = document.getElementById('r-tasks');
const rDone = document.getElementById('r-done');
const rTime = document.getElementById('r-time');
const clearBtn = document.getElementById('clear-btn');


// load Items
window.addEventListener('DOMContentLoaded', setupItems);

let taskCount, completed;



// Event Listeners

// showing the add task module
addTask.addEventListener('click', function() {
  newTaskModule.classList.add('add-new');
  closeBtn.onclick = function() {
    clearInput();
  }
})

// handling the add btn from the module
newTaskModule.onsubmit = async () => {
  let title = document.getElementById('new-title').value;
  let details = document.getElementById('new-details').value;
  let id = new Date().getTime().toString();

  createTask(title, details, id);
  // add Task to Local Storage
  addToLocalStorage(id, title, details)

  clearInput();
}

// change image btn
profileInput.onchange = function() {
  const choosedFile = this.files[0];

  if (choosedFile) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      profileImg.setAttribute('src', reader.result);
      rProfilePic.setAttribute('src', reader.result);
      addImgToLS(reader.result);
    });
    reader.readAsDataURL(choosedFile);
  };
  // update localStorage
  
}

// end day button
endBtn.onclick = function() {
  Swal.fire({
    title: 'Are you sure?',
    text: "the list will be cleared after you see the results, only do this at the end of the day",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, I am Done'
  }).then((result) => {
    if (result.isConfirmed) {
      showResult();
    }
  })
}


// functions

// creating the Task and add to Task area
function createTask(title, details, id, time = '00:00') {
  let task = document.createElement('div');
  task.className = 'item';
  task.dataset.id = id;
  task.innerHTML = `
  <div class="task-info">
              <h3>${title}</h3>
              <div class="task-btns">
                <span class="delete-btn">
                  <i class="fas fa-trash"></i>
                </span>
                <span class="tools-btn">
                  <i class="fa-solid fa-circle-question"></i>
                </span>
                <span class="note-btn">
                <i class="fa-regular fa-square"></i>
                </span>
              </div>
            </div>
            <p id="details" class="hide">
            ${details}
            </p>`;
  if (!(time === '00:00')) {
    task.classList.add('done');
    task.querySelector('.note-btn').innerHTML = `<i class="fa-solid fa-square-check"></i>`;
  }
  if (taskContainer.children.length === 1) {
    noTasks.classList.add('not-true')
  }
  taskContainer.appendChild(task);
  toggleDetails();
  doneclick(id);
  removeclick(id);
}

// handle the details btn
function toggleDetails() {
  let infoBtn = document.querySelectorAll('.tools-btn');
  let info = document.querySelectorAll('#details');
  infoBtn.forEach((btn , i) => {
    btn.onclick = () => {
      info[i].classList.toggle('hide');
      if (!info[i].classList.contains('hide')) {
        infoBtn[i].innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;
      }
      else {
        infoBtn[i].innerHTML = `<i class="fa-solid fa-circle-question"></i>`;
      }
    } 
  })
}

// handle the done btn
function doneclick(id) {
  let doneBtn = document.querySelectorAll('.note-btn');
  let item = document.querySelectorAll('.item');
  doneBtn.forEach((btn , i) => {
    btn.onclick = async () => {
      if (!item[i].classList.contains('done')) {
        const { value: time } = await Swal.fire({
          icon: 'success',
          title: 'Well Done',
          inputLabel: 'how many hours did it take?',
          input: 'text',
          inputAttributes: {
            placeholder: 'hr:min for example : 02:30',
            required: true
          },
          inputValidator: (value) => {
            let pattern = /[0-9]{2}:[0-9]{2}/;
            if (!pattern.test(value)) {
              return 'make sure to use this format => hr:min';
            }
          },
          showCancelButton: true,
        })
        if (time) {
          item[i].classList.add('done');
          doneBtn[i].innerHTML = `<i class="fa-solid fa-square-check"></i>`;
          completed++;
          progIncrease(); 
          addTimeToLocalStorage(item[i].dataset.id, time);
        }
      }
      else {
        item[i].classList.remove('done');
        addTimeToLocalStorage(item[i].dataset.id, '00:00'); 
        doneBtn[i].innerHTML = `<i class="fa-regular fa-square"></i>`;
      }
    } 
  })
}

// handle the delete btn
function removeclick(id) {
  let infoBtn = document.querySelectorAll('.delete-btn');
  let item = document.querySelectorAll('.item');
  infoBtn.forEach((btn , i) => {
    btn.onclick = () => {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          removeFromLocalStorage(item[i].dataset.id);
          item[i].remove();
          progIncrease();
          Swal.fire(
            'Deleted!',
            'Your Task has been removed.',
            'success'
          )
          if (taskContainer.children.length === 1) {
            noTasks.classList.remove('not-true');
          }
        }
      })
    } 
  })
}

// clearing input fuilds
function clearInput() {
  document.getElementById('new-title').value = '';
  document.getElementById('new-details').value = '';
  newTaskModule.classList.remove('add-new');
}


// add to the Local Storage
function addToLocalStorage(id, title, details ) {
  const theTask = { id, title, details, time: '00:00', };
  let items = getLocalStorage();
  items.push(theTask);
  updatecounter(items);
  localStorage.setItem('list', JSON.stringify(items));
}

// remove from local storage
function removeFromLocalStorage(id) {
  let items = getLocalStorage();

  items = items.filter(function(item) {
    if (item.id !== id) {
      return item
    }
  });
  updatecounter(items);
  localStorage.setItem('list', JSON.stringify(items));
}

function setupItems() {
  let items = getLocalStorage();
  let info = getUserLocalStorage();
  updatecounter(items);
  if (info.length == 0) {
    welcome();
  } else {
    profileImg.setAttribute('src', info[0].userimg); 
    rProfilePic.setAttribute('src', info[0].userimg); 
    userName.textContent = info[0].username;
  }

  if (items.length > 0) {
    items.forEach(function(item) {
      createTask(item.title, item.details, item.id, item.time)
    })
  }
  
}

function addTimeToLocalStorage(id, time) {
  let items = getLocalStorage();

  items = items.map((item) => {
    if (item.id === id) {
      item.time = time;
    };
    return item;
  })
  updatecounter(items);
  localStorage.setItem('list', JSON.stringify(items));
}



// Local Storage for User info

function addImgToLS(img) {
let info = getUserLocalStorage();

info = info.map((u) => {
  // u[0].userimg = img;
  u.userimg = img
  return u;
})
  localStorage.setItem('user', JSON.stringify(info));
}

function infoLocalStorage(username, userimg) {
  const user = {username, userimg};
  let info = getUserLocalStorage();

  info.push(user);
  localStorage.setItem('user', JSON.stringify(info));
}



// get local storage for tasks
function getLocalStorage() {
  return localStorage.getItem('list') ? JSON.parse(localStorage.getItem('list')) :[];
}

// get local storage for user
function getUserLocalStorage() {
  return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) :[];
}

// firs time taking input

async function welcome() {
  const steps = ['1', '2', '3', '4', '5']
  const Queue = Swal.mixin({
    progressSteps: steps,
    confirmButtonText: 'Next',

    showClass: { backdrop: 'swal2-noanimation' },
    hideClass: { backdrop: 'swal2-noanimation' }
  })
  
  const { value: inputName } = await Queue.fire({
    title: 'Welcome to my ToDo List',
    text: 'this app was built to help you get the best out of your day',
    input: 'text',
    inputAttributes: {
      required: true,
      placeholder: 'What is your name?',
      autoComplete: 'none'
    },
    currentProgressStep: 0,
    showClass: { backdrop: 'swal2-noanimation' },
  })
  await Queue.fire({
    title: 'how to use it?',
    text: 'Visit me in the morning and add all your tasks for the day, with a good description answering Why you want to do Them',
    currentProgressStep: 1
  })
  await Queue.fire({
    text: 'All your data will be saved automaticly',
    currentProgressStep: 2,
    confirmButtonText: 'OK',
    showClass: { backdrop: 'swal2-noanimation' },
  })
  await Queue.fire({
    text: 'Just come back whenever you finish a task and tell me how much time did it take',
    currentProgressStep: 3,
    confirmButtonText: 'OK',
    showClass: { backdrop: 'swal2-noanimation' },
  })
  await Queue.fire({
    text: 'at the end of the day, I will give you a report with your Amazing achievements',
    currentProgressStep: 4,
    confirmButtonText: 'OK',
    showClass: { backdrop: 'swal2-noanimation' },
    confirmButtonText: "Let's Go!"
  });
  userName.textContent = inputName;
  rUserName.textContent = inputName;
  infoLocalStorage(inputName, './imgs/PngItem_1468479.png');
}

function updatecounter(arr) {
  taskCount = arr.length;
  let i = 0;
  arr.forEach((item) => {
    if (!(item.time === '00:00')) {
      i++;
    }
  })
  completed = i;
  progIncrease()
}

// handle the progress line
function progIncrease() {
  if (taskCount === 0){
    progValue.textContent = '0.00';
  } else {

    progValue.textContent = (completed / taskCount * 100).toFixed(2);
  }
  let progCChange = ((completed / taskCount) * 173 );
  progCircle.style.strokeDashoffset = 173 - progCChange;
}

// show results
function showResult() {
  rTasks.textContent = taskCount;
  if (taskCount === 0) {
    rDone.textContent = `0%`;
  } else {
    rDone.textContent = `${(completed / taskCount * 100).toFixed(2)}%`;
  }

  let items = getLocalStorage();
  let hrs = 0;
  let mins = 0;
  items.forEach((item) => {
    hrs += (parseInt(item.time.split(':')[0]));
    mins += (parseInt(item.time.split(':')[1]));
  })
  hrs = hrs < 10 ? `0${hrs}`: hrs;
  mins = mins < 10 ? `0${mins}`: mins;
  rTime.textContent = `${hrs}:${mins} hrs`;
  rContainer.classList.add('add-new');

  clearBtn.addEventListener('click', clearList);
}

function clearList() {
  localStorage.removeItem("list");
  taskContainer.innerHTML = `<p class="no-tasks">No Tasks For Today?</p>`
  rContainer.classList.remove('add-new');
  window.location.reload();
}
