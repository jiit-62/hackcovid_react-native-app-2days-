import axios from 'axios';

export default axios.create({
  baseURL: "https://location-trackerserver.herokuapp.com"
})