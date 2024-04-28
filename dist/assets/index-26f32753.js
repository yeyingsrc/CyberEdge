import{d as u,c,n as d}from"./index-d4b94a3c.js";const p={components:{SearchIcon:u},data(){return{data:[],originalData:[],size:"medium",tableLayout:!1,stripe:!0,bordered:!0,hover:!1,showHeader:!0,selectedRowKeys:[0],searchData:"",isSearchFocus:!1,columns:[{colKey:"row-select",type:"multiple",width:50},{colKey:"task_id",title:"任务ID",width:"300",ellipsis:!0},{colKey:"domain",title:"域名",width:"200",ellipsis:!0},{colKey:"subdomains",title:"子域名数量",width:"150"},{colKey:"ports",title:"端口数量",width:"150"},{colKey:"paths",title:"路径数量",width:"150"},{colKey:"operation",title:"操作",width:200,cell:(t,{row:e})=>t("div",[t("t-button",{props:{theme:"primary",ghost:!0},style:{marginRight:"8px"},on:{click:()=>this.viewTreeChart(e.task_id)}},"查看图表"),t("t-button",{props:{theme:"danger",ghost:!0},on:{click:()=>this.deleteTask(e.task_id)}},"删除")])}],pagination:{current:1,pageSize:50,total:0,showJumper:!0}}},methods:{changeSearchFocus(t){this.isSearchFocus=t,t||this.filterData()},filterData(){this.searchData?this.data=this.originalData.filter(t=>Object.values(t).some(a=>a&&a.toString().toLowerCase().includes(this.searchData.toLowerCase()))):this.data=this.originalData},fetchResults(){this.$request.get("/api/target/assets",{headers:{"Content-Type":"application/json"}}).then(t=>{c.success("所有目标已获取"),this.data=t.data.assets,this.originalData=t.data.assets,this.pagination.total=t.data.assets.length}).catch(t=>{console.log(t),c.error("获取失败")})},viewDetails(t){this.$router.push({path:"/subdomain/list",query:{task_id:t}})},deleteTask(t){this.$request.delete(`/api/subdomain_scanner/tasks/${t}/delete`,{headers:{"Content-Type":"application/json"}}).then(()=>{c.success("任务删除成功"),this.data=this.data.filter(e=>e.task_id!==t),this.pagination.total=this.data.length}).catch(e=>{console.error(e),c.error("删除失败")})},rehandleSelectChange(t,{selectedRowData:e}){this.selectedRowKeys=t},startPathScan(t,e=null){const a=this.selectedRowKeys.reduce((i,n)=>{const r=this.data.find(o=>o.task_id===n);if(r){const h=`${t.includes("HTTPS")?"https":"http"}://${r.domain}/FUZZ`;i[r.task_id]||(i[r.task_id]=[]),i[r.task_id].push(h)}return i},{}),s=t.includes("Simple")?"./wordlist/default_wordlist.txt":"./wordlist/top7000.txt";Object.entries(a).forEach(([i,n])=>{const o={urls:[...new Set(n)],wordlist:s,...e&&{delay:e},from_id:i};this.$request.post("/api/path_scanner/scan",o,{headers:{"Content-Type":"application/json"}}).then(()=>{this.$message.success("路径扫描任务已启动")}).catch(h=>{console.error(h),this.$message.error("启动路径扫描任务失败")})})},startHTTPPathScan(){this.startPathScan("HTTP")},startHTTPSPathScan(){this.startPathScan("HTTPS")},startHTTPPathSimpleScan(){this.startPathScan("HTTP Simple","0.5")},startHTTPSPathSimpleScan(){this.startPathScan("HTTPS Simple","0.5")},startSubdomainScan(){const t=this.selectedRowKeys.reduce((e,a)=>{const s=this.data.find(i=>i.task_id===a);if(s){const i=s.domain;e[s.task_id]||(e[s.task_id]=[]),e[s.task_id].push(i)}return e},{});Object.entries(t).forEach(([e,a])=>{const i={targets:[...new Set(a)],from_id:e};this.$request.post("/api/subdomain_scanner/scan",i,{headers:{"Content-Type":"application/json"}}).then(()=>{this.$message.success("子域名扫描任务已启动")}).catch(n=>{console.error(n),this.$message.error("启动子域名扫描任务失败")})})},onPageChange(t,e){this.pagination.defaultCurrent||(this.pagination.current=t.current,this.pagination.pageSize=t.pageSize)},viewTreeChart(t){this.$router.push({path:"/target/chart",query:{task_id:t}})}},mounted(){this.fetchResults()}};var m=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("t-space",{attrs:{direction:"vertical"}},[a("t-input",{class:{"hover-active":t.isSearchFocus},attrs:{placeholder:"请输入搜索内容"},on:{blur:function(s){return t.changeSearchFocus(!1)},focus:function(s){return t.changeSearchFocus(!0)},input:t.filterData},scopedSlots:t._u([{key:"prefix-icon",fn:function(){return[a("search-icon",{staticClass:"icon",attrs:{size:"16"}})]},proxy:!0}]),model:{value:t.searchData,callback:function(s){t.searchData=s},expression:"searchData"}}),[a("t-space",[a("t-button",{attrs:{theme:"primary"},on:{click:t.startSubdomainScan}},[t._v("对选定的项目启动 子域名 扫描")])],1)],[a("t-space",[a("t-button",{attrs:{theme:"primary"},on:{click:t.startHTTPPathScan}},[t._v("对选定的项目启动 HTTP路径 扫描")]),a("t-button",{attrs:{theme:"primary"},on:{click:t.startHTTPSPathScan}},[t._v("对选定的项目启动 HTTPS路径 扫描")]),a("t-button",{attrs:{theme:"primary"},on:{click:t.startHTTPPathSimpleScan}},[t._v("对选定的项目启动 简单HTTP路径 扫描")]),a("t-button",{attrs:{theme:"primary"},on:{click:t.startHTTPSPathSimpleScan}},[t._v("对选定的项目启动 简单HTTPS路径 扫描")])],1)],a("t-table",{attrs:{rowKey:"task_id",data:t.data,columns:t.columns,stripe:t.stripe,bordered:t.bordered,hover:t.hover,size:t.size,"table-layout":t.tableLayout?"auto":"fixed",pagination:t.pagination,showHeader:t.showHeader,"selected-row-keys":t.selectedRowKeys,cellEmptyContent:"-",resizable:""},on:{"select-change":t.rehandleSelectChange,"page-change":t.onPageChange}})],2)},S=[];const l={};var _=d(p,m,S,!1,g,null,null,null);function g(t){for(let e in l)this[e]=l[e]}const f=function(){return _.exports}();export{f as default};
