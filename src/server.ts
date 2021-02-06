import app from './app';
import * as psql from './db/psql';

const PORT = process.env.PORT || 3000;

// init database
psql.init();
// server listen
app.listen(PORT, () => console.log(`LINE Works ActionHub listening on port ${PORT}!`));
