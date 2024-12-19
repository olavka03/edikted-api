import express from 'express';
import { PORT } from './env';
import { middlewares } from './middlewares';
import { shippingProtectionRouter } from './routes/shipping-protection.route';

const app = express();

app.use(middlewares.cors);
app.use(middlewares.json);

app.use('/shipping-protection', shippingProtectionRouter);

app.use(middlewares.error);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
