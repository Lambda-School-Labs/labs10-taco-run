const express = require("express");
const router = express.Router();
const knex = require("knex");
const dbConfig = require("../knexfile");
const db = require("../config.js");

//Create
//create a new event
//post http://localhost:5555/events
//-------------------------------------------

router.post("", (req, res) => {
  const {
    name,
    date,
    location,
    venue,
    author,
    user_id,
    posters_email,
    invite_only
  } = req.body;
  
  /* first we check to see if the event already exists*/
  db("events")
    .where({ name, posters_email })
    .then(res1 => {
      // Create event
      if (res1.length === 0) {
        db("events")
          .insert({
            name,
            date,
            location,
            venue,
            author,
            user_id,
            posters_email,
            invite_only
          })
          .then(res2 => {
            // Get event id
            db("events")
              .where({
                name,
                date,
                location,
                venue,
                author,
                user_id,
                posters_email,
                invite_only
              })
              .then(res3 => {
                var event_id = res3[0].id;
                // if invite only is true then only set relationship for said user
                if (invite_only === true) {
                  db("users_events")
                    .insert({
                      user_id,
                      event_id: event_id,
                      isPending: false
                    })
                    .then(res4 => {
                      console.log("res4");
                      res.status(200).json(res4);
                    })
                    .catch(err => {
                      res.status(500).json(err);
                    });
                } else {
                  console.log("invite only is false", user_id);
                  db("users_friends")
                    .join("users", "users.id", "=", "users_friends.friends_id")
                    .where("users_friends.user_id", user_id)
                    .then(res5 => {
                      // Insert into user
                      db("users_events")
                        .insert({
                          user_id,
                          event_id: event_id,
                          isPending: false
                        })
                        .then(res6 => {
                          // For every friend of user create relationship
                          for (let i = 0; i < res5.length; i++) {
                            const id = res5[i].friends_id;
                            console.log(id, event_id);
                            db("users_events")
                              .insert({
                                user_id: id,
                                event_id: event_id,
                                isPending: true
                              })
                              .then(res7 => {
                                res.status(200).json(res7);
                              });
                          }
                        })
                        .catch(err => {
                          res.status(500).json(err);
                        });
                    })
                    .catch(err => {
                      res.status(500).json(err);
                    });
                }
              })
              .catch(err => {
                res.status(500).json(err);
              });
          })
          .catch(err => {
            res.status(500).json(err);
          });
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

//READ
//get all events
//get http://localhost:5555/events
//-------------------------------------------
router.get("", (req, res) => {
  db("events")
    .then(response => {
      return res.status(200).json(response);
    })
    .catch(error => {
      return res.status(500).json(error);
    });
});

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
      console.log(resp);
      let users_ar = [];

      for (let i = 0; i < resp.length; i++) {
        if (resp[i].isPending === false) {
          users_ar.push({
            name: resp[i].name,
            email: resp[i].email,
            id: resp[i].user_id
          });
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
      };
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
  const { id } = req.params;
  db("events")
    .join("comments", "events.id", "=", "comments.event_id")
    .where("events.id", id)
    .then(resp => {
      let ar = [];

      for (let i = 0; i < resp.length; i++) {
        ar.push({
          content: resp[i].content,
          date: resp[i].date,
          id: resp[i].id,
          posted_by: resp[i].posted_by,
          posters_email: resp[i].posters_email,
          pic_url: resp[i].pic_url
        });
      }

      let obj = { comments_info: ar };
      return res.status(200).json(obj);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json(err);
    });
});

//UPDATE
//update an event
//put http://localhost:5555/events/:id
//-------------------------------------------

router.put("/:id", (req, res) => {
  const {
    name,
    date,
    location,
    venue,
    author,
    lat,
    lon,
    img_url,
    raiting,
    price,
    url,
    invite_only
  } = req.body;
  const { id } = req.params;
  db("events")
    .where({ id })
    .update({
      name,
      date,
      location,
      venue,
      author,
      lat,
      lon,
      img_url,
      raiting,
      price,
      url,
      invite_only
    })
    .then(response => {
      return res.status(200).json(response);
    })
    .catch(error => {
      return res.status(500).json(error);
    });
});

//DELETE
//delete an event
//delete http://localhost:5555/events/:id
//-------------------------------------------
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db("events")
    .where({ id })
    .del()
    .then(response => {
      return res.status(200).json(response);
    })
    .catch(error => {
      return res.status(500).json(error);
    });
});

module.exports = router;
