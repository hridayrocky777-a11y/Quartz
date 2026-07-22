const tasksContainer=document.querySelector('.tasks');
const modal=document.getElementById('taskModal');
const fab=document.querySelector('.floating-add');
const addBtn=document.querySelector('.add-btn');
const createBtn=document.querySelector('.actions button:last-child');
const cancelBtn=document.querySelector('.actions button:first-child');
const inputs=modal.querySelectorAll('input,textarea,select');
const progressFill=document.querySelector('.progress-fill');
const progressText=document.querySelector('.card p');
const pointsEl=document.querySelectorAll('.card h1')[0];
let tasks=JSON.parse(localStorage.getItem('quartzTasks')||'[]');
let points=Number(localStorage.getItem('quartzPoints')||125);

function save(){
 localStorage.setItem('quartzTasks',JSON.stringify(tasks));
 localStorage.setItem('quartzPoints',points);
 render();
}
function openModal(){modal.classList.remove('hidden')}
function closeModal(){modal.classList.add('hidden')}
fab.onclick=openModal; addBtn.onclick=openModal; cancelBtn.onclick=closeModal;
createBtn.onclick=()=>{
 const [title,desc,subject,priority,due]=inputs;
 if(!title.value.trim()) return alert("Enter a task title.");
 tasks.push({title:title.value,desc:desc.value,subject:subject.value,priority:priority.value,due:due.value,done:false});
 inputs.forEach(i=>i.value="");
 closeModal(); save();
};
function render(){
 tasksContainer.innerHTML="";
 let done=0;
 tasks.forEach((t,i)=>{
   if(t.done) done++;
   const card=document.createElement('div');
   card.className='task-card '+t.priority.toLowerCase();
   card.innerHTML=`<input type="checkbox" ${t.done?"checked":""}>
   <div class="task-content"><h3>${t.title}</h3><p>${t.subject} • ${t.priority} Priority</p></div>
   <div class="due">${t.due||"No date"}</div>
   <button>Edit</button><button>Delete</button>`;
   const cb=card.querySelector("input");
   cb.onchange=()=>{
      if(!t.done && cb.checked) points+=5;
      if(t.done && !cb.checked) points=Math.max(0,points-5);
      t.done=cb.checked; save();
   };
   card.querySelectorAll("button")[0].onclick=()=>{
      const nt=prompt("Edit task",t.title);
      if(nt){t.title=nt; save();}
   };
   card.querySelectorAll("button")[1].onclick=()=>{
      if(confirm("Delete task?")){tasks.splice(i,1); save();}
   };
   tasksContainer.appendChild(card);
 });
 const percent=tasks.length?Math.round(done/tasks.length*100):0;
 progressFill.style.width=percent+"%";
 progressText.textContent=`${done} / ${tasks.length} Tasks Completed`;
 pointsEl.textContent=points;
}
document.querySelector('.toolbar input').addEventListener('input',e=>{
 const q=e.target.value.toLowerCase();
 document.querySelectorAll('.task-card').forEach(c=>{
  c.style.display=c.innerText.toLowerCase().includes(q)?"grid":"none";
 });
});
render();
const themeToggle = document.querySelector('.theme-toggle-btn');
let isLightTheme = false;

function applyTheme(theme) {
    document.body.classList.toggle('light-theme', theme === 'light');
    document.body.classList.toggle('dark-theme', theme === 'dark');
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to normal mode' : 'Switch to light mode');
        themeToggle.title = theme === 'light' ? 'Switch to normal mode' : 'Switch to light mode';
        themeToggle.innerHTML = theme === 'light'
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path></svg>';
    }
}

themeToggle?.addEventListener('click', () => {
    isLightTheme = !isLightTheme;
    const nextTheme = isLightTheme ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('quartz-theme', nextTheme);
    showNotification(nextTheme === 'light' ? 'Light mode enabled' : 'Normal mode restored', 'default');
});

const savedTheme = localStorage.getItem('quartz-theme');
if (savedTheme === 'light') {
    isLightTheme = true;
    applyTheme('light');
} else {
    applyTheme('dark');
}

function updateMuteLabel() {
  muteButton.textContent = state.muted ? 'Unmute' : 'Mute';
}

function restoreNotes() {
  const saved = localStorage.getItem('quartz-focus-notes');
  if (saved) {
    notesInput.value = saved;
    state.notes = saved;
  }
}