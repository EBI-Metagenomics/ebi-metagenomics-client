"use strict";(self.webpackChunkmgportalv2=self.webpackChunkmgportalv2||[]).push([[217],{4217:(e,t,a)=>{a.r(t),a.d(t,{default:()=>d});var n=a(7294),o=a(8840),r=a(5708),s=a.n(r),c=a(402),i=a(1699),l=a(6313),m=a(8110),u=a(964),p=a(6581),g=a(5457);const d=({includePangenomes:e=!0})=>{const t=(0,n.useRef)(null),a=(0,u.Z)(),{columns:r,options:d}=(0,p.Z)(),{data:b,loading:h,error:f}=(0,m.Z)(`genomes/${a}/cogs`,{page_size:100});if(h)return n.createElement(c.Z,{size:"large"});if(f)return n.createElement(i.Z,{error:f});if(!b)return n.createElement(c.Z,null);let C=0;const k=b.data.map((e=>String(e.attributes.name))),y=b.data.reduce(((e,t)=>(e[t.attributes.name]=t.attributes.description,e)),{}),G=b.data.map((e=>{const t=Number(e.attributes["genome-count"]);return C+=t,t})),Z=b.data.map((e=>e.attributes["pangenome-count"]));return d.title={text:"Top 10 COG categories"},d.subtitle={text:`Total: ${C} Genome COG matches - Drag to zoom in/out`},d.xAxis={categories:k},d.tooltip={formatter(){const e=y[this.key];let t=`${this.series.name}<br/>Count: ${this.y}`;return e&&(t+=`<br />COG: ${e}`),t}},d.series=[{name:"Genome",type:"column",data:G.slice(0,10),colors:g.DC,stack:"genome"}],e&&d.series.push({name:"Pan-genome",type:"column",data:Z.slice(0,10),colors:g.DC,stack:"pangenome"}),n.createElement("div",{className:"vf-stack vf-stack--200"},n.createElement(s(),{highcharts:o,options:d,ref:t}),n.createElement(l.Z,{cols:r,data:b,title:`All ${b.meta.pagination.count} COG categories`,loading:h,showPagination:!1}))}},6581:(e,t,a)=>{a.d(t,{Z:()=>r});var n=a(7294),o=a(5457);const r=()=>({columns:(0,n.useMemo)((()=>[{Header:"COG ID",accessor:"attributes.name"},{Header:"Description",accessor:"attributes.description"},{Header:"Genome Count",accessor:"attributes.genome-count"},{Header:"Pan-genome count",accessor:"attributes.pangenome-count"}]),[]),options:{chart:{type:"column",height:400,zoomType:"xy",renderTo:"container"},yAxis:{min:0,title:{text:"Number of matches"}},plotOptions:{series:{stacking:"normal"},column:{allowPointSelect:!0,cursor:"pointer",colors:o.DC}},credits:{enabled:!1},legend:{enabled:!0}}})}}]);
//# sourceMappingURL=217.ddd497a2.chunk.js.map