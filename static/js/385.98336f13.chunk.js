"use strict";(self.webpackChunktask_management=self.webpackChunktask_management||[]).push([[385],{5385:(e,a,s)=>{s.r(a),s.d(a,{default:()=>k});var n=s(5043),r=s(2055),c=s(3003),i=s(8914),t=s(2332),o=s(2371),l=s(1880),m=s(7154),d=s(4282),h=s(579);const p=e=>{let{id:a}=e;const s=(0,c.d4)((e=>e.app.selectedUsers)),n=(0,c.wA)();return(0,h.jsxs)("div",{children:[(0,h.jsx)(t.A,{loadOptions:async e=>{try{(0,o.$)();const s=l.A.get("access_token"),n=(await m.A.get("http://127.0.0.1:8000/api/user/profiles/?search=".concat(e,"&workspace_id=").concat(a),{headers:{Authorization:"Bearer ".concat(s)}})).data;return n.map((e=>({value:{id:e.id,email:e.email,name:e.name,nickname:e.nickname},label:e.name&&e.nickname?"".concat(e.name," (").concat(e.nickname,")"):e.email})))}catch(s){return console.error("Error searching for users:",s),[]}},isMulti:!0,isClearable:!0,isSearchable:!0,onChange:e=>{const a=e.map((e=>({id:e.value.id,email:e.value.email,name:e.value.name,nickname:e.value.nickname})));n((0,i.YU)(a))},className:"async-select"}),(0,h.jsx)(d.A,{variant:"secondary",onClick:async()=>{try{(0,o.$)();const e=l.A.get("access_token"),n=s.map((e=>e.id)),r=a,c=await m.A.post("http://127.0.0.1:8000/api/workspaces/members/invite",{selected_user_ids:n,workspace_id:r},{headers:{Authorization:"Bearer ".concat(e)}});console.log(c.data)}catch(e){console.error("Error inviting users:",e)}},className:"invite-button",children:"Invite users"})]})},u=n.memo(p);s(4448);const k=e=>{let{show:a,onHide:s,members:n,id:i,workspaceName:t}=e;return i!=(0,c.d4)((e=>e.modal.workspaceIdToShowModal))?null:(0,h.jsx)(h.Fragment,{children:(0,h.jsxs)(r.A,{show:a,onHide:s,centered:!0,size:"xl",children:[(0,h.jsx)(r.A.Header,{closeButton:!0,style:{backgroundColor:"#33373a",color:"#9fadbc"},children:(0,h.jsxs)(r.A.Title,{children:[t,"'s members"]})}),(0,h.jsxs)(r.A.Body,{style:{backgroundColor:"#33373a",color:"#9fadbc"},children:[(0,h.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"10px"},children:n.map((e=>(0,h.jsx)("div",{className:"members-workspace-member",children:(0,h.jsx)("ul",{children:(0,h.jsx)("li",{children:(0,h.jsxs)("p",{className:"members-workspace-member-items",children:[e.name||e.email," ",e.nickname?"(".concat(e.nickname,")"):""]})})})},e.email)))}),(0,h.jsx)(u,{id:i})]})]})})}}}]);
//# sourceMappingURL=385.98336f13.chunk.js.map