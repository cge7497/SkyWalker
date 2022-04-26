(()=>{var e={603:e=>{const t=e=>{document.getElementById("createResponse").textContent=e};e.exports={handleError:t,sendPost:async(e,a,n)=>{const r=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),l=await r.json();if(document.getElementById("createResponse").textContent="",l.error)return t(l.error);l.redirect&&(window.location=l.redirect),l.username&&(document.getElementById("createResponse").textContent="Logged in as "+l.username,document.getElementById("resetBtn").disabled=!1),n&&n(l)},hideError:()=>{document.getElementById("createResponse").textContent=""}}},689:(e,t,a)=>{"use strict";a.r(t),a.d(t,{bgRect:()=>n,clouds:()=>o,getData:()=>c,rects:()=>r,specialObjects:()=>l});class n{constructor(e,t,a,n,r){this.x=e,this.y=t,this.width=a,this.height=n,this.color=r,this.hSpeed=n*a/15,this.vSpeed=0}}let r=[],l=[],o=[];const c=async()=>{let e=await fetch("/getLevel",{method:"GET",headers:{Accept:"application/json"}});const t=await e.json();t.level&&t.level.rects&&t.level.specialObjects&&(r=t.level.rects,l=t.level.specialObjects),t.level.clouds&&t.level.clouds.length>0&&(o=[...t.level.clouds])}},802:(e,t,a)=>{"use strict";a.r(t),a.d(t,{init:()=>P});const n=(e,t,a,n,r,l,o=!0)=>{n&&(r*=-1),o&&a.clearRect(0,0,640,480),a.save(),a.beginPath(),a.arc(e,t-3*r,3,0,2*Math.PI),a.moveTo(e,t),a.lineTo(e,t+5*r),a.lineTo(e-2*r,t+8*r),a.moveTo(e,t+5*r),a.lineTo(e+2*r,t+8*r),a.moveTo(e-3*r,t+3*r),a.lineTo(e+3*r,t+3*r),l&&(a.strokeStyle=l),a.stroke(),a.closePath(),a.restore()},r=(e,t,a,n,r,l,o)=>{r.save(),r.beginPath(),r.moveTo(e,t),r.lineTo(e+a,t),r.lineTo(e+a,t+n),r.lineTo(e,t+n),r.closePath(),o?(r.fillStyle=l,r.fill()):(r.strokeStyle=l,r.lineWidth=3,r.stroke()),r.restore()};var l=a(689);const o=async(e,t)=>{const a=`name=${e}&item=${t}&_csrf=${document.querySelector("#_csrf").value}`;(async e=>{let t;switch(e.status){case 200:t=await e.json();break;case 204:break;default:console.error(t)}})(await fetch("/updateItems",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"application/json"},body:a}))};let c,s,i;const d=[];let m={};const h={screwattack:document.getElementById("screwattack"),morphball:document.getElementById("morphball"),yellowswitch:document.getElementById("yellowswitch")},u={screwattack:{obtained:!1,collected:N},morphball:{obtained:!1,collected:H},yellowswitch:{collected:X},fire:{collected:H}},p={x:-450,y:690,halfWidth:4,halfHeight:7,newX:300,newY:300,scale:1,name:"",flip:!1};let y,f,g,w,v=0,E=0,b=!0,R=!1,x=!1,S=!1,k=!1,T=0,I=[],B=0,M=0,O=0;const P=(e,t)=>{e&&e.username&&e.items&&e.color?(p.name=e.username,v=e.color,e.items&&D(e.items)):p.name=t,console.log("initting"),m.name=p.name,m.color=v,m.movement=[],g=new Audio("buttonClick.wav"),g.volume=.25,w=new Audio("itemGet.wav"),w.volume=.25;let a=document.querySelector("#canvas_player"),r=document.querySelector("#canvas_walkers"),o=document.querySelector("#canvas_bg");document.getElementById("resetBtn").onclick=W,c=r.getContext("2d"),s=a.getContext("2d"),i=o.getContext("2d"),y=r.width,f=r.height,document.addEventListener("keydown",Y),document.addEventListener("keyup",A),n(300,300,s,!1),l.clouds&&l.clouds.length>0&&l.clouds.forEach((e=>{d.push(new l.bgRect(630*Math.random()+5,470*Math.random()+5,10*Math.random()+30,4*Math.random()+3,e))}));for(let e=0;e<10;e++)d.push(new l.bgRect(640*Math.random(),480*Math.random(),10*Math.random()+30,4*Math.random()+3,"rgba(0,0,0,0.3)"));_(),c.fillStyle="black",p.x=p.y=300,setInterval(C,1e3/60),setInterval(_,1e3/15)},C=()=>{x?X():(j(),n(p.x+M,p.y+O,s,p.flip,p.scale)),F()},j=()=>{let e=0,t=0;I[65]&&(e=-3),I[68]&&(e=3),t=p.flip?-5:5,S?I[87]&&(O-=((e,t)=>{let a=4,n=0;return t&&(a=-4),1===e.scale?(e.scale=.1,e.halfWidth=1,e.halfHeight=1,n=-a):(e.scale=1,e.halfWidth=4,e.halfHeight=7,n=-3*a),e.y+=n,n})(p,p.flip),S=!1,T=30,e=0,t=0):k&&(T-=1,T<=0&&(S=!0)),p.newX=p.x+e,p.newY=p.y+t,q(p,e,t)?(M+=p.x-p.newX,O+=p.y-p.newY,p.x=p.newX,p.y=p.newY):(p.x+=e,p.y+=t,M-=e,O-=t),$(p)},F=()=>{l.rects.forEach((e=>{r(e.x+M,e.y+O,e.width,e.height,s,e.color,!0)})),l.specialObjects.forEach((e=>{"fire"!==e.id&&s.drawImage(h[e.id],e.x+M,e.y+O)}))},_=()=>{i.clearRect(0,0,640,480),r(0,0,y,f,i,"white",!0),B+=0,d.forEach((function(e){e.hSpeed=1*Math.cos(B),e.vSpeed=1*Math.sin(B),e.x+=e.hSpeed,e.y+=e.vSpeed,e.x>y+20?e.x=-20:e.x<-20&&(e.x=y+20),e.y>f+20?e.y=-20:e.y<-20&&(e.y=f+20),r(e.x,e.y,e.width,e.height,i,e.color,!0)}))},q=(e,t,a)=>{let n=!1;return l.rects.forEach((r=>{L(e,r)&&(n=!0,(((e,t)=>e.y+(e.halfHeight-2)<t.y&&e.newY+(e.halfHeight+2)>=t.y)(e,r)||((e,t)=>e.y-(e.halfHeight-2)>=t.y+t.height&&e.newY-(e.halfHeight+2)<t.y+t.height)(e,r))&&(e.newY-=a,R||(b=!0)),(((e,t)=>e.x-(e.halfWidth-2)>=t.x+t.width&&e.newX-(e.halfWidth+2)<t.x+t.width)(e,r)||((e,t)=>e.x+(e.halfWidth-2)<=t.x&&e.newX+(e.halfWidth+2)>=t.x)(e,r))&&(e.newX-=t))})),n},L=(e,t)=>e.newX-e.halfWidth<t.x+t.width&&e.newX+e.halfWidth>t.x&&e.newY-e.halfHeight<t.y+t.height&&e.newY+e.halfHeight>t.y,$=e=>{l.specialObjects.forEach((t=>{L(e,t)&&(u[t.id].collected(),"fire"!==t.id&&l.specialObjects.splice(l.specialObjects.indexOf(t),1))}))},D=e=>{console.log(e),!0===e.morphball&&(H(!1),console.log(e)),!0===e.screwattack&&N(!1)};function H(e=!0){document.getElementById("morphball").style.display="inline",document.getElementById("moveInstructions").innerHTML="Use '<strong>A</strong>', '<strong>D</strong>', and '<strong>W</strong>' to move, ",S=!0,k=!0,!0===e&&(o(p.name,"morphball"),w.play())}function N(e=!0){document.getElementById("screwattack").style.display="inline",document.getElementById("spaceInstructions").innerHTML="<strong>SPACE</strong> to ultra flip",R=!0,!0===e&&(o(p.name,"screwattack"),w.play())}const W=()=>{p.x=300,p.y=300,p.flip=!1,p.newX=300,p.newY=300,M=0,O=0};function X(){x||(d.push(new l.bgRect(640*Math.random(),480*Math.random(),10*Math.random()+30,4*Math.random()+3,v)),x=!0),E<254&&(E+=.2,p.y+=.5),n(p.x+M,p.y+O,s,p.flip,p.scale,`#000000${(255-E).toString(16).substring(0,2)}`),d.forEach((e=>{d.indexOf(e)!=d.length-1?e.color=`rgba(${E}, ${E}, ${E}, 0.1)`:e.color=`${v}${E.toString(16).substring(0,2)}`})),l.rects.forEach((e=>{e.color=`rgba(${E}, ${E}, ${E}, 0.5)`}))}const Y=e=>{switch(e.keyCode){case 65:case 68:I[e.keyCode]=!0;break;case 87:S&&(I[e.keyCode]=!0);break;case 32:e.preventDefault(),I[e.keyCode]||(b||R)&&(p.flip=!p.flip,b=!1),I[e.keyCode]=!0}},A=e=>{switch(e.keyCode){case 65:case 68:case 87:case 32:I[e.keyCode]=!1}}}},t={};function a(n){var r=t[n];if(void 0!==r)return r.exports;var l=t[n]={exports:{}};return e[n](l,l.exports,a),l.exports}a.d=(e,t)=>{for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{const e=a(603),t=a(689),n=a(802),r=t=>{t.preventDefault(),e.hideError();const a=t.target.querySelector("#user").value,r=t.target.querySelector("#pass").value,l=t.target.querySelector("#_csrf").value;return a&&r?(e.sendPost(t.target.action,{username:a,pass:r,_csrf:l},n.init),!1):(e.handleError("Username or password is empty!"),!1)},l=t=>{t.preventDefault(),e.hideError();const a=t.target.querySelector("#user").value,r=t.target.querySelector("#pass").value,l=t.target.querySelector("#pass2").value,o=t.target.querySelector("#colorField").value,c=t.target.querySelector("#_csrf").value;return a&&r&&l?r!==l?(e.handleError("Passwords do not match!"),!1):(e.sendPost(t.target.action,{username:a,pass:r,pass2:l,color:o,_csrf:c},n.init),!1):(e.handleError("All fields are required!"),!1)},o=e=>React.createElement("form",{id:"loginForm",name:"loginForm",onSubmit:r,action:"/login",method:"POST",className:"mainForm"},React.createElement("div",{className:"floatLeft"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"})),React.createElement("div",{className:"floatRight"},React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"password",name:"pass",placeholder:"password"})),React.createElement("br",null),React.createElement("input",{id:"_csrf",type:"hidden",name:"_csrf",value:e.csrf}),React.createElement("input",{className:"formSubmit",type:"submit",value:"Log in"})),c=e=>React.createElement("form",{id:"signupForm",name:"signupForm",onSubmit:l,action:"/signup",method:"POST",className:"mainForm"},React.createElement("div",{className:"floatLeft"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"})),React.createElement("div",{className:"floatRight"},React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"password",name:"pass",placeholder:"password"})),React.createElement("div",{className:"floatLeft"},React.createElement("label",{htmlFor:"colorField"},"Color: "),React.createElement("input",{id:"colorField",type:"color",name:"color"})),React.createElement("div",{className:"floatRight"},React.createElement("label",{htmlFor:"pass2"},"Password: "),React.createElement("input",{id:"pass2",type:"password",name:"pass2",placeholder:"password"})),React.createElement("br",null),React.createElement("input",{id:"_csrf",type:"hidden",name:"_csrf",value:e.csrf}),React.createElement("input",{className:"formSubmit",type:"submit",value:"Create Account"}));window.onload=async()=>{t.getData();const e=await fetch("/getToken"),a=await e.json(),n=document.getElementById("loginButton"),r=document.getElementById("signupButton");n.addEventListener("click",(e=>(e.preventDefault(),ReactDOM.render(React.createElement(o,{csrf:a.csrfToken}),document.getElementById("content")),r.style.visibility="visible",n.style.visibility="hidden",!1))),r.addEventListener("click",(e=>(e.preventDefault(),ReactDOM.render(React.createElement(c,{csrf:a.csrfToken}),document.getElementById("content")),r.style.visibility="hidden",n.style.visibility="visible",!1))),ReactDOM.render(React.createElement(o,{csrf:a.csrfToken}),document.getElementById("content"))}})()})();