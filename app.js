const USERS=[{u:"admin",p:"admin123",role:"Admin"},{u:"kasir",p:"kasir123",role:"Kasir"}];
const initialItems=[
 {code:"BRG001",name:"Kabel LAN",stock:12,unit:"pcs",min:20},
 {code:"BRG002",name:"RJ45",stock:8,unit:"pcs",min:10},
 {code:"BRG003",name:"Mouse",stock:15,unit:"pcs",min:5},
 {code:"BRG004",name:"Tinta Printer",stock:1,unit:"pcs",min:5},
 {code:"BRG005",name:"Baterai AA",stock:0,unit:"pcs",min:5},
 {code:"BRG006",name:"Kabel HDMI",stock:30,unit:"pcs",min:10}
];
let items=JSON.parse(localStorage.getItem("scm_items")||"null")||initialItems;
let transactions=JSON.parse(localStorage.getItem("scm_tx")||"[]");
const $=id=>document.getElementById(id);
const save=()=>{localStorage.setItem("scm_items",JSON.stringify(items));localStorage.setItem("scm_tx",JSON.stringify(transactions));};
const status=i=>i.stock===0?"empty":i.stock<=i.min?"order":"safe";
const label=s=>s==="safe"?"Aman":s==="order"?"Perlu dipesan":"Stok habis";
function render(){
 $("totalItems").textContent=items.length;
 $("safeItems").textContent=items.filter(i=>status(i)==="safe").length;
 $("orderItems").textContent=items.filter(i=>status(i)==="order").length;
 $("emptyItems").textContent=items.filter(i=>status(i)==="empty").length;
 renderTable(); renderAlerts(); renderOrders(); renderReports(); fillSelects(); renderRecent();
}
function renderTable(){
 const q=($("searchItem")?.value||"").toLowerCase(), f=$("filterStatus")?.value||"all";
 $("itemTable").innerHTML=items.map((i,idx)=>{let s=status(i);if(f!=="all"&&f!==s)return "";if(q&&!(`${i.code} ${i.name}`.toLowerCase().includes(q)))return "";
 return `<tr><td>${i.code}</td><td><strong>${i.name}</strong></td><td>${i.stock}</td><td>${i.unit}</td><td>${i.min}</td><td><span class="badge ${s}">${label(s)}</span></td><td><div class="actions"><button class="mini edit" onclick="editItem(${idx})">Edit</button><button class="mini delete" onclick="deleteItem(${idx})">Hapus</button></div></td></tr>`}).join("")||`<tr><td colspan="7">Tidak ada data.</td></tr>`;
}
function renderAlerts(){
 const arr=items.filter(i=>status(i)!=="safe").sort((a,b)=>a.stock-b.stock);
 $("dashboardAlerts").innerHTML=arr.slice(0,5).map(i=>`<div class="alert-row"><span class="dot ${i.stock===0?"red":""}"></span><div class="row-main"><b>${i.name}</b><small>Stok ${i.stock} ${i.unit} • Minimum ${i.min}</small></div><span class="badge ${status(i)}">${label(status(i))}</span></div>`).join("")||"<p>Semua stok aman 🎉</p>";
}
function renderOrders(){
 const arr=items.filter(i=>status(i)!=="safe");
 $("orderList").innerHTML=arr.map(i=>`<div class="order-card ${i.stock===0?"empty":""}"><h4>${i.name}</h4><div class="numbers">Stok sekarang <b>${i.stock}</b> ${i.unit}<br>Minimum ${i.min} ${i.unit}</div><span class="badge ${status(i)}">${i.stock===0?"Segera isi stok":"Sudah waktunya pesan"}</span></div>`).join("")||`<div class="card"><h3>Tidak ada barang yang perlu dipesan.</h3></div>`;
}
function renderRecent(){
 const arr=transactions.slice(-5).reverse();
 $("recentTransactions").innerHTML=arr.map(t=>`<div class="activity-row"><span class="dot ${t.type==="Keluar"?"red":""}"></span><div class="row-main"><b>${t.type} • ${t.name}</b><small>${t.date} • ${t.qty} ${t.unit}</small></div></div>`).join("")||"<p>Belum ada transaksi.</p>";
}
function renderReports(){
 $("reportSummary").innerHTML=`<div><strong>${items.length}</strong><span>Jenis barang</span></div><div><strong>${items.reduce((a,b)=>a+b.stock,0)}</strong><span>Total unit</span></div><div><strong>${items.filter(i=>status(i)!=="safe").length}</strong><span>Perlu tindakan</span></div>`;
 $("reportTable").innerHTML=items.map(i=>`<tr><td>${i.code}</td><td>${i.name}</td><td>${i.stock} ${i.unit}</td><td>${i.min} ${i.unit}</td><td><span class="badge ${status(i)}">${label(status(i))}</span></td></tr>`).join("");
}
function fillSelects(){
 ["inItem","outItem"].forEach(id=>{$(id).innerHTML=items.map((i,idx)=>`<option value="${idx}">${i.code} — ${i.name} (stok ${i.stock})</option>`).join("")});
}
function showPage(name){
 document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
 $("page-"+name).classList.remove("hidden");
 document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===name));
 $("pageTitle").textContent={dashboard:"Dashboard",barang:"Data Barang",masuk:"Barang Masuk",keluar:"Barang Keluar",pesan:"Perlu Dipesan",laporan:"Laporan"}[name];
 render();
}
window.showPage=showPage;
$("loginForm").onsubmit=e=>{e.preventDefault();let u=$("loginUsername").value,p=$("loginPassword").value,x=USERS.find(a=>a.u===u&&a.p===p);if(!x){$("loginError").textContent="Username atau password salah.";return}localStorage.setItem("scm_user",JSON.stringify(x));$("loggedUser").textContent=x.role;document.querySelector(".top-user").textContent=x.role;$("loginPage").classList.add("hidden");$("appPage").classList.remove("hidden");render();};
$("logoutBtn").onclick=()=>{localStorage.removeItem("scm_user");location.reload()};
if(localStorage.getItem("scm_user")){$("loginPage").classList.add("hidden");$("appPage").classList.remove("hidden");let x=JSON.parse(localStorage.getItem("scm_user"));$("loggedUser").textContent=x.role;document.querySelector(".top-user").textContent=x.role;}
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>showPage(n.dataset.page));
$("addItemBtn").onclick=()=>openModal();
$("closeModal").onclick=()=>$("modal").classList.add("hidden");
function openModal(idx=null){$("modal").classList.remove("hidden");$("modalTitle").textContent=idx===null?"Tambah Barang":"Edit Barang";$("editIndex").value=idx??"";let i=idx===null?{code:"",name:"",stock:0,unit:"pcs",min:0}:items[idx];$("itemCode").value=i.code;$("itemName").value=i.name;$("itemStock").value=i.stock;$("itemUnit").value=i.unit;$("itemMin").value=i.min}
window.editItem=idx=>openModal(idx);
window.deleteItem=idx=>{if(confirm("Hapus barang ini?")){items.splice(idx,1);save();render()}};
$("itemForm").onsubmit=e=>{e.preventDefault();let idx=$("editIndex").value, obj={code:$("itemCode").value.trim(),name:$("itemName").value.trim(),stock:+$("itemStock").value,unit:$("itemUnit").value.trim(),min:+$("itemMin").value};if(idx==="")items.push(obj);else items[+idx]=obj;save();$("modal").classList.add("hidden");render()};
$("inForm").onsubmit=e=>{e.preventDefault();let idx=+$("inItem").value,q=+$("inQty").value,i=items[idx],d=$("inDate").value;i.stock+=q;transactions.push({date:d,name:i.name,type:"Masuk",qty:q,unit:i.unit,note:$("inNote").value});save();e.target.reset();setDateDefaults();render();alert("Barang masuk berhasil disimpan.")};
$("outForm").onsubmit=e=>{e.preventDefault();let idx=+$("outItem").value,q=+$("outQty").value,i=items[idx],d=$("outDate").value;if(q>i.stock){alert("Jumlah keluar melebihi stok yang tersedia.");return}i.stock-=q;transactions.push({date:d,name:i.name,type:"Keluar",qty:q,unit:i.unit,note:$("outNote").value});save();e.target.reset();setDateDefaults();render();alert("Barang keluar berhasil disimpan.")};
$("searchItem").oninput=renderTable;$("filterStatus").onchange=renderTable;
function setDateDefaults(){let d=new Date().toISOString().slice(0,10);$("inDate").value=d;$("outDate").value=d}
setDateDefaults();
setInterval(()=>{$("clock").textContent=new Date().toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"})},1000);
render();
