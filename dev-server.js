import 'dotenv/config';
import app from './api/_app.js';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Perla TableTrack API listening on http://localhost:${PORT}`);
});
