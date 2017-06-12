/**
 * Created by yqf on 5/21/17.
 */
import axios from 'axios';

const BACKEND0 = 'http://127.0.0.1:28000';
const BACKEND1 = 'http://127.0.0.1:28000';

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  return response.data;
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

export function getList(category, name) {
  return axios.get(`${BACKEND0}/gallery/${category}/${name}`)
    .then(checkStatus)
    .then(parseJSON);
}

export function getObjects(category, name, idx) {
  return axios.get(`${BACKEND0}/gallery/${category}/${name}/${idx}/objects`)
    .then(checkStatus)
    .then(parseJSON);
}

export function processImage0(category, file) {
  const data = new FormData();
  data.set('file', file);
  return axios.post(`${BACKEND0}/gallery/${category}/evaluating/new/img`, data)
    .then(checkStatus)
    .then(parseJSON);
}

export function processImage1(category, file) {
  const data = new FormData();
  data.set('file', file);
  return axios.post(`${BACKEND1}/gallery/${category}/evaluating/new/img`, data)
    .then(checkStatus)
    .then(parseJSON);
}

export function getBackendURL() {
  return BACKEND0;
}