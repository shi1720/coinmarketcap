import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
// Builds actual source before publishing. Does not create projects, grant IAM,
// attach billing or overwrite another Hosting site.
if (!existsSync('.env.firebase')) throw new Error('Add public VITE_FIREBASE_* configuration to ignored .env.firebase first.');
for (const [command,args] of [
 ['npm',['run','typecheck']],
 ['npm',['test']],
 ['npm',['run','build:firebase']],
 ['npx',['--yes','firebase-tools@latest','deploy','--only','hosting,firestore:rules','--project','project-e602fb41-bce3-416f-901','--non-interactive']]
]) {
 const run=spawnSync(command,args,{stdio:'inherit',shell:false});
 if(run.status!==0)process.exit(run.status??1);
}
