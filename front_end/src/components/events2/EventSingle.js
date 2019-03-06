import React from "react";
import axios from "axios";
import firebase from 'firebase';
import { connect } from "react-redux";
import { getEvent, updateEvent, inviteEvent } from "../../store/actions/eventsActions";
import {
  getComments,
  makeComment,
  deleteComment,
  updateComment,
} from "../../store/actions/commentsActions";
// import {
//   Comment,
//   FormComment,
//   CommentSubmit,
//   DeleteBtn,
//   FlexDiv
// } from "./eventsingle_css.js";

import {fetchFriends} from '../../store/actions/friendsActions'
import {searchUsers} from '../../store/actions/userActions'


// import { Container } from "./eventsingle_css.js";
import { fetchUser, searchUsers } from "../../store/actions/userActions";
import Popup from "reactjs-popup";
import "./create_event.css"
import GoogleMapReact from 'google-map-react';
// import SearchBox from 'react-google-maps'

import { MapDiv, YelpDiv } from "./create_event_css.js";
import { withAlert } from 'react-alert';
import DrawerBar from "../drawer/Drawer";

// --> Edit Event Form
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { fade } from '@material-ui/core/styles/colorManipulator';
import SaveIcon from '@material-ui/icons/Save';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import classNames from 'classnames';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import "date-fns";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import DateFnsUtils from "@date-io/date-fns";
import SearchIcon from '@material-ui/icons/Search';
import {
  MuiPickersUtilsProvider,
  TimePicker,
  DatePicker
} from "material-ui-pickers";
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Image from 'react-image-resizer';
import './custom.css'

import { Link } from "react-router-dom";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";

const styles = theme => ({
  root: {
    width: "100%"
  },
  grid: {
    width: "100%",        
    borderRadius: 10,
    padding: 10
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "100%",
  },
  button: {
    margin: theme.spacing.unit,
    backgroundColor: "lightgreen",
    width: "60%"
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  iconSmall: {
    fontSize: 20,
  },  

  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 3,
      width: 'auto',
    },
  },

  searchIcon: {
    width: theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  marginT: {
    marginTop: 6
  },
  media: {
    height: 140,
  },

});

const image = {
  border: '1px solid #ccc',
  background: '#fefefe',
  marginBottom: 5
}

const TacoLocation = ({ text }) => <div className="taco">{text}</div>;

class EventSingle extends React.Component {
  state = {
    content: "",
    editComment: "",
    venue: '',
    date: '',
    location: '',
    posted_by: '',
    price: '',
    raiting: '',
    url: '',
    img_url: '',
    attending: [],
    loaded: false,
    picture: '',
    pic_url: '',
    show_update: false,
    modalOpened: false,
    show_map: false,
    checkedInvite: false,
    selectedDate: new Date(),
    city_location: "",
    taco_places: [],
    destinations: [],
    zoom: 13,
    lat_av: 0,
    lon_av: 0,
    currentPage: 1,
    tacosPerPage: 6,
    location: '',
    search: ""
  };

  fileSelect = (event) => {
    // console.log(event.target.files[0]);
    this.setState({
      picture: event.target.files[0]
    })
  }

  handleClick = (event) => {
    this.setState({
      currentPage: Number(event.target.id)
    })
  }

  postImage = (comment) => {

    let present = firebase.functions().app_.options_.upload_present
    
    const formData = new FormData();

    formData.append('file', this.state.picture)
    formData.append('upload_preset', present)

    axios({
      url: "https://api.cloudinary.com/v1_1/hhxek2qo9/upload",
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: formData
    })
    .then(res => {
      this.setState({
        pic_url: res.data.secure_url
      })
      console.log(res)
    })
    .then(() => {
      comment.pic_url = this.state.pic_url
      this.props.makeComment(comment, this.props.match.params.id);
      this.setState({
        content: ""
      });
    })
    .catch(error => {
      console.log(error)
    })
  }


  componentDidMount() {
    this.props.getComments(this.props.match.params.id);
    this.props.fetchUser(localStorage.getItem("user_id"));
    this.info()
    this.props.fetchFriends(localStorage.getItem("user_id"))
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleEdit = event => {
    this.setState({ editComment: event.target.value });
  };

  info = () => {
    axios.get(`https://production-taco.herokuapp.com/events/${this.props.match.params.id}`)
    .then(res => {
      console.log(res)
      this.setState({        
        date: res.data.date,        
        posted_by: res.data.users[0].name,        
        attending: res.data.users,
        loaded: true,
        checkedInvite: res.data.invite_only,
        selectedDate: res.data.date
      });
    })
  }

  leaveEvent = event => {
    event.preventDefault();
    console.log('connected')
    // let user_id = parseInt(localStorage.getItem("user_id"))
    let obj =  {data: { user_id: parseInt(localStorage.getItem("user_id")), event_id: parseInt(this.props.match.params.id)}}
    console.log(obj)
    axios.delete('https://production-taco.herokuapp.com/users_events', obj)
    .then(res => {
      if (res.data.msg){
        this.props.alert.show(res.data.msg)
      } else {
        this.props.alert.show('You are no long attending event')
      }
      this.info()
    })
    .catch(error => {
      console.log(error)
    })
  }

  attendEvent = event => {
    event.preventDefault();
    console.log('connected')
    let obj = { user_id: parseInt(localStorage.getItem("user_id")), event_id: parseInt(this.props.match.params.id)}
    console.log(obj)
    axios.post('https://production-taco.herokuapp.com/users_events', obj)
    .then(res => {
      console.log(res)
      this.info()
      if (res.data.msg){
        this.props.alert.show(res.data.msg)
      } else {
        this.props.alert.show('You are now attending event')
      }
    })
    .catch(error => {
      console.log(error)
    })
  }

  createComment = event => {
    event.preventDefault();

    let today = new Date().toDateString();
    let comment = {
      content: this.state.content,
      date: today,
      posted_by: this.props.user.name,
      event_id: parseInt(this.props.match.params.id),
      posters_email: this.props.user.email,
    };

    if (this.state.picture){
      this.postImage(comment)
      return
    }

    this.props.makeComment(comment, this.props.match.params.id);

    this.setState({
      content: ""
    });
  };

  commentUpdate = event => {
    event.preventDefault();
    let comment = {
      id: parseInt(event.target.id),
      event_id: parseInt(this.props.match.params.id),
      posted_by: this.props.user.name,
      content: this.state.editComment,
    };
    
    this.props.updateComment(comment);
    this.setState({
      editComment: ""
    });
  };

  commentDelete = event => {
    event.preventDefault();
    let ids = {
      comment_id: parseInt(event.target.id),
      event_id: parseInt(this.props.match.params.id)
    };
    let obj = { data: ids };
    let cid = obj.data.comment_id;
    this.props.deleteComment(obj, cid);
  };  

  addFav = event => {
    event.preventDefault();
    let obj = {name: this.state.venue, location: this.state.location, user_id: parseInt(localStorage.getItem("user_id"))}

    axios.post('https://production-taco.herokuapp.com/favorites', obj)
    .then(res => {
      // console.log(res)
      if (res.data.msg){
        this.props.alert.show(res.data.msg)
      } else {
        this.props.alert.show(`${this.state.venue} added to favorites`)
      }
    })
    .catch(error => {
      console.log(error);
    })
  };

  openModal = () => {
    this.state.modalOpened === false ? (
      this.setState({ modalOpened: true })
    ) : (
      this.setState({ modalOpened: false })
    )
  }

  handleDateChange = date => {
    this.setState({ selectedDate: date });
  };

  handleChange = event => {    
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSwitchChange = name => event => {
    this.setState({ [name]: event.target.checked });
    console.log(`${[name]}: ${event.target.checked}`);
  };
  
  handleSearchChange = e => {
    this.setState({ search: [e.target.value] });    
  };

  handleSubmitUsers = e => {
    e.preventDefault();
    this.props.searchUsers(this.state.search);
    this.setState({ search: "" });    
    let box = document.getElementById("results");
    box.style.display = "inline-block";    
  };

  handleInvite = e => {
    e.preventDefault();
    let inviteObject = { // --> we need to create the expected invite object before we send it
      user_id: this.props.users[0].id,
      event_id: this.props.match.params.id
    };
    this.props.inviteEvent(inviteObject);
  };

  switchForm = () => {
    this.setState({
      show_update: !this.state.show_update,
    })
  }

  searchMap = event => {

    let key = firebase.functions().app_.options_.yelpkey;

    let city = this.state.city_location;
    axios
      .get(
        `${"https://cors-anywhere.herokuapp.com/"}https://api.yelp.com/v3/businesses/search?term=taco&location=${city}&categories=mexican`,
        {
          headers: {
            Authorization: `Bearer ${key}`
          }
        }
      )
      .then(res => {
        console.log(res);

        let destinations = [];
        let obj;
        let biz = res.data.businesses;
        let lat_ar = [];
        let lon_ar = [];

        for (let i = 0; i < biz.length; i++) {
          obj = {
            lat: biz[i].coordinates.latitude,
            lon: biz[i].coordinates.longitude,
            name: biz[i].name
          };
          lat_ar.push(biz[i].coordinates.latitude);
          lon_ar.push(biz[i].coordinates.longitude);
          destinations.push(obj);
        }

        const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

        const av_lat = average(lat_ar);
        const av_lon = average(lon_ar);

        this.setState({
          city_location: "",
          taco_places: res.data.businesses,
          destinations: destinations,
          lat_av: av_lat,
          lon_av: av_lon,
          show_map: true
        });
      })
      .catch(error => {
        //this.props.alert.show("invalid city");
        console.log(error);
        this.setState({
          city_location: ""
        });
      });
  };

  addVenue = (obj) => {
    this.props.updateEvent(obj, this.props.match.params.id)
  }



  render() {       
    console.log("this.props is: \n");
    console.log(this.props);
    const { classes } = this.props;
    console.log(this.state)
    console.log(this.props)

    const {taco_places, currentPage, tacosPerPage} = this.state
    const indexOfLastTaco = currentPage * tacosPerPage;
    const indexOfFirstTaco = indexOfLastTaco - tacosPerPage;
    const currentTacos = taco_places.slice(indexOfFirstTaco, indexOfLastTaco);
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(taco_places.length / tacosPerPage); i++) {
      pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map(number => {
      return (
        <button
          key={number}
          id={number}
          onClick={this.handleClick}
          className="btnMargin"
        >
          {number}
        </button>
      );
    });

    return (
      <div>

        <DrawerBar />
        <div class="container">
          {this.state.posted_by === this.props.auth.displayName ? (
            <div>
              <Button variant="contained" color="primary" >
                Primary
              </Button>

              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid
                  container
                  className={classes.grid}
                  justify="space-evenly"
                >
                  <DatePicker
                    required
                    margin="normal"
                    label="Date picker"
                    value={this.state.selectedDate}
                    onChange={this.handleDateChange}
                  />

                  <TimePicker
                    required
                    margin="normal"
                    label="Time picker"
                    value={this.state.selectedDate}
                    onChange={this.handleDateChange}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.checkedInvite}
                        onChange={this.handleSwitchChange('checkedInvite')}
                        value= {this.state.checkedInvite}
                      />
                    }
                    label="Invite Only"
                  />
                  

                  <TextField                      
                    id="standard-name"
                    name = "city_location" // --> needs a name attribute so it'll load correctly
                    label="Search taco places by city"
                    className={classes.textField}
                    value={this.state.city_location}
                    onChange={this.handleChange}
                    type = "text"
                    margin="normal"
                  /> 

                  <Button 
                    variant="contained" 
                    className={classes.marginT}
                    onClick={() => {this.searchMap(this.state.city_location)}}

      <DrawerBar />

      {this.state.posted_by === this.props.auth.displayName ? (     
        <div className = {classes.root} style = {{ paddingLeft: 150, display: "flex", width: "100%", height: 50, justifyContent: "space-evenly", alignItems: "center" }}>
          <h1>You are the author of this event</h1>          
          <Popup trigger = {<Button variant="contained" color="primary" className= "save-button">Update</Button>} modal>
            {close => (
              <div className = "modal-open">
                <a className = "close-modal" onClick = {close}>&times;</a> {/* Close Button "X" */}
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Grid
                    container
                    className={classes.grid}
                    justify="space-evenly"

                  >
                    Search
                  </Button>
                </Grid>

                {this.state.show_map ? (
                  <MapDiv>
                    <GoogleMapReact
                      bootstrapURLKeys={{
                        key: firebase.functions().app_.options_.googlekey
                      }}
                      defaultZoom={this.state.zoom}
                      defaultCenter={{ lat: this.state.lat_av, lng: this.state.lon_av }}
                    >
                      {this.state.destinations.map((d, i) => {
                        return <TacoLocation lat={d.lat} lng={d.lon} text={d.name} key={i} />;
                      })}
                    </GoogleMapReact>
                  </MapDiv>
                ) : null}

              <div class="flex1">
                {currentTacos.map((t, idx) => {
                  return (
                <Card className="card">
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h2">
                        {t.name}
                      </Typography>
                       <Image
                          src={t.image_url}
                          width={220}
                          height={220}
                          style={image}
                          key={idx}
                        />

                      <Typography component="p">
                        Location:{" "}
                        {`${t.location.display_address[0]} ${
                          t.location.display_address[1]
                        }`}<br/>
                        Rating: {t.rating}<br/>
                        Price: {t.price}<br/>
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <Button size="small" color="primary">
                      <a href={t.url} className="noUnderline">View on Yelp</a>
                    </Button>
                    <Button size="small" color="primary" 
                      onClick={() => {this.addVenue(
                        {
                          lat: t.coordinates.latitude,
                          lon: t.coordinates.longitude,
                          venue: t.name,
                          img_url: t.image_url,
                          location: `${t.location.display_address[0]} ${
                            t.location.display_address[1]
                          }`,
                          raiting: t.rating,
                          price: t.price,
                          url: t.url
                        }
                      )}}
                    >
                      Add Location
                    </Button>
                  </CardActions>
                </Card>
                  )
                })}

                      }
                      label="Invite Only"
                    />

                    <TextField                      
                      id="standard-name"
                      name = "location" // --> needs a name attribute so it'll load correctly
                      label="Location Name"
                      className={classes.textField}
                      value={this.state.location}
                      onChange={this.handleChange}
                      type = "text"
                      margin="normal"
                    />  

                    <div className={classes.search}>
                      <div className={classes.searchIcon}>
                        {/* <SearchIcon onSubmit = {this.handleSubmitUsers}/> */}
                      </div>
                      <form
                        className={classes.container}
                        noValidate
                        autoComplete="off"
                        onSubmit={this.handleSubmitUsers}
                      >
                        <TextField
                          id="standard-search"
                          label="Invite More People"
                          type="search"
                          className={classes.textField}
                          margin="normal"
                          value={this.state.search}
                          onChange={this.handleSearchChange}
                        />
                      </form> 
                      <div id="results" ref={node => (this.node = node)}>
                        <List>
                          {this.props.users.map(result => {
                            if (result !== undefined) {
                              return (
                                <Link key = {result.name} to={`user/${result.id}`}>
                                  <ListItem className="resultsDisplay">
                                    <ListItemAvatar className="location-picture">
                                      <Avatar src={result.user_pic} />
                                    </ListItemAvatar>
                                    <ListItemText primary={result.name} />
                                    <IconButton aria-label="Add">
                                    <Icon onClick={this.handleInvite} id={result.id}>
                                      +
                                    </Icon>
                                  </IconButton>                                    
                                  </ListItem>
                                  <Divider />
                                </Link>
                              );
                            }
                          })}
                        </List>
                      </div>                     
                    </div>
                  </Grid>
                </MuiPickersUtilsProvider>

              </div>
              </MuiPickersUtilsProvider>
              {renderPageNumbers}
            </div>

          ) : null } 
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.userReducer.user,
    users: state.userReducer.users,
    event: state.eventsReducer.event,
    attendees: state.eventsReducer.attendees,
    comments: state.commentsReducer.comments,
    auth: state.firebase.auth,  
    friends: state.friendsReducer.friends,
    users: state.userReducer.users 
  };
};


export default connect(mapStateToProps,{getEvent,updateEvent,getComments,fetchUser,makeComment,deleteComment,updateComment, fetchFriends, searchUsers})(withStyles(styles)(EventSingle));

export default connect(mapStateToProps,{
  getEvent,
  updateEvent,
  getComments,
  fetchUser,
  searchUsers,
  makeComment,
  deleteComment,
  updateComment,
  inviteEvent
})(withStyles(styles)(EventSingle));

