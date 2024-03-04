The `get_most_recent_entries` function returns the most recent entries in the `links` table. The function is defined as
follows:

```postgresql
CREATE OR REPLACE FUNCTION get_most_recent_entries() RETURNS SETOF links AS
$$
SELECT *
FROM links
WHERE created_at
          = (SELECT MAX(created_at) FROM links)
$$ LANGUAGE sql;
```

The function is responsible for getting the most recent entries, and is used in the code for the home page which always
displays the entries of today (or yesterday or before the weekend)