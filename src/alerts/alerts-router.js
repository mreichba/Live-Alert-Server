const path = require('path');
const express = require('express');
const xss = require('xss');
const AlertsService = require('./alerts-services');
const jwt = require('../middleware/jwt-auth');

const alertsRouter = express.Router();
const jsonParser = express.json();

const serializeAlert = alert => ({
  id: alert.id,
  nick_name: xss(alert.nick_name),
  alert_time: alert.alert_time,
  longitude: alert.longitude,
  latitude: alert.latitude,
  alert_active: alert.alert_active,
  safeword: alert.safeword
});

alertsRouter
  .route('/contact-alerts')
  .all(jwt)
  .get((req, res, next) => {
    AlertsService.getAllMyContactAlerts(req.app.get('db'), req.user.id)
      .then(alerts => {
        res.json(alerts.map(serializeAlert));
      })
      .catch(next);
  });

alertsRouter
  .route('/')
  .all(jwt)
  .get((req, res, next) => {
    AlertsService.getAllMyAlerts(req.app.get('db'), req.user.id)
      .then(alerts => {
        res.json(alerts.map(serializeAlert));
      })
      .catch(next);
  })

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
    AlertsService.insertAlert(
      req.app.get('db'),
      newAlert
    )

      .then(alert => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${alert.id}`))
          .json(serializeAlert(alert));
      })
      .catch(next);
  });

alertsRouter
  .route('/:alert_id')

  .all((req, res, next) => {
    AlertsService.getById(
      req.app.get('db'),
      req.params.alert_id
    )
      .then(alert => {
        if (!alert) {
          return res.status(404).json({
            error: { message: `ERROR: Alert doesn't exist` }
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

  .delete((req, res, next) => {
    AlertsService.deleteAlert(
      req.app.get('db'),
      req.params.alert_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(jsonParser, (req, res, next) => {
    const { alert_active } = req.body;
    const alertToUpdate = { alert_active };
    const numberOfValues = Object.values(alertToUpdate).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain 'alert_active'`
        }
      });
    }
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