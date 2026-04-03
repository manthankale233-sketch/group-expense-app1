const colors = ["#FFB6B9","#FAE3D9","#BBDED6","#61C0BF","#FFD3B6","#FFAAA5","#C8C8A9"];

function add(){
  let name = document.getElementById("name").value;
  let group = document.getElementById("group").value;
  let amount = Number(document.getElementById("amount").value);
  if(!name || !group || !amount){ alert("All fields required!"); return; }

  fetch("/add",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name, group, amount})
  }).then(()=>load()).catch(err=>console.log(err));
}

function load(){
  fetch("/data").then(res=>res.json()).then(data=>{
    let html = `<h2 style="color:white;">🌟 Total Paid: ₹${data.total}</h2>`;
    let i=0;
    for(let grp in data.groups){
      html += `<div class="group-card" style="border-top:5px solid ${colors[i%colors.length]}">`;
      html += `<div class="group-title">👥 Group: ${grp}</div>`;
      let groupTotal=0;
      data.groups[grp].forEach(exp=>{
        html += `<div class="user-card" style="background:${exp.amount>0?'#D4EDDA':'#F8D7DA'}">
                  <span>💵 ${exp.name}</span>
                  <span>₹${exp.amount}</span>
                  <div>
                    <button onclick="edit('${exp._id}','${exp.name}','${grp}',${exp.amount})">✏️</button>
                    <button onclick="del('${exp._id}')" class="del-btn">❌</button>
                  </div>
                 </div>`;
        groupTotal+=exp.amount;
      });
      html += `<b>Group Total: ₹${groupTotal}</b><br>`;
      html += `<div style="margin-top:8px;">💰 Balance per member:</div>`;
      for(let user in data.splits[grp]){
        let val = data.splits[grp][user];
        html += `<div>${user}: ${val>=0 ? 'Gets ₹'+val.toFixed(2) : 'Owes ₹'+Math.abs(val).toFixed(2)}</div>`;
      }
      html += `</div>`;
      i++;
    }
    document.getElementById("result").innerHTML = html;
  }).catch(err=>console.log(err));
}

function del(id){ fetch("/delete/"+id,{method:"DELETE"}).then(()=>load()).catch(err=>console.log(err)); }

function edit(id,name,group,amount){
  let newName = prompt("Edit Name:", name) || name;
  let newGroup = prompt("Edit Group:", group) || group;
  let newAmount = Number(prompt("Edit Amount:", amount)) || amount;
  fetch("/edit/"+id,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({name:newName, group:newGroup, amount:newAmount})
  }).then(()=>load()).catch(err=>console.log(err));
}
