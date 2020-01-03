BEGIN;

TRUNCATE live_alert_users, live_alert_alerts, live_alert_contacts RESTART IDENTITY CASCADE;

INSERT INTO live_alert_users (email, nick_name, password, safeword)
VALUES
  ('gz32drift@gmail.com', 'mace', '$2a$12$bLw1pKMVWyu1NHvbpN80/eoMeC63X.oGnR1H4hWr6K4CgWSDk5chu', 'drifter'),
  ('mreichba@mail.usf.edu', 'mason', '$2a$12$bLw1pKMVWyu1NHvbpN80/eoMeC63X.oGnR1H4hWr6K4CgWSDk5chu', 'apex'),
  ('test@test.com', 'nick', '$2a$12$bLw1pKMVWyu1NHvbpN80/eoMeC63X.oGnR1H4hWr6K4CgWSDk5chu', 'Test')
  ;

INSERT INTO live_alert_alerts (user_id, alert_time, latitude, longitude, alert_active) 
VALUES
  (1, '2019-01-03T00:00:00.000Z', 27.933448799999997, -82.34280249999999, true),
  (2, '2019-01-03T00:00:00.000Z', 27.933448799999997, -82.34280249999999, false)
  ;

INSERT INTO live_alert_contacts (user_id, user_contacts) 
VALUES
  (1, 2),
  (1, 3),
  (2, 3),
  (2, 1),
  (3, 1),  
  (3, 2)  
  ;

COMMIT;