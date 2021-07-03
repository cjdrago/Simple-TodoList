// jshint version:6
const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const _ = require('lodash');


require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended : true}));
app.use(express.static("public"))
app.set('view engine', 'ejs');


// Connect db Cloud and Local
mongoose.connect("mongodb+srv://admin-crisd:"+ process.env.ADMIN_PASSWORD +"@todolist.47zpx.mongodb.net/todoListDB", {useNewUrlParser: true,  useFindAndModify: false }).then(connected => console.log('db connected') );
// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});



// Items schema
const itemsSchema = {
    name: String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: 'Welcome!'
})

const defaultItems = [item1];

const listSchema = {
    name : String,
    items : [itemsSchema]
}

const List = mongoose.model('List', listSchema);


app.get('/', function (req, res){
   
    Item.find({}, function(err, foundItems){
        console.log(foundItems.length);
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                } else{
                    console.log('Default items added to DB')
                }
            });
            res.redirect("/");
        } 
        else{
            res.render('list', {listTitle: "Today",   newListItems : foundItems});
        }
    })
})

app.get('/:customListName', function (req, res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                // Create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save()
                res.redirect("/" + customListName);

            }
            else{
                // Use an existing List
                res.render("list", {listTitle: foundList.name,   newListItems : foundList.items});
            }
        }
        else{
            console.log(err);
        }
    })    
})

app.post('/', function (req, res){
    const itemName = req.body.newItem;
    const listName = req.body.listName;

    const newItem = new Item({
        name: itemName
    });

    if(listName == "Today"){
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            console.log(foundList);
            foundList.items.push(newItem);
            foundList.save();
            res.redirect('/'+listName);
        })
    }

})


app.post('/delete', function(req, res){
    const checkItemID = req.body.checkbox;
    const listName = req.body.listName;

    // Check if i am deleteting from default list
    if(listName == 'Today'){
        Item.findByIdAndRemove(checkItemID, function(err){
            if(!err){
                res.redirect('/');
                console.log('Successfully deleted from default List')
            }
            else{
                console.log(err);
            }
        })
    } else {
        List.findOneAndUpdate(
            {name: listName},
            {$pull : {items: {_id : checkItemID}}},
            function(err, foundList){
                if(!err){
                    res.redirect('/'+listName);
                    console.log('Successfully deleted from ' + listName + ' list');
                } else {
                    console.log(err);
                }
            }   
        )
    }
})



app.get('/about', function(req,res){
    res.render('about')
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
    console.log('Server running at http://localhost:'+port+'/')
})
