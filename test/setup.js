process.env.TZ = 'UTC';
require('dotenv').config();
const { expect } = require('chai');
const supertest = require('supertest');
//creates global variables for tests
global.expect = expect;
global.supertest = supertest;