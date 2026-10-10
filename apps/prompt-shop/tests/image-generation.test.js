import test from "node:test";
import assert from "node:assert/strict";
import { LocalImageAdapter, dimensionsForAspectRatio } from "../server/image/LocalImageAdapter.js";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

test("local image adapter is free-by-policy and requires a private service URL", () => {
  assert.equal(new LocalImageAdapter().isConfigured(), false);
  assert.equal(new LocalImageAdapter({ baseUrl: "http://127.0.0.1:7860" }).isConfigured(), true);
});

test("local image dimensions stay conservative for a 4GB generation GPU", () => {
  assert.deepEqual(dimensionsForAspectRatio("1:1"), { width: 512, height: 512 });
  assert.deepEqual(dimensionsForAspectRatio("16:9"), { width: 640, height: 384 });
  assert.deepEqual(dimensionsForAspectRatio("9:16"), { width: 384, height: 640 });
});

test("uploaded photos use the local img2img endpoint and save the result", async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), "wise-touch-image-"));
  const generatedPng = await (await import("sharp")).default({ create:{ width:512,height:512,channels:4,background:"#111111" } }).png().toBuffer();
  const calls = [];
  const adapter = new LocalImageAdapter({ baseUrl:"http://127.0.0.1:7860", outputDir, fetchImpl:async(url,options)=>{ calls.push({url,options}); return new Response(JSON.stringify({images:[generatedPng.toString("base64")]}),{status:200,headers:{"Content-Type":"application/json"}}); } });
  const result = await adapter.generateFromImage({ imageBuffer:Buffer.from("source-photo"), prompt:"WISE TOUCH treatment", aspectRatio:"1:1", strength:0.6 });
  assert.equal(calls[0].url,"http://127.0.0.1:7860/sdapi/v1/img2img");
  const body = JSON.parse(calls[0].options.body);
  assert.deepEqual(body.init_images,[Buffer.from("source-photo").toString("base64")]);
  assert.equal(body.denoising_strength,0.6);
  assert.deepEqual(await readFile(path.join(outputDir,"clean",`${result.id}.png`)),generatedPng);
});

test("free image delivery is watermarked and never exposes the clean route", async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), "wise-touch-watermark-"));
  const sourcePng = await (await import("sharp")).default({ create:{ width:512,height:512,channels:4,background:"#222222" } }).png().toBuffer();
  const adapter = new LocalImageAdapter({ baseUrl:"http://127.0.0.1:7860", outputDir, fetchImpl:async()=>new Response(JSON.stringify({images:[sourcePng.toString("base64")]}),{status:200,headers:{"Content-Type":"application/json"}}) });
  const free = await adapter.generate({ prompt:"free build", access:{ ownerId:null, paid:false } });
  assert.equal(free.watermarked,true); assert.equal(free.assetUrl,`/generated/${free.id}.png`);
  assert.notDeepEqual(await readFile(path.join(outputDir,`${free.id}.png`)),await readFile(path.join(outputDir,"clean",`${free.id}.png`)));
  assert.equal(await adapter.getCleanImage(free.id,"some-user"),null);
});

test("paid image delivery uses an owner-bound authenticated clean route", async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), "wise-touch-clean-"));
  const sourcePng = await (await import("sharp")).default({ create:{ width:512,height:512,channels:4,background:"#333333" } }).png().toBuffer();
  const adapter = new LocalImageAdapter({ baseUrl:"http://127.0.0.1:7860", outputDir, fetchImpl:async()=>new Response(JSON.stringify({images:[sourcePng.toString("base64")]}),{status:200,headers:{"Content-Type":"application/json"}}) });
  const paid = await adapter.generate({ prompt:"paid build", access:{ ownerId:"owner-1", paid:true } });
  assert.equal(paid.watermarked,false); assert.equal(paid.assetUrl,`/api/image/generations/${paid.id}/clean`);
  assert.equal(await adapter.getCleanImage(paid.id,"wrong-owner"),null);
  assert.ok(await adapter.getCleanImage(paid.id,"owner-1"));
});
