const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());
app.use(express.static("public"));

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/expenseDB")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// Schema
const Expense = mongoose.model("Expense", {
  name: String,
  group: String,
  amount: Number
});

// Add Expense
app.post("/add", async (req,res)=>{
  const {name, group, amount} = req.body;
  if(!name || !group || !amount) return res.status(400).json({error:"All fields required"});
  const exp = await Expense.create({name, group, amount});
  res.json(exp);
});

// Edit Expense
app.put("/edit/:id", async (req,res)=>{
  const {id} = req.params;
  const {name, group, amount} = req.body;
  await Expense.findByIdAndUpdate(id, {name, group, amount});
  res.json({success:true});
});

// Delete Expense
app.delete("/delete/:id", async (req,res)=>{
  const {id} = req.params;
  if(!id) return res.status(400).json({error:"ID required"});
  await Expense.findByIdAndDelete(id);
  res.json({success:true});
});

// Get Expenses + Calculations
app.get("/data", async (req,res)=>{
  const expenses = await Expense.find();
  
  // Group by group name
  const groups = {};
  expenses.forEach(exp => {
    if(!groups[exp.group]) groups[exp.group] = [];
    groups[exp.group].push(exp);
  });

  // Calculate splits per member
  const splits = {};
  for(const grp in groups){
    const members = {};
    groups[grp].forEach(exp=>{
      if(!members[exp.name]) members[exp.name] = 0;
      members[exp.name] += exp.amount;
    });
    const total = Object.values(members).reduce((a,b)=>a+b,0);
    const perPerson = total / Object.keys(members).length;
    splits[grp] = {};
    for(const name in members){
      splits[grp][name] = members[name] - perPerson; // +ve = gets, -ve = owes
    }
  }

  const totalPaid = expenses.reduce((sum,e)=>sum+e.amount,0);

  res.json({groups, splits, total: totalPaid});
});

app.listen(3000, ()=>console.log("Server running on http://localhost:3000/"));