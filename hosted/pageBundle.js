(()=>{var e={264:e=>{e.exports={PlayerDisplay:e=>{const[t,a]=React.useState(e.defaultText);if(React.useEffect((async()=>{const e=(await fetch("/getPlayers")).json();a(e)})),0===t.length)return React.createElement("div",null,React.createElement("h2",null,"Loading Players..."));const n=t.map((e=>React.createElement("table",null,React.createElement("tr",null,React.createElement("th",null,"Username"),React.createElement("th",null,"Color")),React.createElement("tr",{key:e.username},React.createElement("td",null,e.username),React.createElement("td",{style:{backgroundColor:e.color}},e.color),React.createElement("td",null,e.items)))));return React.createElement("div",null,React.createElement("h3",null,"Current Players"),n)}}},603:e=>{const t=e=>{document.getElementById("createResponse").textContent=e};e.exports={handleError:t,sendPost:async(e,a,n)=>{const l=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),o=await l.json();if(document.getElementById("createResponse").textContent="",o.error)return t(o.error);o.message&&(document.getElementById("createResponse").textContent=o.message),o.redirect&&(window.location=o.redirect),o.username&&(document.getElementById("createResponse").textContent="Logged in as "+o.username,document.getElementById("resetBtn").disabled=!1,document.getElementById("signupButton").disabled=!0,document.getElementById("loginButton").disabled=!0),n&&n(o)},hideError:()=>{document.getElementById("createResponse").textContent=""}}},689:(e,t,a)=>{"use strict";a.r(t),a.d(t,{bgRect:()=>n,clouds:()=>r,getData:()=>s,rects:()=>l,specialObjects:()=>o});class n{constructor(e,t,a,n,l){this.x=e,this.y=t,this.width=a,this.height=n,this.color=l,this.hSpeed=n*a/15,this.vSpeed=0}}let l=[],o=[],r=[];const s=async()=>{let e=await fetch("/getLevel",{method:"GET",headers:{Accept:"application/json"}});const t=await e.json();t.level&&t.level.rects&&t.level.specialObjects&&(l=t.level.rects,o=t.level.specialObjects),t.level.clouds&&t.level.clouds.length>0&&(r=[...t.level.clouds])}},802:(e,t,a)=>{"use strict";a.r(t),a.d(t,{init:()=>O});const n=(e,t,a,n,l,o,r=!0)=>{n&&(l*=-1),r&&a.clearRect(0,0,640,480),a.save(),a.beginPath(),a.arc(e,t-3*l,3,0,2*Math.PI),a.moveTo(e,t),a.lineTo(e,t+5*l),a.lineTo(e-2*l,t+8*l),a.moveTo(e,t+5*l),a.lineTo(e+2*l,t+8*l),a.moveTo(e-3*l,t+3*l),a.lineTo(e+3*l,t+3*l),o&&(a.strokeStyle=o),a.stroke(),a.closePath(),a.restore()},l=(e,t,a,n,l,o,r)=>{l.save(),l.beginPath(),l.moveTo(e,t),l.lineTo(e+a,t),l.lineTo(e+a,t+n),l.lineTo(e,t+n),l.closePath(),r?(l.fillStyle=o,l.fill()):(l.strokeStyle=o,l.lineWidth=3,l.stroke()),l.restore()};var o=a(689);const r=async(e,t)=>{const a=`name=${e}&item=${t}&_csrf=${document.querySelector("#_csrf").value}`;(async e=>{let t;switch(e.status){case 200:t=await e.json();break;case 204:break;default:console.error(t)}})(await fetch("/updateItems",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"application/json"},body:a}))};let s,c,d;const i=[];let m={};const u={screwattack:document.getElementById("screwattack"),morphball:document.getElementById("morphball"),yellowswitch:document.getElementById("yellowswitch")},h={screwattack:{obtained:!1,collected:H},morphball:{obtained:!1,collected:$},yellowswitch:{collected:X},fire:{collected:$}},p={x:-450,y:690,halfWidth:4,halfHeight:7,newX:300,newY:300,scale:1,name:"",flip:!1};let g,y,f,w,E=0,v=0,b=!0,R=!1,S=!1,x=!1,P=!1,B=0,I=[],k=0,T=0,C=0;const O=(e,t)=>{e&&e.username&&e.items&&e.color?(p.name=e.username,E=e.color,e.items&&_(e.items)):console.log(e),console.log("initting"),m.name=p.name,m.color=E,m.movement=[],f=new Audio("assets/sound/buttonClick.wav"),f.volume=.25,w=new Audio("assets/sound/itemGet.wav"),w.volume=.25;let a=document.querySelector("#canvas_player"),l=document.querySelector("#canvas_walkers"),r=document.querySelector("#canvas_bg");document.getElementById("resetBtn").onclick=W,s=l.getContext("2d"),c=a.getContext("2d"),d=r.getContext("2d"),g=l.width,y=l.height,document.addEventListener("keydown",Y),document.addEventListener("keyup",A),n(300,300,c,!1),o.clouds&&o.clouds.length>0&&o.clouds.forEach((e=>{i.push(new o.bgRect(630*Math.random()+5,470*Math.random()+5,10*Math.random()+30,4*Math.random()+3,e))}));for(let e=0;e<10;e++)i.push(new o.bgRect(640*Math.random(),480*Math.random(),10*Math.random()+30,4*Math.random()+3,"rgba(0,0,0,0.3)"));j(),s.fillStyle="black",p.x=p.y=300,setInterval(M,1e3/60),setInterval(j,1e3/15)},M=()=>{S?X():(F(),n(p.x+T,p.y+C,c,p.flip,p.scale)),L()},F=()=>{let e=0,t=0;I[65]&&(e=-3),I[68]&&(e=3),t=p.flip?-5:5,x?I[87]&&(C-=((e,t)=>{let a=4,n=0;return t&&(a=-4),1===e.scale?(e.scale=.1,e.halfWidth=1,e.halfHeight=1,n=-a):(e.scale=1,e.halfWidth=4,e.halfHeight=7,n=-3*a),e.y+=n,n})(p,p.flip),x=!1,B=30,e=0,t=0):P&&(B-=1,B<=0&&(x=!0)),p.newX=p.x+e,p.newY=p.y+t,q(p,e,t)?(T+=p.x-p.newX,C+=p.y-p.newY,p.x=p.newX,p.y=p.newY):(p.x+=e,p.y+=t,T-=e,C-=t),N(p)},L=()=>{o.rects.forEach((e=>{l(e.x+T,e.y+C,e.width,e.height,c,e.color,!0)})),o.specialObjects.forEach((e=>{"fire"!==e.id&&c.drawImage(u[e.id],e.x+T,e.y+C)}))},j=()=>{d.clearRect(0,0,640,480),l(0,0,g,y,d,"white",!0),k+=0,i.forEach((function(e){e.hSpeed=1*Math.cos(k),e.vSpeed=1*Math.sin(k),e.x+=e.hSpeed,e.y+=e.vSpeed,e.x>g+20?e.x=-20:e.x<-20&&(e.x=g+20),e.y>y+20?e.y=-20:e.y<-20&&(e.y=y+20),l(e.x,e.y,e.width,e.height,d,e.color,!0)}))},q=(e,t,a)=>{let n=!1;return o.rects.forEach((l=>{D(e,l)&&(n=!0,(((e,t)=>e.y+(e.halfHeight-2)<t.y&&e.newY+(e.halfHeight+2)>=t.y)(e,l)||((e,t)=>e.y-(e.halfHeight-2)>=t.y+t.height&&e.newY-(e.halfHeight+2)<t.y+t.height)(e,l))&&(e.newY-=a,R||(b=!0)),(((e,t)=>e.x-(e.halfWidth-2)>=t.x+t.width&&e.newX-(e.halfWidth+2)<t.x+t.width)(e,l)||((e,t)=>e.x+(e.halfWidth-2)<=t.x&&e.newX+(e.halfWidth+2)>=t.x)(e,l))&&(e.newX-=t))})),n},D=(e,t)=>e.newX-e.halfWidth<t.x+t.width&&e.newX+e.halfWidth>t.x&&e.newY-e.halfHeight<t.y+t.height&&e.newY+e.halfHeight>t.y,N=e=>{o.specialObjects.forEach((t=>{D(e,t)&&(h[t.id].collected(),"fire"!==t.id&&o.specialObjects.splice(o.specialObjects.indexOf(t),1))}))},_=e=>{console.log(e),!0===e.morphball&&($(!1),console.log(e)),!0===e.screwattack&&H(!1)};function $(e=!0){document.getElementById("morphball").style.display="inline",document.getElementById("moveInstructions").innerHTML="Use '<strong>A</strong>', '<strong>D</strong>', and '<strong>W</strong>' to move, ",x=!0,P=!0,!0===e&&(r(p.name,"morphball"),w.play())}function H(e=!0){document.getElementById("screwattack").style.display="inline",document.getElementById("spaceInstructions").innerHTML="<strong>SPACE</strong> to ultra flip",R=!0,!0===e&&(r(p.name,"screwattack"),w.play())}const W=()=>{p.x=300,p.y=300,p.flip=!1,p.newX=300,p.newY=300,T=0,C=0};function X(){S||(i.push(new o.bgRect(640*Math.random(),480*Math.random(),10*Math.random()+30,4*Math.random()+3,E)),S=!0),v<254&&(v+=.2,p.y+=.5),n(p.x+T,p.y+C,c,p.flip,p.scale,`#000000${(255-v).toString(16).substring(0,2)}`),i.forEach((e=>{i.indexOf(e)!=i.length-1?e.color=`rgba(${v}, ${v}, ${v}, 0.1)`:e.color=`${E}${v.toString(16).substring(0,2)}`})),o.rects.forEach((e=>{e.color=`rgba(${v}, ${v}, ${v}, 0.5)`}))}const Y=e=>{switch(e.keyCode){case 65:case 68:I[e.keyCode]=!0;break;case 87:x&&(I[e.keyCode]=!0);break;case 32:e.preventDefault(),I[e.keyCode]||(b||R)&&(p.flip=!p.flip,b=!1),I[e.keyCode]=!0}},A=e=>{switch(e.keyCode){case 65:case 68:case 87:case 32:I[e.keyCode]=!1}}}},t={};function a(n){var l=t[n];if(void 0!==l)return l.exports;var o=t[n]={exports:{}};return e[n](o,o.exports,a),o.exports}a.d=(e,t)=>{for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{const e=a(603),t=a(689),n=a(802),l=(a(264),t=>{t.preventDefault(),e.hideError();const a=t.target.querySelector("#user").value,n=t.target.querySelector("#pass").value,l=document.querySelector("#_csrf").value;return a&&n?(e.sendPost(t.target.action,{username:a,pass:n,_csrf:l},m),!1):(e.handleError("Username or password is empty!"),!1)}),o=t=>{t.preventDefault(),e.hideError();const a=t.target.querySelector("#user").value,n=t.target.querySelector("#pass").value,l=t.target.querySelector("#pass2").value,o=t.target.querySelector("#colorField").value,r=document.querySelector("#_csrf").value;return a&&n&&l?n!==l?(e.handleError("Passwords do not match!"),!1):(e.sendPost(t.target.action,{username:a,pass:n,pass2:l,color:o,_csrf:r},m),!1):(e.handleError("All fields are required!"),!1)},r=t=>{t.preventDefault(),e.hideError();const a=t.target.querySelector("#oldPass").value,n=t.target.querySelector("#newPass").value,l=document.querySelector("#_csrf").value;return a&&n?a===n?(e.handleError("The two passwords are the same!"),!1):(e.sendPost(t.target.action,{oldPass:a,newPass:n,_csrf:l},s),!1):(e.handleError("One or more password fields are empty!"),!1)},s=e=>{e.message&&(document.getElementById("oldPass").value="",document.getElementById("newPass").value="")},c=e=>React.createElement("form",{id:"loginForm",name:"loginForm",onSubmit:l,action:"/login",method:"POST",className:"inputForm"},React.createElement("div",{className:"floatLeft"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"})),React.createElement("div",{className:"floatRight"},React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"password",name:"pass",placeholder:"password"})),React.createElement("input",{className:"formSubmit",type:"submit",value:"Log in"})),d=e=>React.createElement("form",{id:"signupForm",name:"signupForm",onSubmit:o,action:"/signup",method:"POST",className:"inputForm"},React.createElement("div",{className:"floatLeft"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"})),React.createElement("div",{className:"floatRight"},React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"password",name:"pass",placeholder:"password"})),React.createElement("div",{className:"floatLeft"},React.createElement("label",{htmlFor:"colorField"},"Color: "),React.createElement("input",{id:"colorField",type:"color",name:"color",value:"#6495ed"})),React.createElement("div",{className:"floatRight"},React.createElement("label",{htmlFor:"pass2"},"Password: "),React.createElement("input",{id:"pass2",type:"password",name:"pass2",placeholder:"password"})),React.createElement("input",{className:"formSubmit",type:"submit",value:"Create Account"})),i=e=>{const[t,a]=React.useState(e.defaultText);return React.createElement("form",{id:"changePasswordForm",name:"changePasswordForm",onSubmit:r,action:"/changePassword",method:"POST",className:"inputForm"},React.createElement("div",{className:"floatLeft"},React.createElement("label",{htmlFor:"oldPass"},"Current Password: "),React.createElement("input",{id:"oldPass",type:"password",name:"oldPass",placeholder:t})),React.createElement("div",{className:"floatRight"},React.createElement("label",{htmlFor:"newPass"},"New Password: "),React.createElement("input",{id:"newPass",type:"password",name:"newPass",placeholder:t})),React.createElement("input",{className:"formSubmit",id:"changePasswordSubmit",type:"submit",value:"Set Password",onClick:e=>a("password")}))},m=e=>(n.init(e),document.getElementById("loginButton").classList.add("hidden"),document.getElementById("signupButton").classList.add("hidden"),document.getElementById("changePasswordButton").classList.remove("hidden"),document.getElementById("logoutButton").classList.remove("hidden"),ReactDOM.render(null,document.getElementById("content")),loginButton.disabled=!1,signupButton.disabled=!0,!1);window.onload=async()=>{t.getData();const e=await fetch("/getToken"),a=await e.json(),n=document.getElementById("loginButton"),l=document.getElementById("signupButton"),o=document.getElementById("logoutButton"),r=document.getElementById("changePasswordButton");document.getElementById("_csrf").value=a.csrfToken,n.addEventListener("click",(e=>(e.preventDefault(),ReactDOM.render(React.createElement(c,null),document.getElementById("content")),l.disabled=!1,n.disabled=!0,!1))),l.addEventListener("click",(e=>(e.preventDefault(),ReactDOM.render(React.createElement(d,null),document.getElementById("content")),n.disabled=!1,l.disabled=!0,!1))),r.addEventListener("click",(e=>(e.preventDefault(),ReactDOM.render(React.createElement(i,{defaultText:"password"}),document.getElementById("content")),l.disabled=!1,n.disabled=!0,!1))),o.addEventListener("click",(async e=>(fetch("/logout"),window.location.reload(),!1))),ReactDOM.render(React.createElement(d,null),document.getElementById("content"))}})()})();