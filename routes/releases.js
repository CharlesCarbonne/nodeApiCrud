var express = require('express')
var app = express()
var ObjectId = require('mongodb').ObjectId

// SHOW LIST OF USERS
app.get('/', function(req, res, next) {	
	// fetch and sort users collection by id in descending order
	req.db.collection('releases').find().sort({"_id": -1}).toArray(function(err, result) {
		//if (err) return console.log(err)
		if (err) {
			req.flash('error', err)
			res.render('release/list', {
				title: 'Release List', 
				data: ''
			})
		} else {
			// render to views/user/list.ejs template file
			res.render('release/list', {
				title: 'Release List', 
				data: result
			})
		}
	})
})

// SHOW ADD USER FORM
app.get('/add', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('release/add', {
		title: 'Add New Release',
		bandName: '',
		releaseTitle: '',
		year: '',
		country: '',
		format: '',
	})
})

// ADD NEW USER POST ACTION
app.post('/add', function(req, res, next){	
	req.assert('bandName', 'Band name is required').notEmpty()           //Validate name
	req.assert('releaseTitle', 'Title is required').notEmpty()             //Validate age
    req.assert('year', 'Year is required').notEmpty()  //Validate email
    req.assert('country', 'Country is required').notEmpty()  //Validate email
    req.assert('format', 'Format is required').notEmpty()  //Validate email


    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		var release = {
			bandName: req.sanitize('bandName').toString().toUpperCase(),
			releaseTitle: req.sanitize('releaseTitle'),
			year: req.sanitize('year').escape().trim(),
			country: req.sanitize('country').escape().trim(),
			format: req.sanitize('format').escape().trim()
		}
				 
		req.db.collection('releases').insert(release, function(err, result) {
			if (err) {
				req.flash('error', err)
				
				// render to views/user/add.ejs
				res.render('release/add', {
					title: 'Add New Release',
					bandName: release.bandName,
					releaseTitle: release.releaseTitle,
					year: release.year,
					country: release.country,					
					format: release.format					
				})

			} else {				
				req.flash('success', 'Data added successfully!')
				
				// redirect to user list page				
				res.redirect('/releases')
				
				// render to views/user/add.ejs
				/*res.render('user/add', {
					title: 'Add New User',
					name: '',
					age: '',
					email: ''					
				})*/
			}
		})		
	}
	else {   //Display errors to user
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})				
		req.flash('error', error_msg)		
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('release/add', { 
            title: 'Add New User',
            bandName: req.body.bandName,
            releaseTitle: req.body.releaseTitle,
            year: req.body.year,
            country: req.body.country,
            format: req.body.format,
        })
    }
})

// SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req, res, next){
	var o_id = new ObjectId(req.params.id)
	req.db.collection('releases').find({"_id": o_id}).toArray(function(err, result) {
		if(err) return console.log(err)
		
		// if user not found
		if (!result) {
			req.flash('error', 'Release not found with id = ' + req.params.id)
			res.redirect('/releases')
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			res.render('release/edit', {
				title: 'Edit Release', 
				//data: rows[0],
				id: result[0]._id,
				bandName: result[0].bandName,
				releaseTitle: result[0].releaseTitle,
				year: result[0].year,
				country: result[0].country,
				format: result[0].format,
			})
		}
	})	
})

// EDIT USER POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
	req.assert('bandName', 'Band name is required').notEmpty()           //Validate name
	req.assert('releaseTitle', 'Title is required').notEmpty()             //Validate age
    req.assert('year', 'Year is required').notEmpty()  //Validate email
    req.assert('country', 'Country is required').notEmpty()  //Validate email
    req.assert('format', 'Format is required').notEmpty()  //Validate email

    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		var release = {
			bandName: req.sanitize('bandName').toString().toUpperCase(),
			releaseTitle: req.sanitize('releaseTitle'),
			year: req.sanitize('year').escape().trim(),
			country: req.sanitize('country').escape().trim(),
			format: req.sanitize('format').escape().trim()
		}

		var o_id = new ObjectId(req.params.id)
		req.db.collection('releases').update({"_id": o_id}, user, function(err, result) {
			if (err) {
				req.flash('error', err)
				
				// render to views/user/edit.ejs
				res.render('release/edit', {
					title: 'Edit Release',
					id: req.params.id,
		            bandName: req.body.bandName,
		            releaseTitle: req.body.releaseTitle,
		            year: req.body.year,
		            country: req.body.country,
		            format: req.body.format,
				})
			} else {
				req.flash('success', 'Data updated successfully!')
				
				res.redirect('/releases')
				
				// render to views/user/edit.ejs
				/*res.render('user/edit', {
					title: 'Edit User',
					id: req.params.id,
					name: req.body.name,
					age: req.body.age,
					email: req.body.email
				})*/
			}
		})		
	}
	else {   //Display errors to user
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('user/edit', { 
            title: 'Edit User',            
            bandName: req.body.bandName,
            releaseTitle: req.body.releaseTitle,
            year: req.body.year,
            country: req.body.country,
            format: req.body.format,
        })
    }
})

// DELETE USER
app.delete('/delete/(:id)', function(req, res, next) {	
	var o_id = new ObjectId(req.params.id)
	req.db.collection('releases').remove({"_id": o_id}, function(err, result) {
		if (err) {
			req.flash('error', err)
			// redirect to users list page
			res.redirect('/releases')
		} else {
			req.flash('success', 'Release deleted successfully! id = ' + req.params.id)
			// redirect to users list page
			res.redirect('/releases')
		}
	})	
})

module.exports = app
