const path = require('path');
const express = require('express');
const xss = require('xss');
const AlertsService = require('./alerts-services');
const jwt = require('../middleware/jwt-auth');
const alertsRouter = express.Router();
const jsonParser = express.json();
//tidy serialize function that also prevents xss attacks
const serializeAlert = alert => ({
  id: alert.id,
  nick_name: xss(alert.nick_name),
  alert_time: alert.alert_time,
  longitude: alert.longitude,
  latitude: alert.latitude,
  alert_active: alert.alert_active,
  safeword: xss(alert.safeword)
});
//Router for users contact alerts (/api/alerts/contact-alerts)
alertsRouter
  .route('/contact-alerts')
  .all(jwt)//protects all / endpoints with JWT
  .get((req, res, next) => {
    // gets all the users contact alerts from alerts database
    AlertsService.getAllMyContactAlerts(req.app.get('db'), req.user.id)
      .then(alerts => {
        res.json(alerts.map(serializeAlert));
      })
      .catch(next);
  });
// Router for alerts (/api/alerts)
alertsRouter
  .route('/')
  .all(jwt)//protects all / endpoints with JWT
  .get((req, res, next) => {
    //gets all the users alerts from alert database
    AlertsService.getAllMyAlerts(req.app.get('db'), req.user.id)
      .then(alerts => {
        res.json(alerts.map(serializeAlert));
      })
      .catch(next);
  })
  //POST's a new alert
  .post(jsonParser, (req, res, next) => {
    const { alert_time, longitude, latitude, alert_active } = req.body;
    const newAlert = { user_id: req.user.id, alert_time, longitude, latitude, alert_active };
    for (const [key, value] of Object.entries(newAlert)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    //inserts alert into alert database
    AlertsService.insertAlert(
      req.app.get('db'),
      newAlert
    )
      .then(alert => {
        res
          .status(201)
          .json(serializeAlert(alert));
      })
      .catch(next);
  });
//Router for dynamic alerts 
alertsRouter
  .route('/:alert_id')
  .all(jwt)//protects all / endpoints with JWT
  .all((req, res, next) => {
    //gets alert by alert id
    AlertsService.getById(
      req.app.get('db'),
      req.params.alert_id
    )
      .then(alert => {
        if (!alert) { //verifies alert
          return res.status(404).json({
            error: { message: 'ERROR: Alert doesn\'t exist' }
          });
        }
        res.alert = alert;
        next();
      })
      .catch(next);
  })

  .get((req, res, next) => {
    res.json(serializeAlert(res.alert));
  })
  //****FOR WHEN ADMIN PAGE IS ADDED********* */
  // .delete((req, res, next) => {
  //   AlertsService.deleteAlert(
  //     req.app.get('db'),
  //     req.params.alert_id
  //   )
  //     .then(() => {
  //       res.status(204).end();
  //     })
  //     .catch(next);
  // })

  // only allows change to alert_active portion of alerts for safety purposes
  .patch(jsonParser, (req, res, next) => {
    const { alert_active } = req.body;
    const alertToUpdate = { alert_active };
    const numberOfValues = Object.values(alertToUpdate).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: 'Request body must contain \'alert_active\''
        }
      });
    }
    //updates alerts database for current user
    AlertsService.updateAlert(
      req.app.get('db'),
      req.params.alert_id,
      alertToUpdate
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });


module.exports = alertsRouter;