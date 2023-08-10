const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-seshadev:happy2001@cluster0.o21annj.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to do list",
});
const item2 = new Item({
  name: "AI",
});
const item3 = new Item({
  name: "DSA",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.set("view engine", "ejs");

app.get("/", function (req, res) {

  Item.find({}).then(function (foundItems, err) {

    if (foundItems.length == 0) {
      Item.insertMany(defaultItems).then(function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { kindofday: "Today", newlistitems: foundItems });
    }
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  console.log(customListName);

  List.findOne({name: customListName}).then(function(foundList, err){
    if(!err){
      if(!foundList){
        // Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list", { kindofday: foundList.name, newlistitems: foundList.items });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemN = new Item({
    name: itemName 
  });

  if(listName === "Today"){
    itemN.save();
    res.redirect("/")
  }
  else{
    List.findOne({name: listName}).then(function(foundList, err){
      foundList.items.push(itemN);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete" ,function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(err) {
      if(!err){
        console.log("Success");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(foundList, err){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }
});

app.listen(3000, function () {
  console.log("server is active on port 3000");
});
