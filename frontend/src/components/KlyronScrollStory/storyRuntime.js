/**
 * Klyron Consulting - scroll-driven BIM story (Three.js)
 * Plain ASCII on purpose: special characters are written as \u escapes so the file reads the same in any encoding.
 * Usage:  const story = mountKlyronScrollStory(containerEl, {modelUrl:'/models/klyron-model.glb'});  ...  story.destroy();
 * The model is one GLB whose meshes are named "discipline|level|category" (built by the model pipeline).
 * The container becomes a tall section (1120vh) with a sticky 3D stage inside.
 * Do NOT put it inside an ancestor with overflow:hidden/auto (that breaks position:sticky).
 */
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {buildCity, SUN_DIR} from './city.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const CSS = `.kss{
  --ink:#04070B; --navy:#0B2A44; --cyan:#39C3FF; --cyan-2:#7DE0FF; --paper:#E8EDF2; --mute:#93A0AC;
  --orange:#FF7A1A; --red:#FF5A5A; --green:#3FD68B;
  --panel:rgba(8,16,24,.82); --line:rgba(57,195,255,.2);
  --f-display:"Space Grotesk","Inter",system-ui,sans-serif;
  --f-label:"Space Grotesk","Inter",system-ui,sans-serif;
  --f-body:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;
  color-scheme:dark;
}
.kss{position:relative;height:1120vh;background:var(--ink);color:var(--paper);font-family:var(--f-body);-webkit-font-smoothing:antialiased}
.kss-sticky{position:sticky;top:88px;height:calc(100vh - 88px);height:calc(100svh - 88px);overflow:hidden}
.kss #stage{position:absolute;inset:0;width:100%;height:100%;display:block;
  background:radial-gradient(120% 90% at 60% 35%,#0d2438 0%,#06101a 45%,var(--ink) 80%)}
.kss .model-load{position:absolute;right:clamp(16px,3vw,42px);top:clamp(18px,4vh,42px);z-index:3;width:min(260px,calc(100% - 32px));padding:11px 13px;border:1px solid rgba(125,224,255,.22);border-radius:7px;background:rgba(4,12,19,.78);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);transition:opacity .35s,visibility .35s}
.kss .model-load[hidden]{display:block;opacity:0;visibility:hidden}
.kss .model-load__row{display:flex;justify-content:space-between;gap:12px;margin-bottom:8px;font:500 9px/1.3 var(--f-label);letter-spacing:.13em;text-transform:uppercase;color:rgba(232,237,242,.68)}
.kss .model-load__row b{color:var(--cyan-2);font-weight:600;font-variant-numeric:tabular-nums}
.kss .model-load__track{height:2px;background:rgba(125,224,255,.14);overflow:hidden}
.kss .model-load__bar{display:block;width:0;height:100%;background:var(--cyan);transition:width .2s linear}
.kss .ui{position:absolute;inset:0;pointer-events:none;z-index:2}
.kss .ui a,.kss .ui button{pointer-events:auto}
.kss .btn{font:500 12px/1 var(--f-label);letter-spacing:.12em;text-transform:uppercase;text-decoration:none;
  padding:14px 20px;border-radius:999px;transition:background .25s,color .25s,border-color .25s;white-space:nowrap}
.kss .btn-solid{background:var(--cyan);color:var(--ink)}
.kss .btn-solid:hover,.kss .btn-solid:focus-visible{background:var(--paper)}
.kss .btn-ghost{border:1px solid rgba(125,224,255,.45);color:var(--paper)}
.kss .btn-ghost:hover,.kss .btn-ghost:focus-visible{background:rgba(57,195,255,.12)}
.kss .btn:focus-visible{outline:2px solid var(--cyan-2);outline-offset:3px}
.kss .btn:disabled{cursor:wait;opacity:.48}
.kss .ch{position:absolute;left:clamp(16px,5vw,80px);bottom:clamp(82px,12vh,132px);max-width:min(520px,calc(100vw - 32px));opacity:0;will-change:opacity,transform}
.kss .eyebrow{font:500 11px/1 var(--f-label);letter-spacing:.32em;text-transform:uppercase;color:var(--cyan);margin:0 0 18px;display:flex;align-items:center;gap:12px}
.kss .eyebrow:before{content:"";width:28px;height:1px;background:var(--cyan)}
.kss .ch h1,.kss .ch h2{font:500 clamp(42px,4.4vw,70px)/1.02 var(--f-display);letter-spacing:-.045em;margin:0;text-wrap:balance}
.kss .ch h2{font-size:clamp(38px,3.6vw,58px)}
.kss .ch h1 em,.kss .ch h2 em{color:rgba(232,237,242,.72);font-style:normal}
.kss .ch p{font:400 16px/1.6 var(--f-body);color:rgba(232,237,242,.66);margin:22px 0 0;max-width:46ch}
.kss .ch .row{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
.kss .ch .facts{display:flex;flex-wrap:wrap;gap:8px 22px;margin-top:28px;font:500 11px/1.4 var(--f-label);letter-spacing:.14em;text-transform:uppercase;color:rgba(247,249,251,.55)}
.kss .ch .facts b{color:var(--paper);font-weight:500}
.kss .hint{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 26px);transform:translateX(-50%);font:500 10px/1 var(--f-label);letter-spacing:.3em;text-transform:uppercase;color:rgba(247,249,251,.55);display:flex;flex-direction:column;align-items:center;gap:12px}
.kss .hint i{width:1px;height:38px;background:linear-gradient(var(--cyan),transparent);animation:drip 2s ease-in-out infinite}
@keyframes drip{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
.kss .panel{position:absolute;right:clamp(24px,3vw,56px);top:50%;width:min(420px,calc(100vw - 32px));background:var(--panel);
  border:1px solid var(--line);border-radius:10px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);opacity:0;
  font:400 12.5px/1.45 var(--f-body);color:rgba(247,249,251,.85);overflow:hidden;will-change:opacity,transform}
.kss .ph{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--line);
  font:500 10.5px/1 var(--f-label);letter-spacing:.18em;text-transform:uppercase;color:var(--mute)}
.kss .ph b{color:var(--paper);font-weight:500}
.kss .pb{padding:8px 16px 14px}
.kss .tbl{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;table-layout:fixed}
.kss .tbl th{font:500 9.5px/1 var(--f-label);letter-spacing:.14em;text-transform:uppercase;color:var(--mute);text-align:left;padding:10px 0 8px;font-weight:500}
.kss .tbl td{padding:9px 0;border-top:1px solid rgba(179,191,204,.1);vertical-align:top}
.kss .tbl td small{display:block;color:var(--mute);font-size:11px}
.kss .tbl td:first-child,.kss .tbl th:first-child{padding-right:12px;color:var(--mute)}
.kss .tbl td+td:not(:last-child){padding-right:10px}
.kss .pill{display:inline-block;font:600 9.5px/1 var(--f-label);letter-spacing:.1em;text-transform:uppercase;padding:5px 8px;border-radius:4px;white-space:nowrap}
.kss .p-red{background:rgba(255,90,90,.15);color:#FF8A8A}
.kss .p-green{background:rgba(63,214,139,.15);color:var(--green)}
.kss .p-orange{background:rgba(255,122,26,.15);color:#FFA35C}
.kss .p-blue{background:rgba(57,195,255,.15);color:var(--cyan-2)}
.kss .p-mute{background:rgba(179,191,204,.12);color:var(--mute)}
.kss .steps{display:grid;gap:2px;margin-top:6px}
.kss .step{display:grid;grid-template-columns:22px 1fr auto;align-items:center;gap:10px;padding:9px 0;color:rgba(247,249,251,.45);transition:color .3s}
.kss .step i{width:10px;height:10px;border-radius:50%;border:1px solid rgba(179,191,204,.4);justify-self:center;transition:all .3s}
.kss .step.done{color:rgba(247,249,251,.8)}
.kss .step.done i{background:var(--green);border-color:var(--green)}
.kss .step.now{color:var(--paper)}
.kss .step.now i{background:var(--cyan);border-color:var(--cyan);box-shadow:0 0 0 5px rgba(57,195,255,.18)}
.kss .step span:last-child{font:500 10px/1 var(--f-label);letter-spacing:.1em;color:var(--mute);text-transform:uppercase}
.kss .kv{display:grid;grid-template-columns:auto 1fr;gap:7px 16px;font-variant-numeric:tabular-nums}
.kss .kv dt{color:var(--mute);font:500 10px/1.6 var(--f-label);letter-spacing:.1em;text-transform:uppercase}
.kss .kv dd{margin:0;text-align:right}
.kss .bar{height:4px;border-radius:2px;background:rgba(179,191,204,.14);overflow:hidden;margin-top:6px}
.kss .bar div{height:100%;background:var(--cyan)}
.kss .gantt{position:relative;margin-top:4px}
.kss .g-row{display:grid;grid-template-columns:128px 1fr;align-items:center;gap:10px;height:22px;font-size:11.5px;color:rgba(247,249,251,.75)}
.kss .g-track{position:relative;height:8px}
.kss .g-track div{position:absolute;top:0;height:100%;border-radius:2px;background:rgba(57,195,255,.28)}
.kss .g-track div b{position:absolute;inset:0;width:0;background:var(--cyan);border-radius:2px}
.kss .g-head{position:absolute;top:-4px;bottom:-4px;width:1px;background:var(--orange)}
.kss .g-head:after{content:attr(data-w);position:absolute;top:-16px;left:50%;transform:translateX(-50%);font:600 9.5px/1 var(--f-label);color:var(--orange);white-space:nowrap}
.kss .qty{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:12px}
.kss .qty div{border:1px solid rgba(179,191,204,.12);border-radius:6px;padding:10px 12px}
.kss .qty small{display:block;font:500 9.5px/1.3 var(--f-label);letter-spacing:.12em;text-transform:uppercase;color:var(--mute)}
.kss .qty b{display:block;font:500 19px/1.2 var(--f-label);color:var(--paper);margin-top:4px;font-variant-numeric:tabular-nums}
.kss .cde{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}
.kss .cde div{border:1px solid rgba(179,191,204,.14);border-radius:6px;padding:10px 6px;text-align:center;font:500 9.5px/1.3 var(--f-label);letter-spacing:.08em;text-transform:uppercase;color:var(--mute);transition:all .3s}
.kss .cde div.on{border-color:var(--cyan);color:var(--paper);background:rgba(57,195,255,.1)}
.kss .file{margin-top:10px;font:500 11px/1 var(--f-label);letter-spacing:.06em;color:var(--cyan-2);display:flex;justify-content:space-between}
.kss .panel.top{top:24px;width:min(420px,calc(100vw - 32px))}
.kss [data-panel="2"] .tbl th:nth-child(1),.kss [data-panel="2"] .tbl td:nth-child(1){width:8%}
.kss [data-panel="2"] .tbl th:nth-child(2),.kss [data-panel="2"] .tbl td:nth-child(2){width:52%;padding-right:12px}
.kss [data-panel="2"] .tbl th:nth-child(3),.kss [data-panel="2"] .tbl td:nth-child(3){width:18%}
.kss [data-panel="2"] .tbl th:nth-child(4),.kss [data-panel="2"] .tbl td:nth-child(4){width:22%}
.kss [data-panel="4"]{width:min(400px,calc(100vw - 32px))}
.kss [data-panel="4"] .tbl th:first-child,.kss [data-panel="4"] .tbl td:first-child{width:70%;padding-right:18px}
.kss [data-panel="4"] .tbl th:last-child,.kss [data-panel="4"] .tbl td:last-child{width:30%;white-space:nowrap}
.kss [data-panel="4"] .tbl td{padding-top:7px;padding-bottom:7px}
.kss [data-panel="4"] .tbl td small{margin-top:2px;line-height:1.35}
.kss [data-panel="6"] .tbl td:first-child{width:42%}
.kss [data-panel="6"] .tbl td:last-child{width:58%}
.kss .next-section{display:inline-flex;align-items:center;gap:12px;margin-top:24px;color:var(--cyan-2);font:600 11px/1 var(--f-label);letter-spacing:.18em;text-transform:uppercase;text-decoration:none;pointer-events:auto}
.kss .next-section i{width:34px;height:34px;border:1px solid rgba(125,224,255,.55);border-radius:50%;position:relative}
.kss .next-section i:before{content:"";position:absolute;left:50%;top:8px;width:8px;height:8px;border-right:1.5px solid var(--cyan-2);border-bottom:1.5px solid var(--cyan-2);transform:translateX(-50%) rotate(45deg)}
.kss .next-section i:after{content:"";position:absolute;left:50%;top:8px;width:1px;height:15px;background:var(--cyan-2);transform:translateX(-50%)}
.kss .note{margin-top:10px;font-size:10.5px;color:var(--mute)}
.kss #tags{position:absolute;inset:0}
.kss .pin{position:absolute;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;display:grid;place-items:center;
  font:600 11px/1 var(--f-label);color:#fff;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35),0 4px 14px rgba(0,0,0,.45)}
.kss .pin.red,.kss .pin.green{-webkit-text-fill-color:#fff}
.kss .pin:before{content:"";position:absolute;inset:-8px;border-radius:50%;border:1px solid currentColor;opacity:.45;animation:ping 1.6s ease-out infinite}
@keyframes ping{from{transform:scale(.6);opacity:.7}to{transform:scale(1.5);opacity:0}}
.kss .pin.red{color:var(--red);background:#c93434}
.kss .pin.green{color:var(--green);background:#1f9a5f}
.kss .pin.green:before{animation:none;opacity:0}
.kss .label{position:absolute;transform:translate(-50%,-100%);text-align:center;white-space:nowrap}
.kss .label b{display:block;font:500 11px/1 var(--f-label);letter-spacing:.24em;text-transform:uppercase;color:var(--paper)}
.kss .label b,.kss .label small{text-shadow:0 1px 3px rgba(4,7,11,.72)}
.kss.kss-day .ch h1,.kss.kss-day .ch h2,.kss.kss-day .ch p,.kss.kss-day .eyebrow{text-shadow:0 1px 8px rgba(4,7,11,.38)}
.kss .label small{display:block;margin-top:6px;font:500 10.5px/1 var(--f-label);letter-spacing:.06em;color:var(--cyan-2)}
.kss .label:after{content:"";display:block;width:1px;height:26px;margin:8px auto 0;background:linear-gradient(var(--cyan),transparent)}
.kss .vig{position:absolute;inset:0;pointer-events:none;z-index:1;background:
  linear-gradient(90deg,rgba(4,7,11,.78) 0%,rgba(4,7,11,.25) 36%,rgba(4,7,11,0) 55%),
  linear-gradient(0deg,rgba(4,7,11,.55) 0%,rgba(4,7,11,0) 30%)}
@media (max-width:820px){.kss-sticky{top:64px;height:calc(100vh - 64px);height:calc(100svh - 64px)}
.kss .model-load{top:12px;right:12px;width:min(220px,calc(100% - 24px));padding:9px 11px}
.kss .vig{background:linear-gradient(0deg,rgba(4,7,11,.92) 0%,rgba(4,7,11,.4) 42%,rgba(4,7,11,0) 60%),linear-gradient(180deg,rgba(4,7,11,.6) 0%,rgba(4,7,11,0) 22%)}
.kss .ch{bottom:calc(env(safe-area-inset-bottom,0px) + 70px)}
.kss .ch h1{font-size:clamp(40px,11vw,56px)}
.kss .ch h2{font-size:clamp(34px,9.5vw,48px)}
.kss .ch p{font-size:14.5px;margin-top:14px}
.kss .ch .facts{display:none}
.kss .panel{right:16px;left:16px;width:auto;top:calc(env(safe-area-inset-top,0px) + 16px);font-size:11.5px}
.kss .panel .hide-m{display:none}
.kss .g-row{grid-template-columns:104px 1fr;height:19px;font-size:10.5px}
.kss .qty b{font-size:16px}
.kss .hint{display:none}}

.kss .tag{display:inline-block;font:600 9px/1 var(--f-label);letter-spacing:.12em;text-transform:uppercase;padding:4px 6px;border-radius:4px;background:rgba(179,191,204,.14);color:var(--mute);margin-left:8px;vertical-align:1px}
.kss .legend{display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:12px;font:500 10px/1.2 var(--f-label);letter-spacing:.06em;color:rgba(247,249,251,.8)}
.kss .legend i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px;vertical-align:-1px}
.kss .xbtn{position:absolute;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 22px);z-index:4;background:rgba(8,16,24,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transition:opacity .3s,background .25s}
.kss .xbar{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 22px);z-index:4;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;pointer-events:auto;max-width:calc(100vw - 32px)}
.kss .xbar[hidden]{display:none}
@media (min-width:821px){.kss .ch[data-ch="2"],.kss .ch[data-ch="3"],.kss .ch[data-ch="4"],.kss .ch[data-ch="5"],.kss .ch[data-ch="6"]{max-width:min(520px,calc(100vw - clamp(24px,3vw,56px) - 420px - clamp(16px,5vw,80px) - 44px))}}
.kss .xbar .btn{background:rgba(8,16,24,.6);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.kss .xbar .btn-solid{background:var(--cyan)}
.kss .xhint{width:100%;text-align:center;font:500 10.5px/1.4 var(--f-label);letter-spacing:.14em;text-transform:uppercase;color:rgba(247,249,251,.85);text-shadow:0 1px 8px rgba(4,7,11,.8)}
.kss.kss-explore .ch,.kss.kss-explore .panel,.kss.kss-explore #tags,.kss.kss-explore .hint,.kss.kss-explore .xbtn{opacity:0!important;visibility:hidden!important}
.kss.kss-explore .vig{opacity:.2}
.kss.kss-explore #stage{cursor:grab}
.kss.kss-explore #stage:active{cursor:grabbing}
.kss .vig{transition:opacity .4s}
@media (max-width:820px){.kss .xbtn{padding:10px 14px;font-size:10.5px}.kss .xhint{font-size:9.5px}}
@media (max-width:820px){
  .kss .panel{top:calc(env(safe-area-inset-top,0px) + 72px);font-size:11px}
  .kss .ph{padding:9px 12px;font-size:9.5px}
  .kss .pb{padding:4px 12px 9px}
  .kss .tbl td{padding:5px 0}
  .kss .tbl th{padding:6px 0 4px}
  .kss .tbl td small,.kss .panel .note,.kss .kv dt:nth-of-type(n+2),.kss .kv dd:nth-of-type(n+2){display:none}
  .kss .steps{grid-template-columns:1fr 1fr;gap:0 10px}
  .kss .step{grid-template-columns:16px 1fr;padding:4px 0}
  .kss .step span:last-child{display:none}
  .kss .legend{gap:4px 9px;margin-top:6px;font-size:9px}
  .kss .g-row{height:14px;font-size:9.5px}
  .kss .qty{grid-template-columns:repeat(4,1fr);gap:5px;margin-top:6px}
  .kss .qty div{padding:6px 7px}
  .kss .qty small{font-size:8px}
  .kss .qty b{font-size:12.5px}
  .kss .cde{margin-top:6px}
  .kss .cde div{padding:6px 4px;font-size:8.5px}
  .kss .file{margin-top:6px;font-size:10px}
  .kss .ch h2{font-size:clamp(30px,8.2vw,40px)}
  .kss .ch p{font-size:13.5px;line-height:1.5;margin-top:10px}
  .kss .eyebrow{margin-bottom:12px}
}

.kss .mobile-reading{display:contents}
@media(max-width:820px){
 .kss .mobile-reading{display:block;position:absolute;top:48%;bottom:calc(70px + env(safe-area-inset-bottom,0px));left:12px;right:12px;overflow:auto;pointer-events:auto;touch-action:pan-y;padding:14px;box-sizing:border-box;border-radius:12px;background:rgba(6,14,22,.94);scrollbar-width:thin}
 .kss .mobile-reading .ch,.kss .mobile-reading .panel{display:none!important;position:static!important;width:100%!important;max-width:none!important;transform:none!important;margin:0;box-sizing:border-box;opacity:1!important;visibility:visible!important;overflow:visible;overflow-wrap:anywhere}
 .kss .mobile-reading [data-mobile-active="true"]{display:block!important}
 .kss .mobile-reading .panel{margin-top:18px;font-size:12px}
 .kss .mobile-reading .ch h1,.kss .mobile-reading .ch h2{font-size:clamp(28px,7.6vw,38px);line-height:1.05}
 .kss .mobile-reading .ch p{font-size:14px;line-height:1.5}
 .kss .mobile-reading .eyebrow{font-size:10px;line-height:1.5;letter-spacing:.15em}
 .kss .mobile-reading .row{gap:10px;margin-top:18px}
 .kss .mobile-reading .btn{white-space:normal;line-height:1.4;min-height:44px;box-sizing:border-box;padding:12px 14px}
 .kss .mobile-reading .tbl{table-layout:fixed}
 .kss .mobile-reading .tbl th:first-child,.kss .mobile-reading .tbl td:first-child{width:38%;padding-right:8px}
 .kss .mobile-reading [data-panel="2"] .tbl th:first-child,.kss .mobile-reading [data-panel="2"] .tbl td:first-child{width:12%;padding-right:4px}
 .kss .mobile-reading [data-panel="2"] .tbl th:nth-child(2),.kss .mobile-reading [data-panel="2"] .tbl td:nth-child(2){width:58%;padding-right:8px}
 .kss .mobile-reading [data-panel="2"] .tbl th:nth-child(3),.kss .mobile-reading [data-panel="2"] .tbl td:nth-child(3){display:none}
 .kss .mobile-reading [data-panel="2"] .tbl th:nth-child(4),.kss .mobile-reading [data-panel="2"] .tbl td:nth-child(4){width:30%}
 .kss .mobile-reading [data-panel="4"] .tbl th:first-child,.kss .mobile-reading [data-panel="4"] .tbl td:first-child{width:64%;padding-right:8px}
 .kss .mobile-reading [data-panel="4"] .tbl th:last-child,.kss .mobile-reading [data-panel="4"] .tbl td:last-child{width:36%}
 .kss .mobile-reading .pill{font-size:8px;letter-spacing:0;padding:5px 4px;white-space:normal}
 .kss .mobile-reading .ph{flex-wrap:wrap;gap:8px;line-height:1.5}
 .kss .mobile-reading .file{flex-wrap:wrap;gap:8px;line-height:1.5}
 .kss .mobile-reading .tbl td small,.kss .mobile-reading .note{display:block;font-size:11px}
 .kss .mobile-reading .kv dt:nth-of-type(n),.kss .mobile-reading .kv dd:nth-of-type(n){display:block;min-width:0}
 .kss .mobile-reading .cde{grid-template-columns:repeat(2,minmax(0,1fr))}
 .kss #tags{clip-path:inset(0 0 52% 0)}
 .kss .label{max-width:130px;white-space:normal}
 .kss .label b{font-size:10px;letter-spacing:.08em}
 .kss .xbtn{right:max(16px,env(safe-area-inset-right,0px));min-height:44px;bottom:calc(12px + env(safe-area-inset-bottom,0px))}
 .kss .xbar{width:calc(100% - 24px);gap:8px;bottom:calc(12px + env(safe-area-inset-bottom,0px))}
 .kss .xbar .btn{min-height:44px;padding:12px;font-size:10px}
 .kss.kss-explore .mobile-reading{display:none;pointer-events:none}
}

/* Phone composition: direct-on-model editorial copy and compact bottom reports.
   Technical chapters reserve the middle of the viewport for the 3D annotations. */
@media(max-width:700px){
 .kss-sticky{top:0;height:100vh;height:100svh}
 .kss .model-load{display:none!important}
 .kss .vig{background:linear-gradient(0deg,rgba(4,7,11,.62) 0%,rgba(4,7,11,.12) 30%,transparent 48%),linear-gradient(180deg,rgba(4,7,11,.32) 0%,transparent 15%)}
 .kss .mobile-reading{display:contents;pointer-events:none}
 .kss .mobile-reading .ch[data-mobile-active="true"]{display:block!important;position:absolute!important;left:18px!important;right:18px!important;bottom:calc(72px + env(safe-area-inset-bottom,0px))!important;width:auto!important;max-width:330px!important;padding:0;border:0;background:none;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none;overflow:visible;pointer-events:none;text-shadow:0 2px 12px rgba(0,0,0,.92),0 1px 3px rgba(0,0,0,.9)}
 .kss .mobile-reading:has(.panel[data-mobile-active="true"]) .ch[data-mobile-active="true"]{top:calc(76px + env(safe-area-inset-top,0px))!important;bottom:auto!important;max-width:285px!important}
 .kss .mobile-reading .panel[data-mobile-active="true"]{display:block!important;position:absolute!important;left:14px!important;right:14px!important;top:auto!important;bottom:calc(70px + env(safe-area-inset-bottom,0px))!important;width:auto!important;max-height:none;border:1px solid rgba(232,237,242,.14);border-radius:10px;background:rgba(5,10,14,.91);box-shadow:0 16px 40px rgba(0,0,0,.3);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);overflow:visible;pointer-events:none;transform:none!important}
 .kss .mobile-reading .ch h1,.kss .mobile-reading .ch h2{font-size:clamp(25px,7vw,32px);line-height:1.02;letter-spacing:-.04em}
 .kss .mobile-reading:has(.panel[data-mobile-active="true"]) .ch h2{font-size:clamp(22px,6vw,28px)}
 .kss .mobile-reading .ch p{font-size:12px;line-height:1.42;margin-top:8px;color:rgba(247,249,251,.82)}
 .kss .mobile-reading .eyebrow{margin-bottom:7px;font-size:8px;letter-spacing:.16em}
 .kss .mobile-reading .eyebrow:before{width:24px}
 .kss .mobile-reading .row{margin-top:11px;pointer-events:auto}
 .kss .mobile-reading .ph{padding:7px 10px;font-size:8px;letter-spacing:.11em;flex-wrap:nowrap}
 .kss .mobile-reading .pb{padding:3px 10px 7px}
 .kss .mobile-reading .tbl{font-size:9px;line-height:1.2}
 .kss .mobile-reading .tbl th{padding:4px 0 3px;font-size:7.5px;letter-spacing:.08em}
 .kss .mobile-reading .tbl td{padding:3px 0}
 .kss .mobile-reading .tbl td small{display:block;margin-top:1px;font-size:7px;line-height:1.15}
 .kss .mobile-reading .panel .hide-m{display:table-row}
 .kss .mobile-reading .pill{font-size:7px;padding:3px 4px}
 .kss .mobile-reading .note{display:block;margin-top:4px;font-size:7.5px;line-height:1.25}
 .kss .mobile-reading .kv{gap:3px 10px;font-size:9px}
 .kss .mobile-reading .kv dt{font-size:7.5px;line-height:1.35}
 .kss .mobile-reading .steps{margin-top:2px}
 .kss .mobile-reading .step{grid-template-columns:12px 1fr auto;padding:2px 0;font-size:8px}
 .kss .mobile-reading .step span:last-child{display:block;font-size:6.5px;letter-spacing:.04em}
 .kss .mobile-reading .g-row{height:12px;font-size:8px}
 .kss .mobile-reading .qty{gap:5px;margin-top:5px}
 .kss .mobile-reading .qty div{padding:5px 7px}
 .kss .mobile-reading .qty small{font-size:7px}
 .kss .mobile-reading .qty b{font-size:12px}
 .kss .mobile-reading .cde{gap:3px;margin-top:4px}
 .kss .mobile-reading .cde div{padding:4px 3px;font-size:7px}
 .kss .mobile-reading .file{margin-top:4px;font-size:8px}
 .kss .xbtn{bottom:calc(12px + env(safe-area-inset-bottom,0px));right:14px;min-height:42px;padding:0 15px;background:rgba(5,13,21,.8)}
 .kss #tags{clip-path:none}
 .kss .label b{font-size:9px;letter-spacing:.06em}
 .kss .label small{font-size:9px;margin-top:3px}
 .kss .label:after{height:15px;margin-top:5px}
}

@media (prefers-reduced-motion:reduce){.kss .hint i,.kss .pin:before{animation:none}}
`;

const MARKUP = `<div class="kss-sticky">
<canvas id="stage" aria-label="3D building model that changes as you scroll"></canvas>
<div class="vig"></div>
<div class="model-load" id="modelLoad" role="status" aria-live="polite"><div class="model-load__row"><span id="modelLoadLabel">Preparing coordinated model</span><b id="modelLoadValue">0%</b></div><div class="model-load__track"><i class="model-load__bar" id="modelLoadBar"></i></div></div>

<div class="ui">
  <div id="tags"></div>

  <!-- 0 hero -->
  <section class="ch" data-ch="0" style="opacity:1">
    <p class="eyebrow">BIM Coordination &amp; Digital Delivery</p>
    <h1>Resolve coordination <em>before it becomes</em> a construction problem.</h1>
    <div class="row">
      <a class="btn btn-solid" href="#schedule">Book a 15-Minute Consultation</a>
    </div>
    <div class="facts"><span><b>Architecture \u00b7 Structure \u00b7 MEP</b></span><span>Projects in Australia &amp; Mozambique</span><span>Response within 24 h</span></div>
  </section>
  <div class="hint" id="hint">Scroll to explore<i></i></div>
  <button class="btn btn-ghost xbtn" id="xopen" type="button" disabled>Explore in 3D</button>
  <div class="xbar" id="xbar" hidden><span class="xhint">Drag to orbit \u00b7 scroll or pinch to zoom \u00b7 right-drag or two fingers to pan</span><button class="btn btn-ghost" id="xreset" type="button">Reset view</button><button class="btn btn-solid" id="xclose" type="button">Back to story</button></div>

  <!-- 1 federation -->
  <section class="ch" data-ch="1">
    <p class="eyebrow">Model Federation</p>
    <h2>Different disciplines. <em>One coordinated environment.</em></h2>
    <p>Architectural, structural and MEP models are combined into one federated environment, so alignment and multidisciplinary conflicts are reviewed before construction.</p>
  </section>

  <!-- 2 clash -->
  <section class="ch" data-ch="2">
    <p class="eyebrow">Clash Detection &amp; Issue Review</p>
    <h2>Not every clash deserves <em>the same attention.</em></h2>
    <p>Hard clashes and clearance issues are reviewed in context, prioritised, and separated from low-value results.</p>
  </section>
  <div class="panel top" data-panel="2">
    <div class="ph"><span>Clash test \u00b7 <b>MECH vs ELE</b></span><span>Level 02<span class="tag">Sample</span></span></div>
    <div class="pb">
      <table class="tbl">
        <thead><tr><th>#</th><th>Elements</th><th>Type</th><th style="text-align:right">Status</th></tr></thead>
        <tbody>
          <tr><td>01</td><td>Cable tray 300 \u2194 Duct<small>Tray runs through the duct</small></td><td><span class="pill p-red">Hard</span></td><td style="text-align:right"><span class="pill" id="s1"></span></td></tr>
          <tr><td>02</td><td>Cable tray 300 \u2194 Duct fitting<small>Tray runs through the fitting</small></td><td><span class="pill p-red">Hard</span></td><td style="text-align:right"><span class="pill" id="s2"></span></td></tr>
          <tr><td>03</td><td>Cable tray 300 \u2194 Duct<small>47 mm clearance \u00b7 100 mm required</small></td><td><span class="pill p-orange">Clear.</span></td><td style="text-align:right"><span class="pill" id="s3"></span></td></tr>
          <tr class="hide-m"><td>04</td><td>Light fitting \u2194 Ceiling grid<small>Filtered as low value</small></td><td><span class="pill p-mute">Soft</span></td><td style="text-align:right"><span class="pill p-mute">Ignored</span></td></tr>
        </tbody>
      </table>
      <p class="note" id="clashnote">Illustrative coordination sequence from the original demo: trays lower to show 100 mm clearance. This is not a clash report or an approved change to the updated models.</p>
    </div>
  </div>

  <!-- 3 workflow -->
  <section class="ch" data-ch="3">
    <p class="eyebrow">Controlled Workflow</p>
    <h2>Finding the clash is the beginning. <em>Closing it is what matters.</em></h2>
    <p>Every relevant issue is reviewed, prioritised, assigned, monitored and verified before closure.</p>
  </section>
  <div class="panel top" data-panel="3">
    <div class="ph"><span>Issue <b>KLY-ISS-014</b></span><span>ACC \u00b7 BCF<span class="tag">Sample</span></span></div>
    <div class="pb">
      <dl class="kv" style="margin:8px 0 6px">
        <dt>Title</dt><dd>Cable tray through duct, Level 02</dd>
        <dt>Priority</dt><dd><span class="pill p-red">High</span></dd>
        <dt>Assigned to</dt><dd>Electrical trade</dd>
        <dt>Due</dt><dd>Next coordination meeting</dd>
      </dl>
      <div class="steps" id="steps">
        <div class="step"><i></i><span>Reviewed</span><span>Model context</span></div>
        <div class="step"><i></i><span>Prioritised</span><span>Risk to install</span></div>
        <div class="step"><i></i><span>Assigned</span><span>Owner set</span></div>
        <div class="step"><i></i><span>Monitored</span><span>Model update</span></div>
        <div class="step"><i></i><span>Verified</span><span>Re-run test</span></div>
        <div class="step"><i></i><span>Closed</span><span>Logged</span></div>
      </div>
    </div>
  </div>

  <!-- 4 QA/QC -->
  <section class="ch" data-ch="4">
    <p class="eyebrow">BIM QA/QC &amp; Model Validation</p>
    <h2>A model that looks right. <em>Data that has to be right.</em></h2>
    <p>Naming, classification and property sets are checked against the project rules, and every finding goes back to the design team through BCF.</p>
  </section>
  <div class="panel" data-panel="4" style="transform:translateY(-50%)">
    <div class="ph"><span>Ruleset \u00b7 <b>Project EIR</b></span><span id="qacount">0 checks</span></div>
    <div class="pb">
      <table class="tbl">
        <thead><tr><th>Rule</th><th style="text-align:right">Result</th></tr></thead>
        <tbody id="qarows">
          <tr><td>Naming convention<small>Element &amp; type names</small></td><td style="text-align:right"><span class="pill p-mute">Queued</span></td></tr>
          <tr><td>Classification review<small>Every element classified</small></td><td style="text-align:right"><span class="pill p-mute">Queued</span></td></tr>
          <tr><td>Property validation<small>Required property sets</small></td><td style="text-align:right"><span class="pill p-mute">Queued</span></td></tr>
          <tr><td>Model compliance<small>Levels, grids, origin</small></td><td style="text-align:right"><span class="pill p-mute">Queued</span></td></tr>
        </tbody>
      </table>
      <div class="legend" aria-label="Category colours"><span><i style="background:#F2C14E"></i>Columns</span><span><i style="background:#E58A5F"></i>Beams</span><span><i style="background:#86B9A0"></i>Slabs</span><span><i style="background:#6F94C9"></i>Walls &amp; cores</span><span><i style="background:#A48BEA"></i>Fa\u00e7ade</span><span><i style="background:#58C6DA"></i>Services</span><span><i style="background:#FF7A1A"></i>Flagged</span></div>
      <p class="note">Illustrative check results on the sample model.</p>
    </div>
  </div>

  <!-- 5 4D/5D -->
  <section class="ch" data-ch="5">
    <p class="eyebrow">4D / 5D BIM Support</p>
    <h2>From a static model <em>to a live cost and schedule view.</em></h2>
    <p>Quantities, cost and sequence stay tied to the model as it develops, so planning works from current data.</p>
  </section>
  <div class="panel" data-panel="5" style="transform:translateY(-50%)">
    <div class="ph"><span>4D sequence \u00b7 <b id="wk">Week 0</b></span><span>5D take-off</span></div>
    <div class="pb">
      <div class="gantt" id="gantt"></div>
      <div class="qty">
        <div><small>Concrete</small><b id="q1">0 m\u00b3</b></div>
        <div><small>Curtain wall</small><b id="q2">0 m\u00b2</b></div>
        <div><small>MEP services</small><b id="q3">0 m</b></div>
        <div><small>Cost to date</small><b id="q4">$0</b></div>
      </div>
      <p class="note">Sample sequence and quantities from the model. Rates are illustrative.</p>
    </div>
  </div>

  <!-- 6 COBie -->
  <section class="ch" data-ch="6">
    <p class="eyebrow">COBie &amp; Information Management</p>
    <h2>Asset information, <em>structured for handover.</em></h2>
    <p>Asset data is reviewed, kept consistent with the model, and moved through the CDE as structured information delivery.</p>
  </section>
  <div class="panel" data-panel="6" style="transform:translateY(-50%)">
    <div class="ph"><span>COBie \u00b7 <b>Component</b></span><span>AHU-01</span></div>
    <div class="pb">
      <table class="tbl">
        <tbody>
          <tr><td>Name</td><td style="text-align:right">AHU-01 <span class="pill p-green">\u2713</span></td></tr>
          <tr><td>TypeName</td><td style="text-align:right">Air handling unit <span class="pill p-green">\u2713</span></td></tr>
          <tr><td>Space</td><td style="text-align:right">L05 \u2013 Plant room <span class="pill p-green">\u2713</span></td></tr>
          <tr><td>WarrantyDuration</td><td style="text-align:right">24 months <span class="pill p-green">\u2713</span></td></tr>
          <tr><td>SerialNumber</td><td style="text-align:right" id="serial"><span class="pill p-orange">Missing</span></td></tr>
        </tbody>
      </table>
      <div class="cde" id="cde"><div>WIP</div><div>Shared</div><div>Published</div><div>Archived</div></div>
      <div class="file"><span>KLY-MEC-L05-0001.ifc</span><span id="cdestate">WIP</span></div>
      <p class="note">Original AHU demonstration. Handover fields are sample values, not verified asset data from the replacement IFC.</p>
    </div>
  </div>

  <!-- 7 CTA -->
  <section class="ch" data-ch="7">
    <p class="eyebrow">Selected project experience</p>
    <h2>See coordination <em>applied to real projects.</em></h2>
    <p>Continue to the project work below for examples of coordinated models, issue tracking and digital delivery.</p>
    <a class="next-section" href="#portfolio" aria-label="Continue to projects"><span>View projects</span><i aria-hidden="true"></i></a>
  </section>
</div>
</div>`;

const PT_TEXT = {
  '3D building model that changes as you scroll': 'Modelo 3D do edifício que muda ao deslocar a página',
  'Overview': 'Visão geral',
  'Federation': 'Federação',
  'Clash detection': 'Deteção de conflitos',
  'Workflow': 'Fluxo de trabalho',
  'Start': 'Início',
  'BIM Coordination &amp; Digital Delivery': 'Coordenação BIM e Entrega Digital',
  'Resolve coordination <em>before it becomes</em> a construction problem.': 'Resolva a coordenação <em>antes que se torne</em> um problema em obra.',
  'Book a 15-Minute Consultation': 'Marcar uma Consulta de 15 Minutos',
  'View Our Work': 'Ver os Nossos Projetos',
  'Architecture \u00b7 Structure \u00b7 MEP': 'Arquitetura \u00b7 Estrutura \u00b7 MEP',
  'Projects in Australia &amp; Mozambique': 'Projetos na Austrália e em Moçambique',
  'Response within 24 h': 'Resposta em até 24 h',
  'Scroll to explore': 'Deslize para explorar',
  'Explore in 3D': 'Explorar em 3D',
  'Drag to orbit \u00b7 scroll or pinch to zoom \u00b7 right-drag or two fingers to pan': 'Arraste para rodar \u00b7 deslize ou aproxime para ampliar \u00b7 botão direito ou dois dedos para mover',
  'Reset view': 'Repor vista',
  'Back to story': 'Voltar à apresentação',
  'Model Federation': 'Federação de Modelos',
  'Different disciplines. <em>One coordinated environment.</em>': 'Diferentes disciplinas. <em>Um ambiente coordenado.</em>',
  'Architectural, structural and MEP models are combined into one federated environment, so alignment and multidisciplinary conflicts are reviewed before construction.': 'Os modelos de arquitetura, estrutura e MEP são reunidos num único ambiente federado, permitindo rever alinhamentos e conflitos multidisciplinares antes da construção.',
  'Clash Detection &amp; Issue Review': 'Deteção de Conflitos e Revisão de Questões',
  'Not every clash deserves <em>the same attention.</em>': 'Nem todos os conflitos exigem <em>a mesma atenção.</em>',
  'Hard clashes and clearance issues are reviewed in context, prioritised, and separated from low-value results.': 'Os conflitos físicos e problemas de afastamento são analisados em contexto, priorizados e separados dos resultados de baixo valor.',
  'Clash test': 'Teste de conflitos',
  'Level 02': 'Nível 02',
  'Sample': 'Exemplo',
  'Elements': 'Elementos',
  'Status': 'Estado',
  '<th>Type</th>': '<th>Tipo</th>',
  'Ruleset': 'Conjunto de regras',
  'Rule': 'Regra',
  'Result': 'Resultado',
  'Hard': 'Físico',
  'High': 'Alta',
  'Clear.': 'Afast.',
  'Soft': 'Suave',
  'Light fitting': 'Luminária',
  'Ceiling grid': 'Grelha do teto',
  'Cable tray 300': 'Esteira de cabos 300',
  'Duct fitting': 'Acessório de conduta',
  'Duct': 'Conduta',
  'Tray runs through the duct': 'A esteira atravessa a conduta',
  'Tray runs through the fitting': 'A esteira atravessa o acessório',
  '47 mm clearance': '47 mm de afastamento',
  'required': 'necessários',
  'Filtered as low value': 'Filtrado como baixo valor',
  'Ignored': 'Ignorado',
  'Illustrative coordination sequence from the original demo: trays lower to show 100 mm clearance. This is not a clash report or an approved change to the updated models.': 'Sequência ilustrativa da demonstração original: as esteiras descem para mostrar 100 mm de afastamento. Não se trata de um relatório de conflitos nem de uma alteração aprovada aos modelos atualizados.',
  'Controlled Workflow': 'Fluxo de Trabalho Controlado',
  'Finding the clash is the beginning. <em>Closing it is what matters.</em>': 'Encontrar o conflito é apenas o início. <em>Resolucioná-lo é o que importa.</em>',
  'Every relevant issue is reviewed, prioritised, assigned, monitored and verified before closure.': 'Todas as questões relevantes são revistas, priorizadas, atribuídas, monitorizadas e verificadas antes do encerramento.',
  'Issue <b>': 'Questão <b>',
  'Title': 'Título',
  'Cable tray through duct, Level 02': 'Esteira de cabos através da conduta, Nível 02',
  'Priority': 'Prioridade',
  'Assigned to': 'Atribuído a',
  'Electrical trade': 'Especialidade elétrica',
  'Due': 'Prazo',
  'Next coordination meeting': 'Próxima reunião de coordenação',
  'Reviewed': 'Revisto',
  'Model context': 'Contexto do modelo',
  'Prioritised': 'Priorizado',
  'Risk to install': 'Risco de instalação',
  'Assigned': 'Atribuído',
  'Owner set': 'Responsável definido',
  'Monitored': 'Monitorizado',
  'Model update': 'Atualização do modelo',
  'Verified': 'Verificado',
  'Re-run test': 'Repetir teste',
  'Closed': 'Encerrado',
  'Logged': 'Registado',
  'BIM QA/QC &amp; Model Validation': 'QA/QC BIM e Validação do Modelo',
  'A model that looks right. <em>Data that has to be right.</em>': 'Um modelo com bom aspeto. <em>Dados que têm de estar corretos.</em>',
  'Naming, classification and property sets are checked against the project rules, and every finding goes back to the design team through BCF.': 'A nomenclatura, classificação e conjuntos de propriedades são verificados segundo as regras do projeto, e cada resultado regressa à equipa de projeto através de BCF.',
  'Project EIR': 'EIR do Projeto',
  'Naming convention': 'Convenção de nomes',
  'Element &amp; type names': 'Nomes de elementos e tipos',
  'Classification review': 'Revisão da classificação',
  'Every element classified': 'Todos os elementos classificados',
  'Property validation': 'Validação de propriedades',
  'Required property sets': 'Conjuntos de propriedades obrigatórios',
  'Model compliance': 'Conformidade do modelo',
  'Levels, grids, origin': 'Níveis, grelhas e origem',
  'Queued': 'Em fila',
  'Category colours': 'Cores das categorias',
  'Columns': 'Pilares',
  'Beams': 'Vigas',
  'Slabs': 'Lajes',
  'Walls &amp; cores': 'Paredes e núcleos',
  'Façade': 'Fachada',
  'Services': 'Instalações',
  'Flagged': 'Sinalizado',
  'Illustrative check results on the sample model.': 'Resultados ilustrativos de verificação no modelo de exemplo.',
  '4D / 5D BIM Support': 'Suporte BIM 4D / 5D',
  'From a static model <em>to a live cost and schedule view.</em>': 'De um modelo estático <em>para uma visão dinâmica de custos e planeamento.</em>',
  'Quantities, cost and sequence stay tied to the model as it develops, so planning works from current data.': 'As quantidades, os custos e a sequência permanecem ligados ao modelo à medida que este evolui, para que o planeamento utilize dados atuais.',
  '4D sequence': 'Sequência 4D',
  'Week 0': 'Semana 0',
  '5D take-off': 'Medições 5D',
  'Concrete': 'Betão',
  'Curtain wall': 'Fachada cortina',
  'MEP services': 'Serviços MEP',
  'Cost to date': 'Custo acumulado',
  'Sample sequence and quantities from the model. Rates are illustrative.': 'Sequência e quantidades de exemplo provenientes do modelo. Os preços são ilustrativos.',
  'COBie &amp; Information Management': 'COBie e Gestão da Informação',
  'Component': 'Componente',
  'Asset information, <em>structured for handover.</em>': 'Informação dos ativos, <em>estruturada para a entrega.</em>',
  'Asset data is reviewed, kept consistent with the model, and moved through the CDE as structured information delivery.': 'Os dados dos ativos são revistos, mantidos consistentes com o modelo e encaminhados pelo CDE como informação estruturada.',
  'Air handling unit': 'Unidade de tratamento de ar',
  'Plant room': 'Sala técnica',
  '24 months': '24 meses',
  'TypeName': 'Nome do tipo',
  'Name': 'Nome',
  'Space': 'Espaço',
  'WarrantyDuration': 'Duração da garantia',
  'SerialNumber': 'Número de série',
  'WIP': 'Em curso',
  'Missing': 'Em falta',
  'Shared': 'Partilhado',
  'Published': 'Publicado',
  'Archived': 'Arquivado',
  'Original AHU demonstration. Handover fields are sample values, not verified asset data from the replacement IFC.': 'Demonstração original da UTA. Os campos de entrega são valores de exemplo, não dados verificados do ativo no IFC de substituição.',
  'On-demand BIM support, remote and worldwide': 'Suporte BIM a pedido, remoto e global',
  'Coordinate digitally. <em>Build with confidence.</em>': 'Coordene digitalmente. <em>Construa com confiança.</em>',
  'Clearer decisions, fewer unresolved conflicts and better information before construction.': 'Decisões mais claras, menos conflitos por resolver e melhor informação antes da construção.',
  'Selected project experience': 'Experiência em projetos selecionados',
  'See coordination <em>applied to real projects.</em>': 'Veja a coordenação <em>aplicada a projetos reais.</em>',
  'Continue to the project work below for examples of coordinated models, issue tracking and digital delivery.': 'Continue para os projetos abaixo e veja exemplos de modelos coordenados, acompanhamento de questões e entrega digital.',
  'Continue to projects': 'Continuar para os projetos',
  'View projects': 'Ver projetos',
  'Our Services': 'Os Nossos Serviços'
};

function storyMarkup(language) {
  if (language !== 'pt') return MARKUP;
  return Object.entries(PT_TEXT).reduce((html, [english, portuguese]) => html.split(english).join(portuguese), MARKUP);
}

/* Real-model constants (metres; origin = building centre; y = 0 at Level 00 floor). */
const NL = 7;                       // levels 00\u201305 + roof
const CLASH = 2;                    // the clash cluster sits on Level 02
const CLASH_PTS = [[1.28, 10.78, 3.0], [4.14, 10.78, -4.2], [2.42, 10.63, 1.6]];   // where each cable tray meets the ductwork
const CLASH_DROP = {c1: .16, c2: .43, c3: .06};   // drop that gives each tray 100 mm clearance under the duct
const ASSET_TOP = [5.1, 23.4, 3.7];                // top of AHU-01, Level 05 plant room
/* exploded view: side by side on wide screens (like a row of models), stacked on phones */
const FED_WIDE = {arch: [0, 0, 1.5], str: [0, 0, .5], mech: [0, 0, -.5], ele: [0, 0, -1.5]};
const FED_TALL = {str: [0, 0, 0], ele: [0, 1, 0], mech: [0, 2, 0], arch: [0, 3, 0]};
const FED_GAP = 44;
const FED_LABEL = {arch: ['Architectural', 'ARK.rvt'], str: ['Structure', 'STRUC.ifc'], ele: ['Electrical', 'ELE.rvt'], mech: ['Mechanical', 'HVAC.rvt']};
const FED_LABEL_PT = {arch: ['Arquitetura', 'ARK.rvt'], str: ['Estrutura', 'STRUC.ifc'], ele: ['Elétrica', 'ELE.rvt'], mech: ['Mecânica', 'HVAC.rvt']};


export function mountKlyronScrollStory(root, {
  modelUrl = null,
  modelUrls = ['/models/klyron-story-shell.glb', '/models/klyron-story-architecture.glb', '/models/klyron-story-structure.glb', '/models/klyron-story-systems.glb', '/models/klyron-detail-mechanical-core.glb', '/models/klyron-detail-mechanical-upper.glb'],
  detailModelUrls = ['/models/klyron-detail-architecture.glb'],
  modelData = null,
  city: withCity = true,
  language = 'en'
} = {}) {
  let isPt = language === 'pt';
  root.classList.add('kss');
  if (!document.getElementById('kss-style')) {
    const st = document.createElement('style'); st.id = 'kss-style'; st.textContent = CSS; document.head.appendChild(st);
  }
  root.innerHTML = storyMarkup(language);
  const sticky = root.querySelector('.kss-sticky');
  let disposed = false;

  /* ---------- renderer ---------- */
  const canvas = root.querySelector('#stage');
  const memory = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const isPhone = matchMedia('(max-width: 820px)').matches;
  const constrainedDevice = memory <= 4 || cores <= 4;
  const renderer = new THREE.WebGLRenderer({canvas, antialias: !constrainedDevice, alpha: true, powerPreference: 'high-performance'});
  const pixelRatioCap = constrainedDevice ? 1.25 : isPhone ? 1.75 : 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;   // PCF supports shadow.radius (soft edges)
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0e1c2a, 150, 760);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = .55;
  const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 1200);

  const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x2a2018, .75); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1e0, 2.4); sun.position.set(60, 90, 45); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, {left: -60, right: 60, top: 45, bottom: -45, near: 20, far: 260});
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = .04; scene.add(sun);
  const rim = new THREE.DirectionalLight(0x39c3ff, .6); rim.position.set(-80, 40, -60); scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({color: 0x0a1118, roughness: 1}));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -4.02; ground.receiveShadow = true; scene.add(ground);
  const city = withCity ? buildCity(scene, {renderer}) : null;
  const LIGHT = {sun: 2.4, hemi: .75, env: .55};
  if (city) {   // daylight to match the city: warm late-afternoon sun from the same direction as the city's painted shadows
    ground.visible = false;
    scene.environment = city.envMap;   // building and city reflect the same sky (RoomEnvironment looked like a grey studio next to it)
    Object.assign(LIGHT, {sun: 2.55, hemi: .62, env: .62});
    sun.color.setHex(0xffdcb0); sun.position.copy(SUN_DIR).multiplyScalar(200);
    const shadowSize = constrainedDevice ? 1024 : isPhone ? 1536 : 2048;
    sun.shadow.mapSize.set(shadowSize, shadowSize); sun.shadow.radius = 2.5; sun.shadow.bias = -0.0003; sun.shadow.normalBias = .05;
    Object.assign(sun.shadow.camera, {left: -95, right: 95, top: 95, bottom: -95, near: 60, far: 380}); sun.shadow.camera.updateProjectionMatrix();
    hemi.color.setHex(0xcfdcea); hemi.groundColor.setHex(0x5f6447);
    rim.intensity = 0; renderer.toneMappingExposure = .92;
    root.classList.add('kss-day');
  }
  sun.intensity = LIGHT.sun; hemi.intensity = LIGHT.hemi; scene.environmentIntensity = LIGHT.env;
  let cityDim = 0;

  /* ---------- materials ---------- */
  const M = (o) => new THREE.MeshStandardMaterial(o);
  const MAT = {
    concrete: () => M({color: 0xaaa69e, roughness: .86}),
    slab: () => M({color: 0xbab5ac, roughness: .9}),
    steel: () => M({color: 0x5f6973, roughness: .38, metalness: .8}),
    render: () => M({color: 0xe1ddd5, roughness: .82}),
    glass: () => new THREE.MeshPhysicalMaterial({color: 0x86a6b9, roughness: .04, metalness: .15, transparent: true, opacity: .5, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: .05, side: THREE.DoubleSide}),
    frame: () => M({color: 0x4f6575, roughness: .12, metalness: .6, envMapIntensity: 1.7}),   // window assemblies and mullions: reflective glazed frames
    metal: () => M({color: 0x8a949c, roughness: .45, metalness: .6}),
    light: () => M({color: 0xe3e5e7, roughness: .85}),
    tray: () => M({color: 0xe89a2e, roughness: .45, metalness: .6}),
    duct: () => M({color: 0x3f8fde, roughness: .38, metalness: .55}),
    pipe: () => M({color: 0x3faf64, roughness: .4, metalness: .3}),
    spr: () => M({color: 0xd94141, roughness: .4, metalness: .3}),
    dark: () => M({color: 0x2a323a, roughness: .6, metalness: .5}),
    equip: () => M({color: 0xc6ccd1, roughness: .45, metalness: .6}),
    site: () => M({color: 0x1a252e, roughness: 1}),
  };
  const MATKEY = {
    arch: {facade: 'frame', glass: 'glass', wall: 'render', slab: 'slab', col: 'concrete', stair: 'slab', railing: 'metal', door: 'metal', ceiling: 'light'},
    str: {slab: 'slab', steel: 'steel'},
    ele: {tray: 'tray', device: 'equip'},
    mech: {duct: 'duct', fitting: 'duct', pipe: 'pipe', equip: 'equip'},
  };
  const QA = {col: 0xF2C14E, beam: 0xE58A5F, slab: 0x86B9A0, wall: 0x6F94C9, steel: 0xD98AC0, other: 0x9AA5B1, facade: 0xA48BEA, glass: 0xA48BEA,
    railing: 0x8FD3E8, door: 0xC9D2DB, stair: 0x86B9A0, ceiling: 0xC9D2DB, tray: 0x58C6DA, device: 0x9AA5B1, duct: 0x58C6DA, pipe: 0x58C6DA, spr: 0x58C6DA, riser: 0x58C6DA, fitting: 0x58C6DA, equip: 0x9AA5B1, plant: 0x9AA5B1, fan: 0x9AA5B1, flag: 0xFF7A1A};
  const FLAGGED = new Set(['arch|3|door', 'str|4|other', 'ele|1|device', 'mech|4|duct']);

  /* ---------- model state ---------- */
  const groups = {};
  const G = (d) => { if (!groups[d]) { groups[d] = new THREE.Group(); scene.add(groups[d]); } return groups[d]; };
  const elements = [], CL = {}, TASKS = [];
  let ASSET = null, ready = false;
  let detailsReady = Boolean(modelUrl || modelData), detailsPromise = null, guidedDetailsPromise = null, guidedDetailsError = null, loadingDetails = false;
  const edgeMat = new THREE.LineBasicMaterial({color: 0x0b1016, transparent: true, opacity: .35});

  // Lightweight guided-story HVAC context. The full mechanical network remains an
  // Explore-only download, while these simple runs keep federation and clash views legible.
  const mechProxy = new THREE.Group(); mechProxy.name = 'guided-mechanical-proxy';
  const proxyDuctMat = M({color: 0x3f8fde, roughness: .42, metalness: .45, transparent: true, opacity: .78});
  const proxyPipeMat = M({color: 0x3faf64, roughness: .45, metalness: .25, transparent: true, opacity: .82});
  [[13, .85, 1.35, 1.8, 10.65, 2.1], [1.2, .8, 13, 4.1, 10.72, -1.5], [8, .55, .8, -2, 10.9, -4.15]].forEach(([x, y, z, px, py, pz]) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(x, y, z), proxyDuctMat); mesh.position.set(px, py, pz); mechProxy.add(mesh);
  });
  [[-3.5, 10.5, 2.8], [7.2, 10.5, 1.3]].forEach(([x, y, z]) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, 15, 8), proxyPipeMat); mesh.rotation.z = Math.PI / 2; mesh.position.set(x, y, z); mechProxy.add(mesh);
  });
  mechProxy.visible = !detailsReady;
  G('mech').add(mechProxy);

  function addElement(mesh) {
    const [d0, lv, cat] = mesh.name.split('|');
    const level = +lv;
    const disc = d0 === 'clash' ? 'ele' : d0 === 'asset' || d0 === 'clashduct' ? 'mech' : d0;
    const key = d0 === 'site' ? 'site' : d0 === 'clash' ? 'tray' : d0 === 'clashduct' ? 'duct' : d0 === 'asset' ? 'equip' : (MATKEY[disc] && MATKEY[disc][cat]) || 'concrete';
    const mat = MAT[key](); mat.userData = {base: mat.color.clone(), op: mat.opacity}; mat.transparent = true;
    if (!mesh.geometry.attributes.normal) { mat.flatShading = true; mat.side = THREE.DoubleSide; }   // HVAC ships without normals to stay light; AHU casings are single panels
    mesh.material = mat; mesh.castShadow = key !== 'glass' && disc !== 'site'; mesh.receiveShadow = true;
    const o = new THREE.Group(); o.add(mesh);   // keep the mesh's own transform: it carries the dequantisation scale/offset
    if (disc === 'str') { const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 30), edgeMat.clone()); e.material.userData = {op: .35}; e.position.copy(mesh.position); e.quaternion.copy(mesh.quaternion); e.scale.copy(mesh.scale); o.add(e); }
    G(disc === 'site' ? 'site' : disc).add(o);
    const qty = (mesh.userData && mesh.userData.qty) || {};
    const rec = {o, mesh, disc, level, cat, qty, demo: /^(clash|clashduct|asset)$/.test(d0), demoKind: d0, key: mesh.name, flag: FLAGGED.has(mesh.name), f: 1, lift: disc === 'str' ? 2.5 : 1.2,
      clashKeep: d0 === 'clash' || d0 === 'clashduct' ? 1 : (disc === 'ele' || disc === 'mech') && level === CLASH ? .32 : 0};   // 1 = in focus, .32 = context
    elements.push(rec);
    if (d0 === 'clash') CL[cat] = rec;
    if (d0 === 'asset') ASSET = rec;
    return rec;
  }

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const loadBox = root.querySelector('#modelLoad');
  const loadLabel = root.querySelector('#modelLoadLabel');
  const loadValue = root.querySelector('#modelLoadValue');
  const loadBar = root.querySelector('#modelLoadBar');
  const exploreButton = root.querySelector('#xopen');
  const setLoadProgress = (value, label) => {
    const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
    loadValue.textContent = `${pct}%`;
    loadBar.style.width = `${pct}%`;
    if (label) loadLabel.textContent = label;
  };
  const rebuildTasks = () => {
    TASKS.length = 0;
    const by = (fn) => elements.filter(fn).sort((a, b) => a.level - b.level);
    const envelope = new Set(['facade', 'glass', 'wall', 'slab', 'railing']);
    TASKS.push(
      {n: 'Excavation', s: 0, d: 6, it: [], works: true},
      {n: 'Substructure', s: 5, d: 6, it: by((e) => e.disc === 'str' && e.level <= 0 && e.cat !== 'col')},
      {n: 'Frame L00\u2013L02', s: 10, d: 12, it: by((e) => e.disc === 'str' && ((e.level >= 0 && e.level <= 2 && !(e.level === 0 && e.cat !== 'col'))))},
      {n: 'Frame L03\u2013Roof', s: 20, d: 12, it: by((e) => e.disc === 'str' && e.level >= 3)},
      {n: 'Envelope', s: 28, d: 20, it: by((e) => e.disc === 'arch' && envelope.has(e.cat))},
      {n: 'Electrical', s: 32, d: 22, it: by((e) => e.disc === 'ele')},
      {n: 'Mechanical', s: 34, d: 22, it: by((e) => e.disc === 'mech')},
      {n: 'Fit-out', s: 46, d: 14, it: by((e) => e.disc === 'arch' && !envelope.has(e.cat))},
      {n: 'Landscape', s: 58, d: 6, it: [], works: true},
    );
    for (let i = TASKS.length - 1; i >= 0; i--) if (!TASKS[i].it.length && !(TASKS[i].works && city)) TASKS.splice(i, 1);
    buildGantt();
  };
  const onModel = (gltf) => {
    if (disposed) return;
    const meshes = []; gltf.scene.traverse((o) => { if (o.isMesh) meshes.push(o); });
    meshes.forEach(addElement);
    rebuildTasks();
    ready = true;
  };
  const onError = (err) => {
    console.error('[kss] model load failed', err);
    setLoadProgress(0, isPt ? 'N\u00e3o foi poss\u00edvel carregar o modelo' : 'Model could not be loaded');
  };
  async function loadFiles(urls, label, parallel = false) {
    if (parallel && urls.length > 1) {
      const progress = urls.map(() => 0);
      const parts = await Promise.all(urls.map((url, i) => loader.loadAsync(url, (event) => {
        progress[i] = event.total ? event.loaded / event.total : 0;
        setLoadProgress(progress.reduce((sum, value) => sum + value, 0) / urls.length, label());
      })));
      parts.forEach(onModel);
      return;
    }
    for (let i = 0; i < urls.length; i++) {
      const gltf = await loader.loadAsync(urls[i], (event) => {
        const part = event.total ? event.loaded / event.total : 0;
        setLoadProgress((i + part) / urls.length, label());
      });
      onModel(gltf);
    }
  }
  async function startModelLoading() {
    if (modelData) {
      loader.parse(modelData, '', (gltf) => { onModel(gltf); exploreButton.disabled = false; loadBox.hidden = true; }, onError);
      return;
    }
    const urls = modelUrl ? [modelUrl] : modelUrls;
    try {
      // Render the exact architectural shell first. Structural and electrical BIM
      // geometry continues loading in the background without reducing model quality.
      await loadFiles([urls[0]], () => isPt ? 'A preparar o edif\u00edcio 3D' : 'Preparing 3D building');
      root.classList.add('kss-core-ready');
      setLoadProgress(1, isPt ? 'Experi\u00eancia 3D pronta' : '3D experience ready');
      exploreButton.disabled = false;
      setTimeout(() => { if (!disposed) loadBox.hidden = true; }, 650);
      if (!modelUrl && urls.length > 1) {
        guidedDetailsPromise = loadFiles(urls.slice(1), () => isPt ? 'A preparar os detalhes BIM' : 'Preparing BIM details', true)
          .then(() => { mechProxy.visible = false; })
          .catch((error) => { guidedDetailsError = error; onError(error); });
      }
    } catch (error) {
      onError(error);
    }
  }
  async function ensureExploreDetails() {
    if (detailsReady || modelUrl || modelData) return;
    if (detailsPromise) return detailsPromise;
    loadingDetails = true;
    exploreButton.disabled = true;
    loadBox.hidden = false;
    setLoadProgress(0, isPt ? 'A carregar o modelo detalhado' : 'Loading detailed model');
    detailsPromise = (guidedDetailsPromise || Promise.resolve())
      .then(() => { if (guidedDetailsError) throw guidedDetailsError; })
      .then(() => loadFiles(detailModelUrls, () => isPt ? 'A carregar o modelo detalhado' : 'Loading detailed model', true))
      .then(() => {
        detailsReady = true;
        mechProxy.visible = false;
        loadingDetails = false;
        setLoadProgress(1, isPt ? 'Modelo detalhado pronto' : 'Detailed model ready');
        setTimeout(() => { if (!disposed) loadBox.hidden = true; }, 450);
      })
      .catch((error) => {
        loadingDetails = false;
        detailsPromise = null;
        onError(error);
        throw error;
      })
      .finally(() => { exploreButton.disabled = false; });
    return detailsPromise;
  }

  /* ---------- 4D schedule UI ---------- */
  const WEEKS = 64;
  const gantt = root.querySelector('#gantt');
  const head = document.createElement('div'); head.className = 'g-head';
  const taskNamesPt = {
    Excavation: 'Escava\u00e7\u00e3o', Substructure: 'Subestrutura',
    'Frame L00\u2013L02': 'Estrutura L00\u2013L02', 'Frame L03\u2013Roof': 'Estrutura L03\u2013Cobertura',
    Envelope: 'Envolvente', Electrical: 'El\u00e9trica', Mechanical: 'Mec\u00e2nica',
    'Fit-out': 'Acabamentos', Landscape: 'Paisagismo'
  };
  const taskLabel = (name) => isPt ? (taskNamesPt[name] || name) : name;
  function buildGantt() {
    gantt.replaceChildren();
    TASKS.forEach((t) => {
      const r = document.createElement('div'); r.className = 'g-row';
      r.innerHTML = `<span>${taskLabel(t.n)}</span><div class="g-track"><div style="left:${t.s / WEEKS * 100}%;width:${t.d / WEEKS * 100}%"><b></b></div></div>`;
      gantt.appendChild(r); t.bar = r.querySelector('b'); t.label = r.querySelector('span');
    });
    gantt.appendChild(head);
  }
  startModelLoading();
  const RATE = {conc: 240, glass: 520, tray: 95};

  /* ---------- helpers ---------- */
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
  const ramp = (p, a, b) => sm((p - a) / (b - a));
  const ease = (x) => { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const tmpC = new THREE.Color(), tmpC2 = new THREE.Color();
  /** value per chapter hold, blended during the camera move; fades in slightly ahead of the camera, out slightly behind it */
  function blend(arr, p) {
    const k = Math.min(arr.length - 1, Math.floor(p)), u = p - k, k2 = Math.min(arr.length - 1, k + 1), a = arr[k], b = arr[k2];
    if (a === b) return a;
    return lerp(a, b, b > a ? ease(cl((u - .45) / .42)) : ease(cl((u - .62) / .38)));
  }
  const ISO_CLASH = [0, 0, 1, 1, 0, 0, 0, 0], ISO_COBIE = [0, 0, 0, 0, 0, 0, 1, 0];

  /* camera keyframes per chapter: [pos, target] */
  const K = [
    [V(98.90, 87.24, 161.07), V(-28.6, 20.94, 20.82)],   // 0 hero: aerial view, building right of the headline, city and sea beyond
    [V(181.95, 182.08, 101.29), V(-14.05, 14.08, 31.29)],  // 1 federation: four models side by side, right of the text
    [V(11.63, 9.74, 14.55), V(0.76, 12.93, 2.23)],       // 2 clash: Level 02 ceiling void, trays crossing ductwork, below the panel
    [V(-7.93, 8.25, 9.29), V(2.87, 9.69, 0.29)],         // 3 workflow: same issue, opposite side, upper middle
    [V(-118, 52, 92), V(12, 3, 4)],          // 4 QA/QC
    [V(88, 44, 96), V(14, 3, 0)],            // 5 4D/5D
    [V(14.24, 25.19, 14.88), V(5.24, 20.99, 3.88)],      // 6 COBie: AHU-01 in the Level 05 plant room
    [V(166.12, 58.74, 147.37), V(-18.88, 12.74, 27.37)],  // 7 closing
  ];
  // Bring technical views 25% closer while preserving targets and surrounding context.
  for (const i of [2, 3, 6]) K[i][0].sub(K[i][1]).multiplyScalar(.75).add(K[i][1]);
  /* portrait screens: text sits below the model, so aim at the building itself (null = keep desktop target) */
  const KM = [V(0, -12, 0), V(0, 38, 0), V(2.3, 12.4, 0.5), V(2.6, 11.0, 0.5), V(2, 12, 0), V(0, -4, 0), V(5.24, 25.5, 3.88), V(0, -5, 0)];
  const NCH = K.length, INSIDE = new Set([2, 3, 6]);
  const PLIFT = [0, 0, 0, 0, 0, 0, 0, 26];
  /* Optional intermediate poses for the move from chapter k to k+1 (desktop coordinates; `at` = share of the move). */
  const VIA = {};
  const SA = new THREE.Spherical(), SB = new THREE.Spherical(), D0 = new THREE.Vector3();
  /** Move the target in a straight line and the view offset along an arc (spherical coordinates around the target),
   *  so the camera swings around what it looks at instead of cutting through it. */
  function arc(pa, ta, pb, tb, m) {
    const tgt = ta.clone().lerp(tb, m);
    SA.setFromVector3(D0.copy(pa).sub(ta)); SB.setFromVector3(D0.copy(pb).sub(tb));
    const dth = Math.atan2(Math.sin(SB.theta - SA.theta), Math.cos(SB.theta - SA.theta));
    const sph = new THREE.Spherical(Math.exp(lerp(Math.log(SA.radius), Math.log(SB.radius), m)), lerp(SA.phi, SB.phi, m), SA.theta + dth * m);
    return {pos: new THREE.Vector3().setFromSpherical(sph).add(tgt), tgt};
  }
  function keyPose(pos, tgt, i, por) {   // portrait screens aim at KM[i] while keeping the desktop viewing angle
    pos = pos.clone(); tgt = tgt.clone();
    if (por && KM[i] != null) { pos.add(KM[i]).sub(tgt); tgt.copy(KM[i]); }
    return [pos, tgt];
  }
  /** Camera pose for scroll progress p on a screen of the given aspect ratio. Pure: used for rendering and path checks. */
  function pose(p, aspect, t = 0) {
    const por = aspect < 1, k = Math.min(NCH - 1, Math.floor(p)), u = p - k, k2 = Math.min(NCH - 1, k + 1);
    const m = ease(cl((u - .5) / .5));             // hold for the first half of a chapter, travel in the second half
    const [pa, ta] = keyPose(K[k][0], K[k][1], k, por), [pb, tb] = keyPose(K[k2][0], K[k2][1], k2, por);
    let r;
    if (VIA[k] && k2 !== k) {
      const sh = (i) => (por && KM[i] != null ? KM[i].clone().sub(K[i][1]) : new THREE.Vector3());
      const pts = [{at: 0, pos: pa, tgt: ta}, ...VIA[k].map((v) => { const d = sh(k).lerp(sh(k2), v.at); return {at: v.at, pos: v.pos.clone().add(d), tgt: v.tgt.clone().add(d)}; }), {at: 1, pos: pb, tgt: tb}];
      let sgi = 0; while (sgi < pts.length - 2 && m > pts[sgi + 1].at) sgi++;
      const a = pts[sgi], b = pts[sgi + 1];
      r = arc(a.pos, a.tgt, b.pos, b.tgt, sm((m - a.at) / (b.at - a.at)) * .35 + ((m - a.at) / (b.at - a.at)) * .65);
    } else r = arc(pa, ta, pb, tb, m);
    const sph = new THREE.Spherical().setFromVector3(r.pos.clone().sub(r.tgt));
    sph.theta += .06 * Math.sin(Math.PI * u) * (1 - m) + Math.sin(t * .15) * .012;   // slow drift while holding; zero at chapter boundaries
    const pk = (i) => (i === 1 ? 1.05 : 1);
    const inside = lerp(INSIDE.has(k) ? 1 : 0, INSIDE.has(k2) ? 1 : 0, m);
    const portrait = por ? (1.1 + (1 - aspect) * .35) * lerp(pk(k), pk(k2), m) : 1;
    sph.radius *= lerp(portrait, lerp(portrait, 1.15, .6), inside);
    const pos = new THREE.Vector3().setFromSpherical(sph).add(r.tgt);
    if (por) pos.y = lerp(Math.max(pos.y, 44), pos.y, cl(inside * 3));   // phones: stay above the neighbouring roofs outside the building
    if (por) pos.y += lerp(PLIFT[k], PLIFT[k2], m);   // phones: extra height where a low view would look through neighbours
    return {pos, tgt: r.tgt, inside};
  }
  const lastTgt = new THREE.Vector3();
  function cameraAt(p, t) {
    if (sticky.clientWidth <= 820) cam.setViewOffset(sticky.clientWidth, sticky.clientHeight, 0, sticky.clientHeight * .23, sticky.clientWidth, sticky.clientHeight);
    else cam.clearViewOffset();
    const r = pose(p, cam.aspect, t);
    cam.position.copy(r.pos); cam.lookAt(r.tgt); lastTgt.copy(r.tgt);
    cam.updateMatrixWorld();   // so 3D-anchored labels project with this frame's camera
  }
  /** samples of the whole camera path (desktop, tablet and phone shapes), as [px, py, pz, tx, ty, tz] */
  function pathSamples(step = .02) {
    const out = [];
    for (const asp of [1400 / 860, 1, 390 / 844]) for (let p = 0; p <= NCH - 1 + 1e-6; p += step) { const r = pose(p, asp); out.push([r.pos.x, r.pos.y, r.pos.z, r.tgt.x, r.tgt.y, r.tgt.z]); }
    return out;
  }
  if (city) city.clearAlong(pathSamples());   // no tree between the camera and the model anywhere along the story

  /* ---------- DOM refs ---------- */
  const chs = [...root.querySelectorAll('.ch')], panels = [...root.querySelectorAll('.panel')];
  const mobileReading = document.createElement('div'); mobileReading.className = 'mobile-reading';
  mobileReading.setAttribute('aria-label', isPt ? 'Informação e relatório do capítulo' : 'Chapter information and report'); mobileReading.tabIndex = 0;
  root.querySelector('.ui').appendChild(mobileReading);
  [...chs, ...panels].forEach(el => mobileReading.appendChild(el));
  let mobileChapter = -1;
  const tags = root.querySelector('#tags'), hint = root.querySelector('#hint');
  const $ = (id) => root.querySelector('#' + id);
  const steps = [...root.querySelectorAll('#steps .step')];
  const qarows = [...root.querySelectorAll('#qarows tr')];
  const cdeEls = [...root.querySelectorAll('#cde div')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const syncTextTree = (current, translated) => {
    if (!current || !translated || ['gantt', 'tags', 'serial'].includes(current.id)) return;
    const currentNodes = [...current.childNodes];
    const translatedNodes = [...translated.childNodes];
    translatedNodes.forEach((sourceNode, index) => {
      const targetNode = currentNodes[index];
      if (!targetNode || targetNode.nodeType !== sourceNode.nodeType) return;
      if (sourceNode.nodeType === Node.TEXT_NODE) targetNode.nodeValue = sourceNode.nodeValue;
      else if (sourceNode.nodeType === Node.ELEMENT_NODE && targetNode.tagName === sourceNode.tagName) syncTextTree(targetNode, sourceNode);
    });
  };
  function setLanguage(nextLanguage) {
    isPt = nextLanguage === 'pt';
    const translatedRoot = document.createElement('div');
    translatedRoot.innerHTML = storyMarkup(isPt ? 'pt' : 'en');

    chs.forEach((chapter) => {
      const source = translatedRoot.querySelector(`.ch[data-ch="${chapter.dataset.ch}"]`);
      if (source) chapter.innerHTML = source.innerHTML;
    });
    panels.forEach((panel) => {
      const source = translatedRoot.querySelector(`.panel[data-panel="${panel.dataset.panel}"]`);
      if (source) syncTextTree(panel, source);
    });
    ['hint', 'xopen', 'xreset', 'xclose'].forEach((id) => {
      syncTextTree($(id), translatedRoot.querySelector(`#${id}`));
    });
    syncTextTree(root.querySelector('.xhint'), translatedRoot.querySelector('.xhint'));
    canvas.setAttribute('aria-label', isPt ? 'Modelo 3D do edifício que muda ao deslocar a página' : '3D building model that changes as you scroll');
    mobileReading.setAttribute('aria-label', isPt ? 'Informação e relatório do capítulo' : 'Chapter information and report');
    if (!loadBox.hidden) loadLabel.textContent = loadingDetails
      ? (isPt ? 'A carregar o modelo detalhado' : 'Loading detailed model')
      : (isPt ? 'A preparar a experi\u00eancia 3D' : 'Preparing 3D experience');
    TASKS.forEach((task) => { if (task.label) task.label.textContent = taskLabel(task.n); });
  }
  function vis(p, k) {
    if (k === 0) return 1 - ramp(p, .45, .7);
    const inn = ramp(p, k - .3, k - .02), out = k === NCH - 1 ? 1 : 1 - ramp(p, k + .45, k + .7); return inn * out;
  }
  const pill = (el, cls, txt) => { el.className = 'pill ' + cls; el.textContent = txt; };
  function toScreen(v) { const q = v.clone().project(cam); return [(q.x + 1) / 2 * sticky.clientWidth, (1 - q.y) / 2 * sticky.clientHeight, q.z < 1]; }

  /* ---------- scroll ---------- */
  let target = 0, cur = 0, last = performance.now();
  function readScroll() { const r = root.getBoundingClientRect(), max = r.height - sticky.clientHeight; target = max > 0 ? cl(-r.top / max) * (NCH - 1) : 0; }
  addEventListener('scroll', readScroll, {passive: true});
  function resize() { const w = sticky.clientWidth, h = sticky.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 1 ? 56 : 34; cam.updateProjectionMatrix();
    const fogK = w / h < 1 ? 2 : 1; scene.fog.near = 150 * fogK; scene.fog.far = 760 * fogK; cam.far = city ? 6000 : 1200 * fogK; cam.updateProjectionMatrix(); readScroll(); }
  addEventListener('resize', resize); resize();

  /* ---------- per-frame state ---------- */
  const RED = new THREE.Color(0xff3434), GRN = new THREE.Color(0x3fd68b);
  function update(p, t) {
    const fed = ramp(p, .55, .95) * (1 - ramp(p, 1.5, 1.85));          // explode amount
    const clashV = blend(ISO_CLASH, p);                                 // inside-ceiling ghost view, timed with the camera
    const resolve = cl((p - 3.05) / .4);                                // illustrative reroute during the workflow chapter
    const mv = [0, 1, 2].map((k) => sm(resolve * 3 - k));               // trays move one after another
    const qa = ramp(p, 3.6, 3.95) * (1 - ramp(p, 4.5, 4.8));
    const scan = ramp(p, 3.75, 4.45);
    const build = ramp(p, 4.55, 4.8) * (1 - ramp(p, 5.75, 5.95));
    const week = ramp(p, 4.8, 5.55) * WEEKS;
    const cobie = blend(ISO_COBIE, p);
    const pulse = .5 + .5 * Math.sin(t * 6);
    const cm = ramp(clashV, .85, 1);                                    // clash pins and highlight once the camera has arrived
    cityDim = Math.max(clashV, cobie);
    sun.intensity = LIGHT.sun * (1 - .3 * cityDim); hemi.intensity = LIGHT.hemi * (1 - .25 * cityDim); scene.environmentIntensity = LIGHT.env * (1 - .3 * cityDim);
    if (city) city.setWorks(build > .5 && week < WEEKS - .5 ? {on: true, dig: cl(week / 6), fill: cl((week - 10.5) / 2.5), crane: week > 9 && week < 50, landscape: cl((week - 58) / 5.5)} : {on: false});
    let conc = 0, glass = 0, tray = 0;

    if (ready) {
      if (!detailsReady) {
        const proxyOpacity = lerp(1, .3, Math.max(clashV, cobie));
        proxyDuctMat.opacity = .78 * proxyOpacity;
        proxyPipeMat.opacity = .82 * proxyOpacity;
      }
      const fs = cam.aspect < 1 ? .72 : 1;
      const FED = cam.aspect < 1 ? FED_TALL : FED_WIDE;
      const lift = cam.aspect < 1 ? 0 : 6.5 * fed;   // side-by-side models rise clear of the terrace and plazas
      for (const d in groups) { const v = FED[d]; if (v) groups[d].position.set(v[0] * FED_GAP * fed * fs, v[1] * FED_GAP * fed * fs + lift, v[2] * FED_GAP * fed * fs); }
      elements.forEach((e) => { e.f = 1; });
      if (build > 0) TASKS.forEach((tk) => {
        const q = cl((week - tk.s) / tk.d), n = tk.it.length;
        tk.it.forEach((e, j) => { e.f = lerp(1, cl(q * n - j), build); });
        tk.bar.style.width = (q * 100) + '%';
      });
      elements.forEach((e) => {
        let op = 1;
        if (e.disc === 'site') op = 1 - .7 * Math.max(clashV, cobie);
        else {
          if (clashV > 0 && e.clashKeep !== 1) op *= lerp(1, e.clashKeep || (e.disc === 'arch' ? 0 : e.disc === 'str' ? (Math.abs(e.level - CLASH) <= 1 ? .14 : .04) : .04), clashV);
          if (cobie > 0 && e !== ASSET) op *= lerp(1, e.disc === 'arch' ? 0 : e.disc === 'str' ? (e.level === 5 && e.cat === 'slab' ? .3 : e.level === 5 && e.cat === 'col' ? .12 : .02) : e.disc === 'mech' ? (e.level >= 5 ? .16 : .02) : 0, cobie);
        }
        // Keep demonstration assets confined to their own chapters.
        if (e.demo) op = e.demoKind === 'asset' ? cobie : clashV;
        const f = sm(e.f); op *= f;
        e.o.visible = op > .01; e.o.position.y = (1 - f) * e.lift;
        e.o.children.forEach((c) => { const m = c.material, b = m.userData.op ?? 1; m.opacity = b * op; m.depthWrite = op > .6 || c.isLineSegments; });
        e.mesh.castShadow = op > .5 && e.mesh.material.userData.op === 1 && e.disc !== 'site';
        const m = e.mesh.material;
        if (qa > 0 && e.disc !== 'site') { const qc = e.flag && scan > ((e.level + .5) / NL) ? QA.flag : (QA[e.cat] ?? 0x888888); tmpC.copy(m.userData.base).lerp(tmpC2.setHex(qc), qa * .9); m.color.copy(tmpC); }
        else m.color.copy(m.userData.base);
        m.emissive.setHex(0);
        // Bright, consistent orange electrical discipline colour during model federation.
        if (e.disc === 'ele' && !e.demo && fed > 0) {
          m.color.lerp(tmpC2.setHex(0xff7a1a), fed);
          m.emissive.setHex(0xff7a1a).multiplyScalar(.35 * fed);
        }
        if (!e.demo && e.qty.conc) conc += e.qty.conc * f; if (!e.demo && e.qty.glass) glass += e.qty.glass * f; if (!e.demo && e.qty.tray) tray += e.qty.tray * f; if (!e.demo && e.qty.mep) tray += e.qty.mep * f;
      });
      // clash highlight + resolution: trays drop below the beam soffit
      for (const k in CL) {
        const e = CL[k], m = e.mesh.material, i = +k.slice(1) - 1;
        e.o.position.y -= CLASH_DROP[k] * mv[i];                      // the tray drops to its clearance position...
        const done = mv[i] >= .999;                                   // ...and turns green only once the move is complete
        m.color.lerp(RED, cm * (done ? 0 : 1) * (.7 + .3 * pulse));
        m.color.lerp(GRN, cm * (done ? 1 : 0) * .6);
        m.emissive.copy(m.color).multiplyScalar(.25 * cm);
      }
      if (ASSET && cobie > 0) ASSET.mesh.material.emissive.setRGB(.08 * cobie, .55 * cobie * (.6 + .4 * pulse), .85 * cobie * (.6 + .4 * pulse));
    }

    /* overlays */
    const mobileActive = Math.min(NCH - 1, Math.round(p));
    [...chs, ...panels].forEach(el => el.dataset.mobileActive = String(Number(el.dataset.ch ?? el.dataset.panel) === mobileActive));
    mobileReading.dataset.technical = String(panels.some((panel) => Number(panel.dataset.panel) === mobileActive));
    if (mobileActive !== mobileChapter) { mobileReading.scrollTop = 0; mobileChapter = mobileActive; }

    chs.forEach((c, k) => { const v = vis(p, k); c.style.opacity = v.toFixed(3); c.style.transform = `translateY(${((1 - v) * (p < k ? 24 : -24)).toFixed(1)}px)`; c.style.visibility = v > 0.01 ? 'visible' : 'hidden'; });
    panels.forEach((pn) => {
      const k = +pn.dataset.panel, v = vis(p, k); pn.style.opacity = v.toFixed(3);
      pn.style.transform = (sticky.clientWidth > 820 && !pn.classList.contains('top') ? 'translateY(-50%) ' : '') + `translateX(${((1 - v) * 30).toFixed(1)}px)`; pn.style.visibility = v > 0.01 ? 'visible' : 'hidden';
    });
    hint.style.opacity = (1 - ramp(p, .05, .3)).toFixed(3);
    const st = (k) => mv[k] >= .999 ? ['p-green', isPt ? 'Redirecionado' : 'Rerouted'] : mv[k] > 0 ? ['p-blue', isPt ? 'Em movimento' : 'Moving'] : p > 2.05 ? ['p-red', isPt ? 'Ativo' : 'Active'] : ['p-blue', isPt ? 'Novo' : 'New'];
    [['s1', 0], ['s2', 1], ['s3', 2]].forEach(([id, k]) => pill($(id), ...st(k)));
    const wu = cl((p - 2.8) / 1.0), sIdx = Math.min(5, Math.floor(wu * 6.2));
    steps.forEach((s, k) => { s.className = 'step' + (k < sIdx ? ' done' : k === sIdx ? ' now' : ''); });
    const done = Math.floor(scan * 4.0 + .0001), checks = Math.round(scan * 1286);
    $('qacount').textContent = checks.toLocaleString(isPt ? 'pt-PT' : 'en') + (isPt ? ' verificações' : ' checks');
    const res = isPt ? [['p-green', 'Aprovado'], ['p-orange', '2 questões'], ['p-green', 'Aprovado'], ['p-orange', '1 questão']] : [['p-green', 'Pass'], ['p-orange', '2 issues'], ['p-green', 'Pass'], ['p-orange', '1 issue']];
    qarows.forEach((r, k) => { const sp = r.querySelector('.pill'); if (k < done) pill(sp, ...res[k]); else if (k === done && scan > 0) pill(sp, 'p-blue', isPt ? 'Em curso' : 'Running'); else pill(sp, 'p-mute', isPt ? 'Em fila' : 'Queued'); });
    $('wk').textContent = (isPt ? 'Semana ' : 'Week ') + Math.round(week);
    const lab = sticky.clientWidth <= 820 ? 114 : 138;
    head.style.left = `calc(${lab}px + (100% - ${lab}px) * ${(week / WEEKS).toFixed(4)})`; head.dataset.w = (isPt ? 'S' : 'W') + Math.round(week);
    $('q1').textContent = Math.round(conc).toLocaleString(isPt ? 'pt-PT' : 'en') + ' m\u00b3';
    $('q2').textContent = Math.round(glass).toLocaleString(isPt ? 'pt-PT' : 'en') + ' m\u00b2';
    $('q3').textContent = Math.round(tray).toLocaleString(isPt ? 'pt-PT' : 'en') + ' m';
    $('q4').textContent = '$' + (Math.round((conc * RATE.conc + glass * RATE.glass + tray * RATE.tray) / 1000) * 1000).toLocaleString(isPt ? 'pt-PT' : 'en');
    const cu = cl((p - 5.75) / .85), ci = Math.min(3, Math.floor(cu * 3.6));
    cdeEls.forEach((d, k) => d.classList.toggle('on', k === ci)); $('cdestate').textContent = (isPt ? ['Em curso', 'Partilhado', 'Publicado', 'Arquivado'] : ['WIP', 'Shared', 'Published', 'Archived'])[ci];
    $('serial').innerHTML = cu > .45 ? (isPt ? 'SN-pendente na entrega <span class="pill p-blue">Sinalizado</span>' : 'SN-pending at handover <span class="pill p-blue">Flagged</span>') : (isPt ? '<span class="pill p-orange">Em falta</span>' : '<span class="pill p-orange">Missing</span>');

    /* 3D-anchored tags */
    let html = '';
    const labelClearOfCopy = (x, y) => {
      if (sticky.clientWidth <= 820) return true;
      const chapter = chs[Math.min(chs.length - 1, Math.round(p))];
      const cr = chapter.getBoundingClientRect(), sr = sticky.getBoundingClientRect();
      const left = cr.left - sr.left, right = cr.right - sr.left;
      const top = cr.top - sr.top, bottom = cr.bottom - sr.top;
      return x < left - 70 || x > right + 90 || y < top - 55 || y > bottom + 55;
    };
    if (ready && cm > .05) CLASH_PTS.forEach((v, k) => {
      const w = V(...v); w.y -= [CLASH_DROP.c1, CLASH_DROP.c2, CLASH_DROP.c3][k] * mv[k];   // pins ride with their trays
      const [x, y, ok] = toScreen(w); if (ok) html += `<div class="pin ${mv[k] >= .999 ? 'green' : 'red'}" style="left:${x}px;top:${y}px;opacity:${cm}">${k + 1}</div>`;
    });
    if (ready && fed > .5) {
      const o = (fed - .5) / .5;
      for (const d of ['arch', 'str', 'ele', 'mech']) {
        if (!groups[d]) continue; const [n, f] = (isPt ? FED_LABEL_PT : FED_LABEL)[d];
        const [x, y, ok] = toScreen((cam.aspect < 1 ? V(-36, 20, 0) : V(0, 30, 0)).add(groups[d].position));
        if (ok && (d === 'arch' || labelClearOfCopy(x, y))) html += `<div class="label" style="left:${x}px;top:${y}px;opacity:${o}"><b>${n}</b><small>${f}</small></div>`;
      }
    }
    if (ready && ASSET && cobie > .3) { const [x, y, ok] = toScreen(V(...ASSET_TOP)); if (ok && labelClearOfCopy(x, y)) html += `<div class="label" style="left:${x}px;top:${y}px;opacity:${(cobie - .3) / .7}"><b>AHU-01</b><small>${isPt ? 'Componente COBie' : 'COBie component'}</small></div>`; }
    if (ready && p > .2 && p < .8) { const o = ramp(p, .2, .4) * (1 - ramp(p, .55, .7)); const [x, y, ok] = toScreen(V(0, 32, 0)); if (ok && o > 0 && labelClearOfCopy(x, y)) html += `<div class="label" style="left:${x}px;top:${y}px;opacity:${o}"><b>${isPt ? 'Modelo federado' : 'Federated model'}</b><small>KLY-FED.nwd</small></div>`; }
    tags.innerHTML = html;
  }

  /* ---------- free exploration ---------- */
  const xopen = $('xopen'), xbar = $('xbar'), xclose = $('xclose'), xreset = $('xreset');
  let explore = null, back = null;   // explore: {controls, home}; back: return transition to the story camera
  async function openExplore() {
    if (explore || !ready) return;
    try { await ensureExploreDetails(); } catch (_) { return; }
    if (disposed || explore) return;
    const controls = new OrbitControls(cam, canvas);
    controls.target.copy(lastTgt); controls.enableDamping = true; controls.dampingFactor = .08; controls.screenSpacePanning = true;
    controls.minDistance = 3; controls.maxDistance = 900; controls.maxPolarAngle = Math.PI * .495; controls.update();
    explore = {controls, home: {pos: cam.position.clone(), tgt: lastTgt.clone()}, tween: null};
    cam.clearViewOffset();
    root.classList.add('kss-explore'); xbar.hidden = false; xclose.focus({preventScroll: true});
  }
  function closeExplore() {
    if (!explore) return;
    back = {pos: cam.position.clone(), tgt: explore.controls.target.clone(), t0: performance.now()};
    explore.controls.dispose(); canvas.style.touchAction = '';
    explore = null; root.classList.remove('kss-explore'); xbar.hidden = true; xopen.focus({preventScroll: true});
  }
  function resetExplore() { if (explore) explore.tween = {pos: cam.position.clone(), tgt: explore.controls.target.clone(), t0: performance.now()}; }
  const onKey = (e) => { if (e.key === 'Escape' && explore) closeExplore(); };
  xopen.addEventListener('click', openExplore); xclose.addEventListener('click', closeExplore); xreset.addEventListener('click', resetExplore);
  addEventListener('keydown', onKey);
  function exploreFrame(now) {
    const x = explore;
    if (x.tween) {   // reset: glide back to the view the visitor started exploring from
      const e = ease((now - x.tween.t0) / 800);
      cam.position.lerpVectors(x.tween.pos, x.home.pos, e); x.controls.target.lerpVectors(x.tween.tgt, x.home.tgt, e);
      if (e >= 1) x.tween = null;
    }
    x.controls.update();
  }

  /* ---------- loop ---------- */
  let raf = 0, onScreen = true, paused = false, lastRender = 0;
  const frameInterval = 1000 / (constrainedDevice ? 30 : isPhone ? 40 : 45);
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, {rootMargin: '200px'}); io.observe(root);
  function frame(now) {
    if (paused) return;
    raf = requestAnimationFrame(frame);
    if (!onScreen || document.hidden) { last = now; return; }
    if (now - lastRender < frameInterval) return;
    lastRender = now;
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    const t = now / 1000;
    if (explore) exploreFrame(now);          // scroll-driven camera paused; the chapter state stays as it was
    else {
      cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * 5));
      if (Math.abs(target - cur) < 1e-4) cur = target;
      cameraAt(cur, t);
      if (back) {   // glide from the explored view back into the story camera
        const e = ease((now - back.t0) / 900);
        const pos = back.pos.clone().lerp(cam.position, e), tg = back.tgt.clone().lerp(lastTgt, e);
        cam.position.copy(pos); cam.lookAt(tg); cam.updateMatrixWorld();
        if (e >= 1) back = null;
      }
    }
    update(cur, t);
    if (city) city.update(t, cityDim, cam);
    renderer.render(scene, cam);
  }
  raf = requestAnimationFrame(frame);
  return {
    setProgress(p) { target = cur = p; },
    setLanguage,
    /** Testing/thumbnails: stop the loop and draw one frame at progress p. */
    renderAt(p, t = 0) { paused = true; cancelAnimationFrame(raf); target = cur = p; cameraAt(p, t); update(p, t); if (city) city.update(t, cityDim, cam); renderer.render(scene, cam); },
    /** Testing: draw one frame of chapter state p from an arbitrary camera (pos/tgt as [x, y, z]). */
    renderView(p, pos, tgt, t = 0) { paused = true; cancelAnimationFrame(raf); target = cur = p; cameraAt(p, t); cam.position.set(...pos); cam.lookAt(...tgt); cam.updateMatrixWorld(); update(p, t); if (city) city.update(t, cityDim, cam); renderer.render(scene, cam); },
    get ready() { return ready; },
    /** Testing: camera pose at progress p for a screen aspect ratio */
    poseAt(p, aspect) { const r = pose(p, aspect); return {pos: r.pos.toArray(), tgt: r.tgt.toArray(), inside: r.inside, iso: Math.max(blend(ISO_CLASH, p), blend(ISO_COBIE, p))}; },
    get obstacles() { return city ? city.obstacles : []; },
    /** Testing: triangles per drawn object (instances counted), largest first */
    budget() { const out = []; scene.traverse((o) => { if (!(o.isMesh || o.isInstancedMesh) || !o.visible) return; let v = o; while (v) { if (!v.visible) return; v = v.parent; } const g = o.geometry, tri = (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1); out.push([o.name || o.parent && o.parent.name || o.material.type, Math.round(tri), o.isInstancedMesh ? o.count : 1]); }); return out.sort((a, b) => b[1] - a[1]).slice(0, 25); },
    get stats() { const i = renderer.info; return {calls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures}; },
    destroy() {
      disposed = true;
      cancelAnimationFrame(raf); io.disconnect();
      removeEventListener('scroll', readScroll); removeEventListener('resize', resize); removeEventListener('keydown', onKey);
      if (explore) explore.controls.dispose();
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => m.dispose()); });
      if (city) city.dispose();
      pm.dispose(); renderer.dispose();
    },
  };
}

export default mountKlyronScrollStory;
