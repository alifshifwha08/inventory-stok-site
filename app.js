let barang = JSON.parse(localStorage.getItem("barang")) || [
  {id:1,kode:"BRG001",nama:"RJ45",stok:8,satuan:"pcs",minimum:10},
  {id:2,kode:"BRG002",nama:"Kabel LAN",stok:25,satuan:"pcs",minimum:10},
  {id:3,kode:"BRG003",nama:"Mouse",stok:3,satuan:"unit",minimum:5}
];
let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];

const save=()=>{localStorage.setItem("barang",JSON.stringify(barang));localStorage.setItem("transaksi",JSON.stringify(transaksi));};

document.querySelectorAll(".nav").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
  document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));
  document.getElementById(btn.dataset.page).classList.remove("hidden");
  document.getElementById("pageTitle").textContent=btn.textContent.trim();
  refresh();
});

function status(b){
  if(b.stok===0)return ['Habis','danger-b'];
  if(b.stok<=b.minimum)return ['Perlu dipesan','warning-b'];
  return ['Aman','safe'];
}
function refresh(){renderDashboard();renderBarang();renderTransaksi();renderPesan();fillSelect();}
function renderDashboard(){
  const perlu=barang.filter(b=>b.stok<=b.minimum), habis=barang.filter(b=>b.stok===0);
  totalBarang.textContent=barang.length; stokAman.textContent=barang.filter(b=>b.stok>b.minimum).length;
  perluPesan.textContent=perlu.length; stokHabis.textContent=habis.length;
  alertList.innerHTML=perlu.length?perlu.map(b=>`<div class="item-alert"><b>${b.nama}</b> (${b.kode}) — tersisa <b>${b.stok} ${b.satuan}</b>. Batas pesan: ${b.minimum} ${b.satuan}.</div>`).join(""):'<div class="empty">Semua stok masih aman.</div>';
}
function renderBarang(){
  const q=(search.value||"").toLowerCase();
  const rows=barang.filter(b=>(b.nama+b.kode).toLowerCase().includes(q));
  barangTable.innerHTML=rows.length?rows.map(b=>{let s=status(b);return `<tr><td>${b.kode}</td><td>${b.nama}</td><td><b>${b.stok}</b></td><td>${b.satuan}</td><td>${b.minimum}</td><td><span class="badge ${s[1]}">${s[0]}</span></td><td><button onclick="hapus(${b.id})">Hapus</button></td></tr>`}).join(""):'<tr><td colspan="7" class="empty">Belum ada barang.</td></tr>';
}
function renderTransaksi(){
  transaksiTable.innerHTML=transaksi.length?[...transaksi].reverse().map(t=>`<tr><td>${t.tanggal}</td><td>${t.nama}</td><td>${t.jenis}</td><td>${t.jumlah}</td><td>${t.keterangan||"-"}</td></tr>`).join(""):'<tr><td colspan="5" class="empty">Belum ada transaksi.</td></tr>';
}
function renderPesan(){
  const list=barang.filter(b=>b.stok<=b.minimum);
  pesanList.innerHTML=list.length?list.map(b=>`<div class="item-alert"><b>${b.nama}</b> — stok ${b.stok} ${b.satuan}; minimum ${b.minimum}. <b>Sudah waktunya pesan.</b></div>`).join(""):'<div class="empty">Belum ada barang yang perlu dipesan.</div>';
}
function fillSelect(){barangId.innerHTML=barang.map(b=>`<option value="${b.id}">${b.kode} - ${b.nama} (stok ${b.stok})</option>`).join("")}
function openModal(){modal.classList.remove("hidden");barangForm.reset()}
function closeModal(){modal.classList.add("hidden")}
barangForm.onsubmit=e=>{e.preventDefault();barang.push({id:Date.now(),kode:kode.value.trim(),nama:nama.value.trim(),stok:+stok.value,satuan:satuan.value.trim(),minimum:+minimum.value});save();closeModal();refresh();}
function hapus(id){if(confirm("Hapus barang ini?")){barang=barang.filter(b=>b.id!==id);save();refresh()}}
function openTransaksi(){transaksiModal.classList.remove("hidden");fillSelect()}
function closeTransaksi(){transaksiModal.classList.add("hidden")}
transaksiForm.onsubmit=e=>{
 e.preventDefault();let b=barang.find(x=>x.id==barangId.value), j=+jumlah.value;
 if(jenis.value==="keluar"&&j>b.stok){alert("Stok tidak cukup.");return}
 b.stok += jenis.value==="masuk"?j:-j;
 transaksi.push({tanggal:new Date().toLocaleString("id-ID"),nama:b.nama,jenis:jenis.value,jumlah:j,keterangan:keterangan.value});
 save();closeTransaksi();refresh();
};
refresh();
