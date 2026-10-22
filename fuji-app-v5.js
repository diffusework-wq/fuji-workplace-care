'use strict';
const $ = id => document.getElementById(id);
const treatments = {shoulder:'肩頸舒緩',back:'背部放鬆',arm:'手臂舒展',cupping:'拔罐'};
const services = {
 day:{en:'SINGLE SESSION',title:'先安排一次，\n了解同仁的需求。',description:'第一次安排員工推拿，可以先從單場體驗開始。依人數與可用時間安排服務，讓同仁選擇想放鬆的部位，再依參與情況討論後續合作。',use:'員工福利、部門活動、首次試辦',duration:20,format:'事前確認服務內容、場地、人員安排與費用',label:'單場體驗'},
 regular:{en:'REGULAR SERVICE',title:'固定到公司服務，\n方便同仁定期放鬆。',description:'依公司作息安排每月或其他固定頻率的到府服務。事先確認日期、時段與名額，讓同仁方便安排，再依使用情況調整。',use:'常態員工福利、部門輪流安排',duration:30,format:'事先約定頻率、名額、費用、改期與取消方式',label:'定期到場'},
 event:{en:'CORPORATE EVENTS',title:'公司活動當天，\n也能安排推拿放鬆。',description:'員工日或公司活動可搭配推拿體驗，依參加人數安排時段與等候區。若需要拔罐，會另外確認獨立空間、服務時間與參加者意願。',use:'員工日、公司活動、部門聚會',duration:15,format:'依活動人數、場地及時間確認可安排的項目',label:'企業活動'}
};
const tabs = [...document.querySelectorAll('[data-service]')];
const choices = [...document.querySelectorAll('input[name="treatments"]')];
const picks = [...document.querySelectorAll('[data-treatment]')];
function showForm(){if(!$('plan-result').hidden){$('plan-result').hidden=true;$('plan-form').hidden=false;}}
function selectedKeys(){return choices.filter(input=>input.checked).map(input=>input.value);}
function updateSelection(announce=false){
 const selected=selectedKeys();
 picks.forEach(button=>{const active=selected.includes(button.dataset.treatment);button.setAttribute('aria-pressed',String(active));button.querySelector('.pick-label').textContent=active?'已加入需求':'加入需求';button.querySelector('[aria-hidden]').textContent=active?'✓':'＋';});
 $('cupping-note').hidden=!selected.includes('cupping');
 if(announce)$('selection-status').textContent=selected.length?'已選擇：'+selected.map(key=>treatments[key]).join('、')+'。可繼續選擇，或填寫下方的合作需求單。':'目前未選擇服務，仍可先填寫合作需求單。';
 showForm();
}
picks.forEach(button=>button.addEventListener('click',()=>{const choice=choices.find(input=>input.value===button.dataset.treatment);choice.checked=!choice.checked;updateSelection(true);}));
choices.forEach(input=>input.addEventListener('change',()=>updateSelection(true)));
function setService(key,focus=false){
 const item=services[key];if(!item)return;
 tabs.forEach(tab=>{const active=tab.dataset.service===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();});
 $('service-panel').setAttribute('aria-labelledby','tab-'+key);
 $('service-en').textContent=item.en;
 $('service-title').replaceChildren(...item.title.split('\n').flatMap((line,i)=>i?[document.createElement('br'),document.createTextNode(line)]:[document.createTextNode(line)]));
 $('service-description').textContent=item.description;$('service-use').textContent=item.use;
 const number=document.createElement('strong');number.textContent=item.duration;
 $('service-duration').replaceChildren(number,document.createTextNode(' 分鐘／人為排程範例，實際時間另議'));
 $('service-format').textContent=item.format;
 const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';
 $('service-cta').replaceChildren(document.createTextNode('整理'+item.label+'需求 '),arrow);
 $('plan-type').value=key;$('duration').value=String(item.duration);showForm();
}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>setService(tab.dataset.service));tab.addEventListener('keydown',event=>{
 let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
 event.preventDefault();setService(tabs[next].dataset.service,true);
});});
$('plan-type').addEventListener('change',event=>setService(event.target.value));
$('regular-cta').addEventListener('click',()=>setService('regular'));
const menu=document.querySelector('.menu-toggle'),nav=$('navigation');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','開啟導覽選單');nav.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'關閉導覽選單':'開啟導覽選單');nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
$('plan-form').addEventListener('submit',event=>{
 event.preventDefault();if(!$('plan-form').reportValidity())return;
 const people=Number($('people').value),duration=Number($('duration').value),hours=Number($('hours').value);
 if(!Number.isInteger(people)||people<1||people>500)return;
 const buffer=15,changeover=5,capacity=Math.floor((hours*60-buffer)/(duration+changeover)),staff=Math.ceil(people/capacity);
 const company=$('company').value.trim()||'尚未填寫',label=services[$('plan-type').value].label,selected=selectedKeys();
 const selectedText=selected.length?selected.map(key=>treatments[key]).join('、'):'尚未決定，希望了解建議';
 const warning='以上假設每人的服務時間相同。實際安排需考慮項目、換場與設備清潔；多項搭配或拔罐的時間須另行確認。';
 const cup=selected.includes('cupping')?'\n拔罐安排：需另確認個人狀況、施作方式及遮蔽空間；依各人意願安排。':'';
 $('staff-count').textContent=staff;
 $('capacity-note').textContent='若每人可用 '+duration+' 分鐘、另留 '+changeover+' 分鐘換場，每位人員在 '+hours+' 小時內可排 '+capacity+' 位，預留至少 '+buffer+' 分鐘緩衝。'+warning;
 $('brief').value='馥肌｜企業合作需求單\n\n公司／團隊：'+company+'\n服務地區：台中市（詳細地點待確認）\n想了解的服務：'+selectedText+'\n合作形式：'+label+'\n參與人數：'+people+' 人\n每人預留時間：'+duration+' 分鐘（實際時間待確認）\n當天服務時數：'+hours+' 小時\n場地：'+$('space').value+'\n初步人員估算：約 '+staff+' 位\n\n排程假設：每人另留 '+changeover+' 分鐘換場；每位服務人員預留至少 '+buffer+' 分鐘緩衝，可排 '+capacity+' 位。進退場與交通另計。\n'+warning+cup+'\n\n合作前待確認：日期、項目組合、個別服務時間、服務人員、設備、清潔與隱私、費用、請款及取消條件。'+(label==='定期到場'?'\n定期合作另議：到場頻率、名額、改期與意見回饋方式；非個人會員訂閱。':'')+'\n\n此為需求整理，尚未送出，不代表預約或報價。';
 $('plan-form').hidden=true;$('plan-result').hidden=false;$('action-status').textContent='';
 $('result-title').focus({preventScroll:true});$('plan-result').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
});
$('edit-plan').addEventListener('click',()=>{showForm();$('company').focus({preventScroll:true});});
$('copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('brief').value);$('action-status').textContent='需求單已複製，尚未傳送給任何服務窗口。';}catch{const brief=$('brief');brief.focus();brief.select();$('action-status').textContent='請使用 Ctrl+C（或 ⌘C）複製已選取的需求單。';}});
$('download-brief').addEventListener('click',()=>{const blob=new Blob(['\uFEFF'+$('brief').value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='馥肌-企業合作需求單.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('action-status').textContent='需求單已提供下載；尚未送出或成立預約。';});
updateSelection();
