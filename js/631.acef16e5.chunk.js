"use strict";(self.webpackChunkmgportalv2=self.webpackChunkmgportalv2||[]).push([[631],{5222:(e,l,a)=>{a.d(l,{Z:()=>E});var i=a(7294),t=a(9711),n=a(7338);const s=(o={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'"},function(e){return null==o?void 0:o[e]});var o,r=/&(?:amp|lt|gt|quot|#39);/g,d=RegExp(r.source);var c=a(402),v=a(1699),m=a(6313),u=a(8110),p=a(964),g=a(5058),b=a(121);const E=({rootEndpoint:e})=>{var l,a,o,E,y;const h=(0,p.Z)(),[f]=(0,b.Z)("analyses-page",1,Number),[w]=(0,b.Z)("analyses-page_size",10,Number),[Z]=(0,b.Z)("analyses-order",""),{data:_,loading:k,error:N,isStale:$,downloadURL:x}=(0,u.Z)(`${e}/${h}/analyses`,{include:"sample",page:f,ordering:Z,page_size:w});if(k&&!$)return i.createElement(c.Z,{size:"small"});if(N||!_)return i.createElement(v.Z,{error:N});if(!_.data.length)return null;const C={};null===(l=_.included||[])||void 0===l||l.filter((({type:e})=>"samples"===e)).forEach((e=>{C[e.id]={description:e.attributes["sample-desc"],biome:e.relationships.biome.data.id}}));const U=[{id:"biome_id",Header:"Biome",accessor:e=>{var l,a,i,t;return(null===(t=null==C?void 0:C[null===(i=null===(a=null===(l=null==e?void 0:e.relationships)||void 0===l?void 0:l.sample)||void 0===a?void 0:a.data)||void 0===i?void 0:i.id])||void 0===t?void 0:t.biome)||""},Cell:({cell:e})=>i.createElement("span",{className:`biome_icon icon_xs ${(0,g.G)(e.value)}`,style:{float:"initial"}}),className:"mg-biome"},{id:"sample",Header:"Sample accession",accessor:e=>{var l,a,i;return null===(i=null===(a=null===(l=null==e?void 0:e.relationships)||void 0===l?void 0:l.sample)||void 0===a?void 0:a.data)||void 0===i?void 0:i.id},Cell:({cell:e})=>i.createElement(t.rU,{to:`/samples/${e.value}`},e.value)},{id:"description_id",Header:"Sample description",accessor:e=>{var l,a,i,t;return(null===(t=null==C?void 0:C[null===(i=null===(a=null===(l=null==e?void 0:e.relationships)||void 0===l?void 0:l.sample)||void 0===a?void 0:a.data)||void 0===i?void 0:i.id])||void 0===t?void 0:t.description)||""},Cell:({cell:e})=>{return l=e.value,(l=(0,n.Z)(l))&&d.test(l)?l.replace(r,s):l;var l}},{id:"assembly_run_id",Header:" Run / Assembly accession",accessor:e=>{var l,a,i,t,n,s;return{assembly:(null===(i=null===(a=null===(l=null==e?void 0:e.relationships)||void 0===l?void 0:l.assembly)||void 0===a?void 0:a.data)||void 0===i?void 0:i.id)||"",run:(null===(s=null===(n=null===(t=null==e?void 0:e.relationships)||void 0===t?void 0:t.run)||void 0===n?void 0:n.data)||void 0===s?void 0:s.id)||""}},Cell:({cell:e})=>i.createElement(i.Fragment,null,e.value.assembly&&i.createElement(t.rU,{to:`/assemblies/${e.value.assembly}`},e.value.assembly),e.value.run&&i.createElement(t.rU,{to:`/runs/${e.value.run}`},e.value.run))},{id:"pipeline_id",Header:"Pipeline version",accessor:e=>e.attributes["pipeline-version"],Cell:({cell:e})=>i.createElement(t.rU,{to:`/pipelines/${e.value}`},e.value)},{id:"analysis_id",Header:"Analysis accession",accessor:e=>e.id,Cell:({cell:e})=>i.createElement(t.rU,{to:`/analyses/${e.value}`},e.value)}],A=((null===(o=null===(a=_.meta)||void 0===a?void 0:a.pagination)||void 0===o?void 0:o.count)||1)>10;return i.createElement(m.Z,{cols:U,data:_,Title:i.createElement("div",null,"Analyses",i.createElement("span",{className:"mg-number"},(null===(y=null===(E=_.meta)||void 0===E?void 0:E.pagination)||void 0===y?void 0:y.count)||1)),initialPage:f-1,initialPageSize:10,className:"mg-anlyses-table",loading:k,isStale:$,namespace:"analyses-",showPagination:A,downloadURL:x})}},5478:(e,l,a)=>{a.d(l,{Z:()=>t});var i=a(7294);const t=({label:e,theme:l="primary",children:a,dataCy:t})=>i.createElement("div",{className:"vf-grid","data-cy":t},i.createElement("div",{className:`vf-box vf-box--easy vf-box-theme--${l}`},i.createElement("h5",{className:"vf-box__heading"},e),i.createElement("div",{className:"vf-box__text"},a)))},3415:(e,l,a)=>{a.d(l,{Z:()=>t});var i=a(7294);const t=({list:e,dataCy:l})=>i.createElement("div",{className:"vf-grid vf-grid__col-2",style:{gridTemplateColumns:"1fr 2fr",rowGap:"0.5rem"},"data-cy":l},e.map((({key:e,value:l})=>i.createElement(i.Fragment,{key:e},i.createElement("div",{style:{textAlign:"right"}},e,":"),i.createElement("div",null,"string"==typeof l?l:i.createElement(l,null))))))},964:(e,l,a)=>{a.d(l,{Z:()=>t});var i=a(6974);const t=()=>{const e=(0,i.TH)();let{pathname:l}=e;l.trim().endsWith("/")&&(l=l.trim().slice(0,-1));const a=l.split("/");return null==a?void 0:a[a.length-1]}},7631:(e,l,a)=>{a.r(l),a.d(l,{default:()=>p});var i=a(7294),t=a(8110),n=a(964),s=a(402),o=a(1699),r=a(5478),d=a(3415),c=a(2531),v=a(9711),m=a(5222),u=a(8101);const p=()=>{var e,l,a,p,g,b;const E=(0,n.Z)(),{data:y,loading:h,error:f}=(0,t.Z)(`assemblies/${E}`);if(h)return i.createElement(s.Z,{size:"large"});if(f)return i.createElement(o.Z,{error:f});if(!y)return i.createElement(s.Z,null);const{data:w}=y,Z=[{key:"Sample",value:(null===(a=null===(l=null===(e=null==w?void 0:w.relationships)||void 0===e?void 0:e.samples)||void 0===l?void 0:l.data)||void 0===a?void 0:a.length)?()=>i.createElement(i.Fragment,null,w.relationships.samples.data.map((e=>i.createElement(v.rU,{to:`/samples/${e.id}`,key:e.id},e.id," ")))):null},{key:"Runs",value:(null===(b=null===(g=null===(p=null==w?void 0:w.relationships)||void 0===p?void 0:p.runs)||void 0===g?void 0:g.data)||void 0===b?void 0:b.length)?()=>i.createElement(i.Fragment,null,w.relationships.runs.data.map((e=>i.createElement(v.rU,{to:`/runs/${e.id}`,key:e.id},e.id," ")))):null},{key:"ENA accession",value:()=>i.createElement(c.Z,{href:`${u.sn}${null==w?void 0:w.id}`},null==w?void 0:w.id)},{key:"Legacy accession",value:w.attributes["legacy-accession"]}].filter((({value:e})=>Boolean(e)));return i.createElement("section",{className:"vf-content"},i.createElement("h2",null,"Assembly: ",(null==w?void 0:w.id)||""),i.createElement("section",{className:"vf-grid"},i.createElement("div",{className:"vf-stack vf-stack--200"},i.createElement(r.Z,{label:"Description"},i.createElement(d.Z,{list:Z})),i.createElement(r.Z,{label:"Associated analyses"},i.createElement(m.Z,{rootEndpoint:"assemblies"})))))}},8101:(e,l,a)=>{a.d(l,{sn:()=>i,bV:()=>t,QD:()=>n,s8:()=>s,mL:()=>o,gM:()=>r});const i="https://www.ebi.ac.uk/ena/browser/view/",t=" https://img.jgi.doe.gov/cgi-bin/m/main.cgi?section=TaxonDetail&page=taxonDetail&taxon_oid=",n="https://www.ncbi.nlm.nih.gov/assembly/",s="https://www.ncbi.nlm.nih.gov/biosample/?term=",o="https://www.ncbi.nlm.nih.gov/bioproject/",r="https://www.patricbrc.org/view/Genome/"}}]);
//# sourceMappingURL=631.acef16e5.chunk.js.map