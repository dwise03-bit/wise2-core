import Fastify from 'fastify';
import cors from '@fastify/cors';
import pg from 'pg';
import {jwtVerify} from 'jose';
import {z} from 'zod';
import {can,type Role} from './permissions.js';

const Env=z.object({PORT:z.coerce.number().default(3045),DATABASE_URL:z.string().min(1),JWT_SECRET:z.string().min(32),CORS_ORIGIN:z.string().min(1)}).parse(process.env);
const db=new pg.Pool({connectionString:Env.DATABASE_URL,max:10});
const app=Fastify({logger:true,trustProxy:true});
await app.register(cors,{origin:Env.CORS_ORIGIN.split(',').map(x=>x.trim()),credentials:true});

type Principal={id:string;email?:string};
declare module 'fastify'{interface FastifyRequest{principal?:Principal}}
app.addHook('preHandler',async(req,reply)=>{if(req.url==='/health'||req.method==='OPTIONS')return;const h=req.headers.authorization;const token=h?.startsWith('Bearer ')?h.slice(7):null;if(!token)return reply.code(401).send({error:'UNAUTHORIZED'});try{const {payload}=await jwtVerify(token,new TextEncoder().encode(Env.JWT_SECRET),{algorithms:['HS256']});const id=typeof payload.userId==='string'?payload.userId:typeof payload.id==='string'?payload.id:null;if(!id)throw new Error();req.principal={id,email:typeof payload.email==='string'?payload.email:undefined}}catch{return reply.code(401).send({error:'UNAUTHORIZED'})}});
app.get('/health',async(_req,reply)=>{try{await db.query('SELECT 1');return{service:'soundlabs-live',status:'healthy',database:'connected'}}catch{return reply.code(503).send({service:'soundlabs-live',status:'degraded',database:'unavailable'})}});

const Onboard=z.object({projectName:z.string().trim().min(1).max(120),roomTitle:z.string().trim().min(1).max(120),crowdMode:z.enum(['WATCH_ONLY','GUIDED','CHAOS']).default('GUIDED')});
app.post('/v1/onboarding',async(req,reply)=>{const p=Onboard.safeParse(req.body);if(!p.success)return reply.code(400).send({error:'INVALID_INPUT'});const c=await db.connect();try{await c.query('BEGIN');const project=await c.query(`INSERT INTO "SoundLabsProject"("id","userId","name","mixerState","projectSize","createdAt","updatedAt") VALUES(gen_random_uuid()::text,$1,$2,'{}'::jsonb,0,now(),now()) RETURNING "id","name"`,[req.principal!.id,p.data.projectName]);const room=await c.query(`INSERT INTO "SoundLabsLiveSession"("projectId","ownerId","title","crowdMode") VALUES($1,$2,$3,$4) RETURNING *`,[project.rows[0].id,req.principal!.id,p.data.roomTitle,p.data.crowdMode]);await c.query(`INSERT INTO "SoundLabsLiveParticipant"("sessionId","userId","role","presence") VALUES($1,$2,'OWNER','online')`,[room.rows[0].id,req.principal!.id]);await c.query('COMMIT');return reply.code(201).send({project:project.rows[0],session:room.rows[0]})}catch(e){await c.query('ROLLBACK');req.log.error(e);return reply.code(500).send({error:'ONBOARDING_FAILED'})}finally{c.release()}});

async function role(sessionId:string,userId:string):Promise<Role|null>{const r=await db.query(`SELECT "role" FROM "SoundLabsLiveParticipant" WHERE "sessionId"=$1 AND "userId"=$2`,[sessionId,userId]);return r.rows[0]?.role??null}
app.get('/v1/sessions/:id',async(req,reply)=>{const {id}=req.params as {id:string};if(!await role(id,req.principal!.id))return reply.code(403).send({error:'FORBIDDEN'});const [s,p,m]=await Promise.all([db.query(`SELECT * FROM "SoundLabsLiveSession" WHERE "id"=$1`,[id]),db.query(`SELECT p.*,u."name" FROM "SoundLabsLiveParticipant" p JOIN "User" u ON u."id"=p."userId" WHERE p."sessionId"=$1`,[id]),db.query(`SELECT m.*,u."name" FROM "SoundLabsLiveMessage" m JOIN "User" u ON u."id"=m."userId" WHERE m."sessionId"=$1 ORDER BY m."createdAt" DESC LIMIT 100`,[id])]);if(!s.rows[0])return reply.code(404).send({error:'NOT_FOUND'});return{session:s.rows[0],participants:p.rows,messages:m.rows.reverse()}});
const Msg=z.object({text:z.string().trim().min(1).max(2000)});
app.post('/v1/sessions/:id/messages',async(req,reply)=>{const {id}=req.params as {id:string};const r=await role(id,req.principal!.id);if(!r||!can(r,'chat'))return reply.code(403).send({error:'FORBIDDEN'});const p=Msg.safeParse(req.body);if(!p.success)return reply.code(400).send({error:'INVALID_INPUT'});const m=await db.query(`INSERT INTO "SoundLabsLiveMessage"("sessionId","userId","text") VALUES($1,$2,$3) RETURNING *`,[id,req.principal!.id,p.data.text]);return reply.code(201).send(m.rows[0])});

const stop=async()=>{await app.close();await db.end()};process.on('SIGTERM',stop);process.on('SIGINT',stop);
await app.listen({port:Env.PORT,host:'0.0.0.0'});
