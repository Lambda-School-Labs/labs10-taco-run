const express = require('express');
const router = express.Router();
const knex = require("knex")
const dbConfig = require('../knexfile')
const db = require("../config.js")


//Create
//create a new event
//post http://localhost:5555/events
//-------------------------------------------
router.post('', (req, res) => {
	const {name, date, author, user_id, posters_email, invite_only } = req.body;

	/* first we check to see if the event already exists*/
	db('events')
	.where({name})
	.then(check => {
		//if it does not already exist we can create it
		if (check.length === 0){
			db.insert({name, date, author, user_id, posters_email, invite_only }).into('events')
			.then(() => {
				db('events')
				.where({name, date, author, user_id, posters_email })
				.then(r1 => { //extra work around to get the id of the event to pass to the many to many join table
					id = r1[0].id
					let obj = {user_id, event_id: id, isPending: false}
					//now that event is created we sign up the user as someone going to the event
					db.insert(obj).into('users_events')
					.then(r2 => {
						return res.status(200).json(r2)
					})
				})
			})
			.catch(error => {
				console.log(error)
				return res.status(500).json(error)
			})//end of if statement
		} else {
			//if event already exists then we let the user know it is already there
			return res.status(200).json({msg: 'event is already present'})
		}
	})

})

//READ
//get all events
//get http://localhost:5555/events
//-------------------------------------------
router.get('', (req, res) => {
	db('events')
	.then(response => {
		return res.status(200).json(response)
	})
	.catch(error => {
		return res.status(500).json(error)
	})
})

//READ
//get all the users for an event + event info
//get http://localhost:5555/events/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db("events")
    .join("users_events", "users_events.event_id", "=", "events.id")
    .join("users", "users.id", "=", "users_events.user_id")
    .where("events.id", id)
    .then(resp => {
    	console.log(resp)
    	let users_ar = []
    	
    	for (let i = 0; i < resp.length; i++){
    		if (resp[i].isPending === false){
    			users_ar.push({name: resp[i].name, email: resp[i].email, id: resp[i].user_id})
    		}
    	}

    	let obj = {
    		users: users_ar,    		
    		invite_only: resp[0].invite_only,
    		location: resp[0].location,
    		venue: resp[0].venue,
    		date: resp[0].date,
    		img_url: resp[0].img_url,
    		raiting: resp[0].raiting,
    		price: resp[0].price,
    		lat: resp[0].lat,
    		lon: resp[0].lon,
    		url: resp[0].url,
    		email: resp[0].email
    	}
      res.status(200).json(obj);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json(error);
    });
});

//READ
//get all comments for an event
//get http://localhost:5555/events/:id/comments
router.get("/:id/comments", (req, res) => {
	const { id } = req.params
	db('events')
	.join("comments", "events.id", "=", "comments.event_id")
	.where("events.id", id)
	.then(resp => {
		let ar = []

		for (let i = 0; i < resp.length; i++){
			ar.push({content: resp[i].content, date: resp[i].date, id: resp[i].id, posted_by: resp[i].posted_by, posters_email: resp[i].posters_email, pic_url: resp[i].pic_url})
		}

		let obj = {comments_info: ar}
		return res.status(200).json(obj)

	})
	.catch(err => {
		console.log(err)
		return res.status(500).json(err)
	})
});

//UPDATE
//update an event
//put http://localhost:5555/events/:id
//-------------------------------------------

router.put('/:id', (req, res) => {	
	const {name, date, location, venue, author, lat, lon, img_url, raiting, price, url, invite_only } = req.body;	
	const { id } = req.params;	
	db('events')
	.where({id})
	.update({name, date, location, venue, author, lat, lon, img_url, raiting, price, url, invite_only })
	.then(response => {
		return res.status(200).json(response)
	})
	.catch(error => {
		return res.status(500).json(error)
	})
})



//DELETE
//delete an event
//delete http://localhost:5555/events/:id
//-------------------------------------------
router.delete('/:id', (req, res) => {
	const {id} = req.params
	db('events')
	.where({id})
	.del()
	.then(response => {
		return res.status(200).json(response)
	})
	.catch(error => {
		return res.status(500).json(error)
	})
})

module.exports = router;