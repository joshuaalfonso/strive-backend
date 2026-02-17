import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import userRoute from './routes/user.route.js'
import { prettyJSON } from 'hono/pretty-json';
import { cors } from 'hono/cors';
import projectRoute from './routes/project.route.js';
import workspaceMemberRoute from './routes/workspaceMember.route.js';
import taskRoute from './routes/task.route.js';
import taskStatusRoute from './routes/taskStatus.route.js';


const app = new Hono();

app.use(prettyJSON());
app.use(cors())

app.get('/', (c) => {
   return c.json({ message: 'Strive server is alive 🐬' })
})

app.route('/user', userRoute);
app.route('/project', projectRoute);
app.route('/workspace-member', workspaceMemberRoute);
app.route('task', taskRoute),
app.route('task-status', taskStatusRoute),


serve({
  fetch: app.fetch,
  port: 3000,
  hostname: '0.0.0.0'
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
