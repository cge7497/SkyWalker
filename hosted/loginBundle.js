(()=>{var e={603:e=>{const t=e=>{document.getElementById("createResponse").textContent=e};e.exports={handleError:t,sendPost:async(e,a,n)=>{const r=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),l=await r.json();if(document.getElementById("domoMessage").classList.add("hidden"),l.error)return t(l.error);l.redirect&&(window.location=l.redirect),l.username&&(document.getElementById("createResponse").textContent="Logged in as "+l.username),n&&n(l)},hideError:()=>{document.getElementById("domoMessage").classList.add("hidden")}}},689:(e,t,a)=>{"use strict";a.r(t),a.d(t,{bgRect:()=>n,clouds:()=>o,getData:()=>c,rects:()=>r,specialObjects:()=>l});class n{constructor(e,t,a,n,r){this.x=e,this.y=t,this.width=a,this.height=n,this.color=r,this.hSpeed=n*a/15,this.vSpeed=0}}let r=[],l=[],o=[];const c=async()=>{let e=await fetch("/getLevel",{method:"GET",headers:{Accept:"application/json"}});const t=await e.json();t.level&&t.level.rects&&t.level.specialObjects&&(r=t.level.rects,l=t.level.specialObjects),t.level.clouds&&t.level.clouds.length>0&&(o=[...t.level.clouds])}},990:(e,t,a)=>{"use strict";a.r(t),a.d(t,{init:()=>O});var n=a(307),r=a(689),l=a(897);let o,c,s;const i=[];let d={};const m={screwattack:document.getElementById("screwattack"),morphball:document.getElementById("morphball"),yellowswitch:document.getElementById("yellowswitch")},h={screwattack:{obtained:!1,collected:q},morphball:{obtained:!1,collected:H},yellowswitch:{collected:N},fire:{collected:H}},u={x:-450,y:690,halfWidth:4,halfHeight:7,newX:300,newY:300,scale:1,name:"",flip:!1};let p,y,f,g,w=0,v=0,E=!0,b=!1,R=!1,x=!1,S=!1,k=0,T=[],B=0,I=0,M=0;const O=(e,t)=>{e&&e.player?(u.name=e.player.name,w=e.player.color,e.player.items&&L(e.player.items)):u.name=t,d.name=u.name,d.color=w,d.movement=[],f=new Audio("buttonClick.wav"),f.volume=.25,g=new Audio("itemGet.wav"),g.volume=.25;let a=document.querySelector("#canvas_player"),l=document.querySelector("#canvas_walkers"),m=document.querySelector("#canvas_bg");document.getElementById("resetBtn").onclick=D,o=l.getContext("2d"),c=a.getContext("2d"),s=m.getContext("2d"),p=l.width,y=l.height,document.addEventListener("keydown",X),document.addEventListener("keyup",Y),n.kB(300,300,c,!1),r.clouds&&r.clouds.length>0&&r.clouds.forEach((e=>{i.push(new r.bgRect(630*Math.random()+5,470*Math.random()+5,10*Math.random()+30,4*Math.random()+3,e))}));for(let e=0;e<10;e++)i.push(new r.bgRect(640*Math.random(),480*Math.random(),10*Math.random()+30,4*Math.random()+3,"rgba(0,0,0,0.3)"));W(),o.fillStyle="black",u.x=u.y=300,setInterval(P,1e3/60),setInterval(W,1e3/15)},P=()=>{R?N():(C(),n.kB(u.x+I,u.y+M,c,u.flip,u.scale)),j()},C=()=>{let e=0,t=0;T[65]&&(e=-2),T[68]&&(e=2),t=u.flip?-3:3,x?T[87]&&(M-=n.WK(u,u.flip),x=!1,k=30,e=0,t=0):S&&(k-=1,k<=0&&(x=!0)),u.newX=u.x+e,u.newY=u.y+t,$(u,e,t)?(I+=u.x-u.newX,M+=u.y-u.newY,u.x=u.newX,u.y=u.newY):(u.x+=e,u.y+=t,I-=e,M-=t),F(u)},j=()=>{r.rects.forEach((e=>{n.JG(e.x+I,e.y+M,e.width,e.height,c,e.color,!0)})),r.specialObjects.forEach((e=>{"fire"!==e.id&&c.drawImage(m[e.id],e.x+I,e.y+M)}))},W=()=>{s.clearRect(0,0,640,480),n.JG(0,0,p,y,s,"white",!0),B+=0,i.forEach((function(e){e.hSpeed=1*Math.cos(B),e.vSpeed=1*Math.sin(B),e.x+=e.hSpeed,e.y+=e.vSpeed,e.x>p+20?e.x=-20:e.x<-20&&(e.x=p+20),e.y>y+20?e.y=-20:e.y<-20&&(e.y=y+20),n.JG(e.x,e.y,e.width,e.height,s,e.color,!0)}))},$=(e,t,a)=>{let l=!1;return r.rects.forEach((r=>{_(e,r)&&(l=!0,(n.rs(e,r)||n.W$(e,r))&&(e.newY-=a,b||(E=!0)),(n.Vv(e,r)||n.rd(e,r))&&(e.newX-=t))})),l},_=(e,t)=>e.newX-e.halfWidth<t.x+t.width&&e.newX+e.halfWidth>t.x&&e.newY-e.halfHeight<t.y+t.height&&e.newY+e.halfHeight>t.y,F=e=>{r.specialObjects.forEach((t=>{_(e,t)&&(h[t.id].collected(),"fire"!==t.id&&r.specialObjects.splice(r.specialObjects.indexOf(t),1))}))},L=e=>{e.morphball.obtained&&H(!1),e.screwattack.obtained&&q(!1)};function H(e=!0){document.getElementById("morphball").style.display="inline",document.getElementById("moveInstructions").innerHTML="Use '<strong>A</strong>', '<strong>D</strong>', and '<strong>W</strong>' to move, ",x=!0,S=!0,!0===e&&(l.Zy(u.name,"morphball"),g.play())}function q(e=!0){document.getElementById("screwattack").style.display="inline",document.getElementById("spaceInstructions").innerHTML="<strong>SPACE</strong> to ultra flip",b=!0,!0===e&&(l.Zy(u.name,"screwattack"),g.play())}const D=()=>{u.x=300,u.y=300,u.flip=!1,u.newX=300,u.newY=300,I=0,M=0};function N(){R||(i.push(new r.bgRect(640*Math.random(),480*Math.random(),10*Math.random()+30,4*Math.random()+3,w)),l.Hz(w),f.play(),R=!0),v<254&&(v+=.2,u.y+=.5),n.kB(u.x+I,u.y+M,c,u.flip,u.scale,`#000000${(255-v).toString(16).substring(0,2)}`),i.forEach((e=>{i.indexOf(e)!=i.length-1?e.color=`rgba(${v}, ${v}, ${v}, 0.1)`:e.color=`${w}${v.toString(16).substring(0,2)}`})),r.rects.forEach((e=>{e.color=`rgba(${v}, ${v}, ${v}, 0.5)`}))}const X=e=>{switch(e.keyCode){case 65:case 68:T[e.keyCode]=!0;break;case 87:x&&(T[e.keyCode]=!0);break;case 32:e.preventDefault(),T[e.keyCode]||(E||b)&&(u.flip=!u.flip,E=!1),T[e.keyCode]=!0}},Y=e=>{switch(e.keyCode){case 65:case 68:case 87:case 32:T[e.keyCode]=!1}}},897:(e,t,a)=>{"use strict";a.d(t,{Hz:()=>r,Zy:()=>n});const n=async(e,t)=>{const a=`name=${e}&item=${t}&_csrf=${document.querySelector("#_csrf").value}`;(async e=>{let t;switch(e.status){case 200:t=await e.json();break;case 204:break;default:console.error(t)}})(await fetch("/updateItems",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"application/json"},body:a}))},r=async(e="#000000")=>{const t=`color=${e}`;await fetch("/addCloud",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"application/json"},body:t})}},307:(e,t,a)=>{"use strict";a.d(t,{JG:()=>r,Vv:()=>s,W$:()=>d,WK:()=>l,kB:()=>n,rd:()=>c,rs:()=>i,sc:()=>o});const n=(e,t,a,n,r,l,o=!0)=>{n&&(r*=-1),o&&a.clearRect(0,0,640,480),a.save(),a.beginPath(),a.arc(e,t-3*r,3,0,2*Math.PI),a.moveTo(e,t),a.lineTo(e,t+5*r),a.lineTo(e-2*r,t+8*r),a.moveTo(e,t+5*r),a.lineTo(e+2*r,t+8*r),a.moveTo(e-3*r,t+3*r),a.lineTo(e+3*r,t+3*r),l&&(a.strokeStyle=l),a.stroke(),a.closePath(),a.restore()},r=(e,t,a,n,r,l,o)=>{r.save(),r.beginPath(),r.moveTo(e,t),r.lineTo(e+a,t),r.lineTo(e+a,t+n),r.lineTo(e,t+n),r.closePath(),o?(r.fillStyle=l,r.fill()):(r.strokeStyle=l,r.lineWidth=3,r.stroke()),r.restore()},l=(e,t)=>{let a=4,n=0;return t&&(a=-4),1===e.scale?(e.scale=.1,e.halfWidth=1,e.halfHeight=1,n=-a):(e.scale=1,e.halfWidth=4,e.halfHeight=7,n=-3*a),e.y+=n,n},o=e=>(e[0]>15&&(e[0]-=.1),e[1]>31&&(e[1]-=.1),e[2]>56&&(e[2]-=.1),e),c=(e,t)=>e.x+(e.halfWidth-2)<=t.x&&e.newX+(e.halfWidth+2)>=t.x,s=(e,t)=>e.x-(e.halfWidth-2)>=t.x+t.width&&e.newX-(e.halfWidth+2)<t.x+t.width,i=(e,t)=>e.y+(e.halfHeight-2)<t.y&&e.newY+(e.halfHeight+2)>=t.y,d=(e,t)=>e.y-(e.halfHeight-2)>=t.y+t.height&&e.newY-(e.halfHeight+2)<t.y+t.height}},t={};function a(n){var r=t[n];if(void 0!==r)return r.exports;var l=t[n]={exports:{}};return e[n](l,l.exports,a),l.exports}a.d=(e,t)=>{for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{const e=a(603),t=a(689),n=a(990),r=t=>{t.preventDefault(),e.hideError();const a=t.target.querySelector("#user").value,r=t.target.querySelector("#pass").value,l=t.target.querySelector("#_csrf").value;return a&&r?(e.sendPost(t.target.action,{username:a,pass:r,_csrf:l},n.init),!1):(e.handleError("Username or password is empty!"),!1)},l=t=>{t.preventDefault(),e.hideError();const a=t.target.querySelector("#user").value,r=t.target.querySelector("#pass").value,l=t.target.querySelector("#pass2").value,o=t.target.querySelector("#_csrf").value;return a&&r&&l?r!==l?(e.handleError("Passwords do not match!"),!1):(e.sendPost(t.target.action,{username:a,pass:r,pass2:l,_csrf:o},n.init),!1):(e.handleError("All fields are required!"),!1)},o=e=>React.createElement("form",{id:"loginForm",name:"loginForm",onSubmit:r,action:"/login",method:"POST",className:"mainForm"},React.createElement("div",{className:"floatLeft"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"})),React.createElement("div",{className:"floatRight"},React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"password",name:"pass",placeholder:"password"})),React.createElement("br",null),React.createElement("input",{id:"_csrf",type:"hidden",name:"_csrf",value:e.csrf}),React.createElement("input",{className:"formSubmit",type:"submit",value:"Log in"})),c=e=>React.createElement("form",{id:"signupForm",name:"signupForm",onSubmit:l,action:"/signup",method:"POST",className:"mainForm"},React.createElement("div",{className:"floatLeft"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"})),React.createElement("div",{className:"floatRight"},React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"password",name:"pass",placeholder:"password"})),React.createElement("div",{className:"floatLeft"},React.createElement("label",{htmlFor:"colorField"},"Color: "),React.createElement("input",{id:"colorField",type:"color",name:"color"})),React.createElement("div",{className:"floatRight"},React.createElement("label",{htmlFor:"pass2"},"Password: "),React.createElement("input",{id:"pass2",type:"password",name:"pass2",placeholder:"password"})),React.createElement("br",null),React.createElement("input",{id:"_csrf",type:"hidden",name:"_csrf",value:e.csrf}),React.createElement("input",{className:"formSubmit",type:"submit",value:"Create Account"}));window.onload=async()=>{t.getData();const e=await fetch("/getToken"),a=await e.json(),n=document.getElementById("loginButton"),r=document.getElementById("signupButton");n.addEventListener("click",(e=>(e.preventDefault(),ReactDOM.render(React.createElement(o,{csrf:a.csrfToken}),document.getElementById("content")),r.style.visibility="visible",n.style.visibility="hidden",!1))),r.addEventListener("click",(e=>(e.preventDefault(),ReactDOM.render(React.createElement(c,{csrf:a.csrfToken}),document.getElementById("content")),r.style.visibility="hidden",n.style.visibility="visible",!1))),ReactDOM.render(React.createElement(o,{csrf:a.csrfToken}),document.getElementById("content"))}})()})();