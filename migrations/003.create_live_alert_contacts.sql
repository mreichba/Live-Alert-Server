-- +migration Up
CREATE TABLE live_alert_contacts (
  "id" INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "user_id" INTEGER REFERENCES "live_alert_users"(id) ON DELETE CASCADE,
  "user_contacts" INTEGER REFERENCES "live_alert_users"(id) ON DELETE CASCADE NOT NULL
);

-- +migration Down
DROP TABLE IF EXISTS "live_alert_contacts";