/*jshint esversion: 6 */

var express = require('express');
var app = express();
var ObjectId = require('mongodb').ObjectId;

	const mongoClient = require('mongodb').MongoClient;
	const mongoDbUrl = 'mongodb://user1:passw0rd@ds155294.mlab.com:55294/student';
	var dbcol;
	
	// Connect to MongoDB
	mongoClient.connect(mongoDbUrl).then(db => {

		dbcol = db.collection('users');  // Reuse dbcol for DB CRUD operations

		}).catch(err => {

    // logs message upon error connecting to mongodb
    console.log('error connecting to mongodb', err);

	});


// SHOW LIST OF USERS
app.get('/', function(req, res, next) {	
	// fetch and sort users collection by id in descending order

	dbcol.find().sort({"_id": -1}).toArray (function(err, result) {
		//if (err) return console.log(err)
		if (err) {
			req.flash('error', err);
			res.render('user/list', {
				title: 'User List', 
				data: ''
			});
		} else {
			// render to views/user/list.ejs template file
			res.render('user/list', {
				title: 'User List', 
				data: result
			});
		}
	});
});

// SHOW ADD USER FORM
app.get('/add', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('user/add', {
		title: 'Add New User',
		fname: '',
		lname: '',
		  age: '',
	   mobile: '',
		email: ''		
	});
});


// ADD NEW USER POST ACTION
app.post('/add', function(req, res, next){	
	req.assert('fname', 'First Name is required').notEmpty();          //Validate name
	req.assert('lname', 'Last Name is required').notEmpty();
	req.assert('age', 'Age is required').notEmpty();
	req.assert('mobile', 'Mobile Number is required').notEmpty();		//Validate age
    req.assert('email', 'A valid email is required').isEmail();  //Validate email

    var errors = req.validationErrors();
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		var user = {
			fname: req.sanitize('fname').escape().trim(),
			lname: req.sanitize('lname').escape().trim(),
			age: req.sanitize('age').escape().trim(),
			mobile: req.sanitize('mobile').escape().trim(),
			email: req.sanitize('email').escape().trim()
		};
				 
		dbcol.insert(user, function(err, result) {
			if (err) {
				req.flash('error', err);
				
				// render to views/user/add.ejs
				res.render('user/add', {
					title: 'Add New User',
					fname: user.fname,
					lname: user.lname,
					age: user.age,
					mobile: user.mobile,
					email: user.email					
				});
			} else {				
				req.flash('success', 'Data added successfully!');
				
				// redirect to user list page				
				res.redirect('/users');
			}
		});		
	}
	else {   //Display errors to user
		var error_msg = '';
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>';
		});
		req.flash('error', error_msg);	
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('user/add', { 
            title: 'Add New User',
            fname: req.body.fname,
            lname: req.body.lname,
            age: req.body.age,
            mobile: req.body.mobile,
            email: req.body.email
        });
    }
});

// SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req, res, next){
	var o_id = new ObjectId(req.params.id);
	dbcol.find({"_id": o_id}).toArray(function(err, result) {
		if(err) {
			return console.log(err);
		}
		
		// if user not found
		if (!result) {
			req.flash('error', 'User not found with id = ' + req.params.id);
			res.redirect('/users');
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			res.render('user/edit', {
				title: 'Edit User', 
				//data: rows[0],
				id: result[0]._id,
				fname: result[0].fname,
				lname: result[0].lname,
				age: result[0].age,
				mobile: result[0].mobile,
				email: result[0].email					
			});
		}
	});
});

// EDIT USER POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
	req.assert('fname', 'First Name is required').notEmpty();           //Validate name
	req.assert('lname', 'Last Name is required').notEmpty();
	req.assert('age', 'Age is required').notEmpty();
	req.assert('mobile', 'Mobile Number is required').notEmpty();			//Validate age
    req.assert('email', 'A valid email is required').isEmail();  //Validate email

    var errors = req.validationErrors();
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		var user = {
				fname: req.sanitize('fname').escape().trim(),
				lname: req.sanitize('lname').escape().trim(),
				age: req.sanitize('age').escape().trim(),
				mobile: req.sanitize('mobile').escape().trim(),
				email: req.sanitize('email').escape().trim()
		};
		
		var o_id = new ObjectId(req.params.id);
		dbcol.update({"_id": o_id}, user, function(err, result) {
			if (err) {
				req.flash('error', err);
				
				// render to views/user/edit.ejs
				res.render('user/edit', {
					title: 'Edit User',
					id: req.params.id,
					fname: req.body.fname,
					lname: req.body.lname,
					age: req.body.age,
					mobile: req.body.mobile,
					email: req.body.email
				});
			} else {
				req.flash('success', 'Data updated successfully!');
				
				res.redirect('/users');
			}
		});	
	}
	else {   //Display errors to user
		var error_msg = '';
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>';
		});
		req.flash('error', error_msg);
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('user/edit', { 
            title: 'Edit User',            
			id: req.params.id, 
			fname: req.body.fname,
			lname: req.body.lname,
			 age: req.body.age,
			mobile:req.body.mobile,
			email: req.body.email
        });
    }
});

// DELETE USER
app.delete('/delete/(:id)', function(req, res, next) {	
	var o_id = new ObjectId(req.params.id);
	dbcol.remove({"_id": o_id}, function(err, result) {
		if (err) {
			req.flash('error', err);
			// redirect to users list page
			res.redirect('/users');
		} else {
			req.flash('success', 'User deleted successfully! id = ' + req.params.id);
			// redirect to users list page
			res.redirect('/users');
		}
	});	
});

module.exports = app;
