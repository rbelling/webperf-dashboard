import * as express from 'express';
import { IAudit } from 'wpt';
import { DEFAULT_AUDIT } from './const';
import DB from './influxdb';
import Logger from './logger';
import utils from './utils';
const router = express.Router();
const console = new Logger('[APP Collect Endpoint]: ');

router.get('/', async (req: express.Request, res: express.Response) => {
  const { query = {} } = req;
  const { url, saveInDB, mobile, fvonly, uastring, script } = {
    ...DEFAULT_AUDIT,
    ...query
  } as IAudit;
  if (!url) return res.status(400).send('missing `url` in you request.');
  try {
    console.log(`Audit for ${url}`);
    const reportJSON = await utils.audit(url, mobile, fvonly, uastring, script);
    const parsedReport = utils.parseReport(reportJSON);
    if (saveInDB) DB.saveInDB(url, mobile, fvonly, parsedReport);
    res.status(201).send(parsedReport);
  } catch (err) {
    console.log(`Failed to get or save data for ${url} ${JSON.stringify(err)}`);
    res.sendStatus(500);
  }
});

export default router;
