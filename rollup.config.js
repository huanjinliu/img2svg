import prod from './build/prod.build.js';
import dev from './build/dev.build.js';

/**
 * 打包队列
 */
const buildQueue = [prod];

if (process.env.NODE_ENV === 'development') buildQueue.push(dev);

export default buildQueue;
