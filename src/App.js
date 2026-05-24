/* eslint-disable */
import { useState, useEffect, useRef, useMemo } from "react";

const WATER_GOAL = 8;
const SWAYD_MESSAGES=["so what are you doing? you just answered that.","that session is locked in. no one can take it from you.","another one done. keep showing up.","you came, you worked, you left better than you arrived.","the only bad workout is the one you didn't do. this wasn't that.","rest. eat. come back. repeat.","you are building something. it takes time. keep going."];
const MILESTONES=[{id:"first_workout",icon:"*",title:"FIRST REP",desc:"You showed up. That is the hardest part."},{id:"workout_5",icon:"5",title:"FIVE DOWN",desc:"5 workouts logged. You are building something real."},{id:"workout_10",icon:"10",title:"DOUBLE DIGITS",desc:"10 workouts. Most people quit at 3."},{id:"streak_7",icon:"7",title:"WEEK STRAIGHT",desc:"7 days. One full week."},{id:"pb_first",icon:"PB",title:"PERSONAL BEST",desc:"New PB. Wrote your name on a new number."}];
const UNITS = ["g","ml","oz","cup","tbsp","tsp","serving"];
const REST_PRESETS = [30,60,90,120,180];
const COLORS = ["#FF5733","#3B82F6","#10B981","#F59E0B","#A855F7","#EC4899","#14B8A6","#F97316"];
const MEALS = ["Breakfast","Lunch","Dinner","Snack","Post-Workout"];
const API_BASE = (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) || "https://swayd-backend-staging.up.railway.app";

const GOAL_LABELS = {cut:"Cut - Lose Fat",maintain:"Maintain - Stay Lean",bulk:"Bulk - Build Muscle",aggressiveBulk:"Aggressive Bulk"};
const GOAL_COLORS = {cut:"#3B82F6",maintain:"#10B981",bulk:"#FF5733",aggressiveBulk:"#F59E0B"};
const ACTIVITY_LABELS = {
  sedentary:"Sedentary (desk job, no exercise)",
  light:"Lightly Active (1-2x/week)",
  moderate:"Moderately Active (3-4x/week)",
  active:"Very Active (5-6x/week)",
  veryActive:"Athlete (2x/day or physical job)",
};

const DEFAULT_QUICK_FOODS = [
  {id:"qf1",name:"Chicken Breast",amount:100,unit:"g",cal:165,protein:31,carbs:0,fat:3.6},
  {id:"qf2",name:"White Rice",amount:100,unit:"g",cal:130,protein:2.7,carbs:28,fat:0.3},
  {id:"qf3",name:"Whole Eggs",amount:2,unit:"serving",cal:155,protein:13,carbs:1,fat:11},
  {id:"qf4",name:"Greek Yogurt",amount:150,unit:"g",cal:90,protein:15,carbs:6,fat:0.4},
  {id:"qf5",name:"Banana",amount:1,unit:"serving",cal:89,protein:1.1,carbs:23,fat:0.3},
  {id:"qf6",name:"Protein Shake",amount:1,unit:"serving",cal:160,protein:30,carbs:8,fat:3},
  {id:"qf7",name:"Almonds",amount:30,unit:"g",cal:174,protein:6,carbs:6,fat:15},
  {id:"qf8",name:"Sweet Potato",amount:150,unit:"g",cal:130,protein:3,carbs:30,fat:0.1},
];

const FOOD_LOG_DEFAULTS = [
  {id:1,name:"Oatmeal + Berries",meal:"Breakfast",cal:380,protein:12,carbs:68,fat:7},
  {id:2,name:"Grilled Chicken",meal:"Lunch",cal:310,protein:55,carbs:0,fat:6},
  {id:3,name:"Brown Rice",meal:"Lunch",cal:215,protein:5,carbs:45,fat:2},
  {id:4,name:"Protein Shake",meal:"Post-Workout",cal:160,protein:30,carbs:8,fat:3},
];

const BARCODE_DB = {
  "5000112548167":{name:"Heinz Baked Beans 200g",cal:162,protein:10,carbs:29,fat:0.6},
  "7622210951311":{name:"Oreo Cookies 44g",cal:214,protein:2.2,carbs:32,fat:9},
  "4056489098683":{name:"Whey Protein Shake 30g",cal:115,protein:22,carbs:4,fat:2},
  "5010029007548":{name:"Quaker Oats 50g",cal:190,protein:6,carbs:34,fat:4},
  "5000159407236":{name:"Tuna Spring Water 130g",cal:122,protein:28,carbs:0,fat:0.8},
  "0070177154601":{name:"Quest Protein Bar 60g",cal:190,protein:21,carbs:21,fat:7},
};
const DEMO_BARCODES = Object.keys(BARCODE_DB);

const INITIAL_WORKOUTS = [
  {id:"push",label:"PUSH",tag:"Chest, Shoulders, Tris",color:"#FF5733",exercises:[
    {id:"e1",name:"Barbell Bench Press",sets:"4",reps:"8-10",rest:"90s",tip:"Retract scapula"},
    {id:"e2",name:"Incline Dumbbell Press",sets:"3",reps:"10-12",rest:"75s",tip:"Control the eccentric"},
    {id:"e3",name:"Cable Lateral Raise",sets:"4",reps:"15",rest:"45s",tip:"Lead with elbows"},
    {id:"e4",name:"Overhead Press",sets:"3",reps:"8-10",rest:"90s",tip:"Brace core"},
    {id:"e5",name:"Tricep Rope Pushdown",sets:"3",reps:"12-15",rest:"45s",tip:"Full extension"},
  ]},
  {id:"pull",label:"PULL",tag:"Back, Biceps, Rear Delts",color:"#3B82F6",exercises:[
    {id:"e7",name:"Pull-Ups",sets:"4",reps:"6-8",rest:"90s",tip:"Full dead hang"},
    {id:"e8",name:"Barbell Row",sets:"4",reps:"8-10",rest:"90s",tip:"Hinge at hips"},
    {id:"e9",name:"Lat Pulldown",sets:"3",reps:"10-12",rest:"60s",tip:"Drive elbows down"},
    {id:"e11",name:"EZ-Bar Curl",sets:"3",reps:"10-12",rest:"60s",tip:"No swinging"},
  ]},
  {id:"legs",label:"LEGS",tag:"Quads, Hamstrings, Glutes",color:"#10B981",exercises:[
    {id:"e13",name:"Barbell Back Squat",sets:"4",reps:"6-8",rest:"120s",tip:"Break at hips first"},
    {id:"e14",name:"Romanian Deadlift",sets:"3",reps:"8-10",rest:"90s",tip:"Hinge deep"},
    {id:"e15",name:"Leg Press",sets:"3",reps:"12-15",rest:"75s",tip:"High foot placement"},
    {id:"e17",name:"Leg Curl",sets:"4",reps:"12-15",rest:"45s",tip:"Slow negative"},
  ]},
  {id:"hiit",label:"HIIT",tag:"Cardio, Full Body, Fat Burn",color:"#F59E0B",exercises:[
    {id:"e19",name:"Burpees",sets:"4",reps:"30s on/15s off",rest:"60s",tip:"Explode on the jump"},
    {id:"e21",name:"Mountain Climbers",sets:"4",reps:"30s on/15s off",rest:"60s",tip:"Hips level"},
    {id:"e22",name:"Kettlebell Swings",sets:"4",reps:"20",rest:"45s",tip:"Hip hinge power"},
  ]},
];

const EXERCISE_LIBRARY = ["Barbell Bench Press","Incline Dumbbell Press","Cable Lateral Raise","Overhead Press",
  "Tricep Rope Pushdown","Chest Dips","Pull-Ups","Barbell Row","Lat Pulldown","Cable Face Pull",
  "EZ-Bar Curl","Incline Hammer Curl","Barbell Back Squat","Romanian Deadlift","Leg Press",
  "Walking Lunges","Leg Curl","Calf Raises","Burpees","Jump Squats","Mountain Climbers",
  "Kettlebell Swings","Box Jumps","Battle Ropes","Deadlift","Push-Ups","Plank","Hip Thrust"];

const ONBOARDING_STEPS = ["welcome","name","body","activity","goal","summary"];

function uid() { return Math.random().toString(36).slice(2,9); }
const todayStr = () => new Date().toISOString().slice(0,10);

function calcMacros(p) {
  const wkg = p.weightUnit==="lbs" ? p.weight*0.453592 : Number(p.weight);
  const hcm = p.heightUnit==="ft"
    ? (Number(String(p.height).split(".")[0]||0)*30.48)+(Number(String(p.height).split(".")[1]||0)*2.54)
    : Number(p.height);
  if (!wkg||!hcm||!p.age) return {calories:2000,protein:150,carbs:200,fat:65};
  const bmr = p.gender==="male" ? 10*wkg+6.25*hcm-5*p.age+5 : 10*wkg+6.25*hcm-5*p.age-161;
  const mult = {sedentary:1.2,light:1.375,moderate:1.55,active:1.725,veryActive:1.9};
  const tdee = Math.round(bmr*(mult[p.activityLevel]||1.55));
  const adj = {cut:-500,maintain:0,bulk:300,aggressiveBulk:500};
  const cals = tdee+(adj[p.goal]||0);
  const protein = Math.round(wkg*(p.goal==="maintain"?1.8:2.0));
  const fat = Math.round(cals*0.25/9);
  const carbs = Math.round((cals-protein*4-fat*9)/4);
  return {calories:cals,protein,carbs:Math.max(carbs,50),fat};
}

function Ring({pct,color,size=80,stroke=8,label,value,unit}) {
  const r=(size-stroke)/2, circ=2*Math.PI*r, dash=circ*Math.min(pct,1);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e1e" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={dash+" "+circ} strokeLinecap="round"
          style={{transition:"stroke-dasharray .6s"}}/>
      </svg>
      <div style={{textAlign:"center",lineHeight:1.2}}>
        <div style={{fontSize:"1rem",fontWeight:700,color:"#fff",fontFamily:"'Bebas Neue',sans-serif"}}>
          {value}<span style={{fontSize:".6rem",color:"#888",marginLeft:1}}>{unit}</span>
        </div>
        <div style={{fontSize:".6rem",color:"#666",letterSpacing:".1em",textTransform:"uppercase"}}>{label}</div>
      </div>
    </div>
  );
}

function MacroBar({label,value,goal,color}) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:".68rem",color:"#aaa",letterSpacing:".1em",textTransform:"uppercase"}}>{label}</span>
        <span style={{fontSize:".68rem",color:"#fff"}}>{value}<span style={{color:"#555"}}>/{goal}g</span></span>
      </div>
      <div style={{height:5,background:"#1a1a1a",borderRadius:99}}>
        <div style={{height:5,width:Math.min(value/goal,1)*100+"%",background:color,borderRadius:99,transition:"width .5s"}}/>
      </div>
    </div>
  );
}

function SparkLine({data}) {
  if(!data||data.length<2) return null;
  const mn=Math.min(...data), mx=Math.max(...data), range=mx-mn||1;
  const W=100, H=24;
  const pts=data.map((v,i)=>((i/(data.length-1))*W)+","+((H-((v-mn)/range)*H))).join(" ");
  return (
    <svg viewBox={"0 0 "+W+" "+H} preserveAspectRatio="none" width="100%" height="28" style={{marginTop:6,display:"block"}}>
      <polyline points={pts} fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function OnboardingFlow({onComplete}) {
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({name:"",gender:"male",age:"",weight:"",weightUnit:"kg",height:"",heightUnit:"cm",activityLevel:"moderate",goal:"maintain"});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const next=()=>setStep(s=>Math.min(s+1,ONBOARDING_STEPS.length-1));
  const back=()=>setStep(s=>Math.max(s-1,0));
  const macros=calcMacros(form);
  const sn=ONBOARDING_STEPS[step];
  return (
    <div className="onboard-wrap">
      {step>0&&step<ONBOARDING_STEPS.length-1&&(
        <div className="ob-progress">
          {ONBOARDING_STEPS.slice(1,-1).map((_,i)=>(
            <div key={i} className={"ob-dot"+(i<step?" ob-dot-done":i===step-1?" ob-dot-active":"")}/>
          ))}
        </div>
      )}
      {sn==="welcome"&&(
        <div className="ob-screen fade-in">
          <div className="ob-logo"><span style={{color:"#FF5733"}}>S</span>wayd</div>
          <div className="ob-welcome-tag">so what are you doing</div>
          <div className="ob-headline">YOUR FITNESS.<br/>YOUR WAY.</div>
          <div className="ob-body">Set up your profile and we will calculate your personalised macro targets.</div>
          <div style={{marginTop:"auto",paddingTop:32}}><button className="ob-btn-primary" onClick={next}>GET STARTED</button></div>
        </div>
      )}
      {sn==="name"&&(
        <div className="ob-screen fade-in">
          <div className="ob-step-label">STEP 1 OF 4</div>
          <div className="ob-step-title">What should we call you?</div>
          <input className="ob-input" placeholder="Your first name" value={form.name} onChange={e=>set("name",e.target.value)}/>
          <div className="ob-step-title" style={{marginTop:28}}>Biological sex</div>
          <div className="ob-option-row">
            {["male","female"].map(g=>(
              <button key={g} className={"ob-option-btn"+(form.gender===g?" ob-option-active":"")} onClick={()=>set("gender",g)}>
                <span>{g==="male"?"M":"F"}</span><span style={{textTransform:"capitalize"}}>{g}</span>
              </button>
            ))}
          </div>
          <div className="ob-nav-row">
            <button className="ob-btn-ghost" onClick={back}>BACK</button>
            <button className="ob-btn-primary" style={{flex:2}} onClick={next} disabled={!form.name.trim()}>NEXT</button>
          </div>
        </div>
      )}
      {sn==="body"&&(
        <div className="ob-screen fade-in">
          <div className="ob-step-label">STEP 2 OF 4</div>
          <div className="ob-step-title">Body stats</div>
          <div className="ob-field">
            <div className="ob-field-label">AGE</div>
            <input className="ob-input" type="number" placeholder="e.g. 28" value={form.age} onChange={e=>set("age",e.target.value)}/>
          </div>
          <div className="ob-field">
            <div className="ob-field-label">WEIGHT</div>
            <div style={{display:"flex",gap:8}}>
              <input className="ob-input" type="number" value={form.weight} onChange={e=>set("weight",e.target.value)} style={{flex:1}}/>
              <div className="ob-unit-toggle">{["kg","lbs"].map(u=><button key={u} className={"ob-unit-btn"+(form.weightUnit===u?" ob-unit-active":"")} onClick={()=>set("weightUnit",u)}>{u}</button>)}</div>
            </div>
          </div>
          <div className="ob-field">
            <div className="ob-field-label">HEIGHT</div>
            <div style={{display:"flex",gap:8}}>
              <input className="ob-input" type="number" value={form.height} onChange={e=>set("height",e.target.value)} style={{flex:1}}/>
              <div className="ob-unit-toggle">{["cm","ft"].map(u=><button key={u} className={"ob-unit-btn"+(form.heightUnit===u?" ob-unit-active":"")} onClick={()=>set("heightUnit",u)}>{u}</button>)}</div>
            </div>
          </div>
          <div className="ob-nav-row">
            <button className="ob-btn-ghost" onClick={back}>BACK</button>
            <button className="ob-btn-primary" style={{flex:2}} onClick={next} disabled={!form.age||!form.weight||!form.height}>NEXT</button>
          </div>
        </div>
      )}
      {sn==="activity"&&(
        <div className="ob-screen fade-in">
          <div className="ob-step-label">STEP 3 OF 4</div>
          <div className="ob-step-title">How active are you?</div>
          <div className="ob-list">
            {Object.entries(ACTIVITY_LABELS).map(([k,v])=>(
              <button key={k} className={"ob-list-item"+(form.activityLevel===k?" ob-list-active":"")} onClick={()=>set("activityLevel",k)}>
                <span style={{flex:1,textAlign:"left",fontSize:".78rem"}}>{v}</span>
                {form.activityLevel===k&&<span style={{color:"#FF5733"}}>v</span>}
              </button>
            ))}
          </div>
          <div className="ob-nav-row">
            <button className="ob-btn-ghost" onClick={back}>BACK</button>
            <button className="ob-btn-primary" style={{flex:2}} onClick={next}>NEXT</button>
          </div>
        </div>
      )}
      {sn==="goal"&&(
        <div className="ob-screen fade-in">
          <div className="ob-step-label">STEP 4 OF 4</div>
          <div className="ob-step-title">What is your goal?</div>
          <div className="ob-goal-grid">
            {Object.entries(GOAL_LABELS).map(([k,v])=>(
              <button key={k} className={"ob-goal-card"+(form.goal===k?" ob-goal-active":"")} style={{"--gc":GOAL_COLORS[k]}} onClick={()=>set("goal",k)}>
                <div className="ob-goal-label">{v}</div>
              </button>
            ))}
          </div>
          <div className="ob-nav-row">
            <button className="ob-btn-ghost" onClick={back}>BACK</button>
            <button className="ob-btn-primary" style={{flex:2}} onClick={next}>CALCULATE</button>
          </div>
        </div>
      )}
      {sn==="summary"&&(
        <div className="ob-screen fade-in">
          <div className="ob-step-label">YOUR PLAN</div>
          <div className="ob-step-title">{form.name?"Looking good, "+form.name+".":"Looking good."}</div>
          <div className="ob-goal-pill" style={{background:GOAL_COLORS[form.goal]+"22",borderColor:GOAL_COLORS[form.goal]+"66",color:GOAL_COLORS[form.goal]}}>{GOAL_LABELS[form.goal]}</div>
          <div className="ob-macro-grid">
            {[{label:"Calories",value:macros.calories,unit:"kcal",color:"#FF5733"},{label:"Protein",value:macros.protein,unit:"g",color:"#3B82F6"},{label:"Carbs",value:macros.carbs,unit:"g",color:"#F59E0B"},{label:"Fat",value:macros.fat,unit:"g",color:"#10B981"}].map(m=>(
              <div key={m.label} className="ob-macro-card" style={{"--mc":m.color}}>
                <div className="ob-macro-val">{m.value}<span className="ob-macro-unit">{m.unit}</span></div>
                <div className="ob-macro-label">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="ob-calc-note">Calculated using the Mifflin-St Jeor formula.</div>
          <button className="ob-btn-primary" style={{marginTop:"auto"}} onClick={()=>onComplete(form,macros)}>LETS GO</button>
        </div>
      )}
    </div>
  );
}

function ProfilePage({profile,macroGoals,onUpdate,onBack}) {
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState(profile);
  const setF=(k,v)=>setForm(p=>({...p,[k]:v}));
  const preview=calcMacros(form);
  const save=()=>{onUpdate(form,calcMacros(form));setEditing(false);};
  return (
    <div className="page fade-in">
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button className="ghost-btn" onClick={onBack} style={{fontSize:"1.2rem",color:"#aaa"}}>back</button>
        <div className="page-title" style={{marginBottom:0}}>MY PROFILE</div>
        <button className="add-routine-btn" style={{marginLeft:"auto"}} onClick={()=>editing?save():setEditing(true)}>{editing?"SAVE":"EDIT"}</button>
      </div>
      <div className="card" style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
        <div className="profile-avatar">{profile.name?profile.name[0].toUpperCase():"?"}</div>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",color:"#fff"}}>{profile.name||"Athlete"}</div>
          <div className="ob-goal-pill" style={{display:"inline-flex",marginTop:4,background:GOAL_COLORS[profile.goal]+"22",borderColor:GOAL_COLORS[profile.goal]+"55",color:GOAL_COLORS[profile.goal]}}>{GOAL_LABELS[profile.goal]}</div>
        </div>
      </div>
      <div className="section-label">DAILY TARGETS</div>
      <div className="ob-macro-grid" style={{marginBottom:16}}>
        {[{label:"Calories",value:macroGoals.calories,unit:"kcal",color:"#FF5733"},{label:"Protein",value:macroGoals.protein,unit:"g",color:"#3B82F6"},{label:"Carbs",value:macroGoals.carbs,unit:"g",color:"#F59E0B"},{label:"Fat",value:macroGoals.fat,unit:"g",color:"#10B981"}].map(m=>(
          <div key={m.label} className="ob-macro-card" style={{"--mc":m.color}}>
            <div className="ob-macro-val">{m.value}<span className="ob-macro-unit">{m.unit}</span></div>
            <div className="ob-macro-label">{m.label}</div>
          </div>
        ))}
      </div>
      <div className="section-label">STATS</div>
      <div className="card" style={{marginBottom:16}}>
        {[{label:"Age",key:"age",suffix:" yrs"},{label:"Weight",key:"weight",suffix:" "+(profile.weightUnit||"kg")},{label:"Height",key:"height",suffix:" "+(profile.heightUnit||"cm")}].map(f=>(
          <div key={f.key} className="profile-stat-row">
            <span className="profile-stat-label">{f.label}</span>
            {editing?<input className="ob-input" style={{width:100,padding:"5px 10px",textAlign:"right"}} type="number" value={form[f.key]} onChange={e=>setF(f.key,e.target.value)}/>:<span className="profile-stat-val">{profile[f.key]}{f.suffix}</span>}
          </div>
        ))}
      </div>
      {editing&&(
        <div className="card" style={{marginBottom:12,borderColor:"#FF573322"}}>
          <div className="section-label" style={{marginBottom:10}}>RECALCULATED</div>
          <div className="ob-macro-grid">
            {[{label:"Calories",value:preview.calories,unit:"kcal",color:"#FF5733"},{label:"Protein",value:preview.protein,unit:"g",color:"#3B82F6"},{label:"Carbs",value:preview.carbs,unit:"g",color:"#F59E0B"},{label:"Fat",value:preview.fat,unit:"g",color:"#10B981"}].map(m=>(
              <div key={m.label} className="ob-macro-card" style={{"--mc":m.color}}>
                <div className="ob-macro-val">{m.value}<span className="ob-macro-unit">{m.unit}</span></div>
                <div className="ob-macro-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {editing&&(
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button className="ghost-btn" style={{flex:1,border:"1px solid #2a2a2a",borderRadius:8,padding:"11px 0",fontSize:".7rem"}} onClick={()=>{setForm(profile);setEditing(false);}}>CANCEL</button>
          <button className="create-btn" style={{flex:2}} onClick={save}>SAVE CHANGES</button>
        </div>
      )}
    </div>
  );
}

function MacroDonut({protein,carbs,fat,size=120}) {
  const total=protein*4+carbs*4+fat*9||1;
  const pPct=(protein*4/total),cPct=(carbs*4/total),fPct=(fat*9/total);
  const r=46,circ=2*Math.PI*r;
  const pDash=circ*pPct,cDash=circ*cPct,fDash=circ*fPct;
  return (
    <div style={{display:"flex",alignItems:"center",gap:16}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e1e" strokeWidth={12}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#3B82F6" strokeWidth={12} strokeDasharray={pDash+" "+(circ-pDash)} strokeDashoffset={0} strokeLinecap="butt"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F59E0B" strokeWidth={12} strokeDasharray={cDash+" "+(circ-cDash)} strokeDashoffset={-pDash} strokeLinecap="butt"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#10B981" strokeWidth={12} strokeDasharray={fDash+" "+(circ-fDash)} strokeDashoffset={-(pDash+cDash)} strokeLinecap="butt"/>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {[{label:"Protein",val:protein,color:"#3B82F6",pct:Math.round(pPct*100)},{label:"Carbs",val:carbs,color:"#F59E0B",pct:Math.round(cPct*100)},{label:"Fat",val:fat,color:"#10B981",pct:Math.round(fPct*100)}].map(m=>(
          <div key={m.label} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:m.color,flexShrink:0}}/>
            <span style={{fontSize:".65rem",color:"#aaa",minWidth:48}}>{m.label}</span>
            <span style={{fontSize:".7rem",color:"#fff",fontWeight:600}}>{m.val}g</span>
            <span style={{fontSize:".6rem",color:"#555"}}>{m.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SwaydApp() {
  const [tab,setTab]=useState("home");
  const [workouts,setWorkouts]=useState(INITIAL_WORKOUTS);
  const [activeWorkout,setActiveWorkout]=useState(null);
  const [completedSets,setCompletedSets]=useState({});
  const [timerActive,setTimerActive]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [workoutDone,setWorkoutDone]=useState([]);
  const [addingFood,setAddingFood]=useState(false);
  const [selectedMeal,setSelectedMeal]=useState("Breakfast");
  const [videoModal,setVideoModal]=useState(null);
  const [editingWorkout,setEditingWorkout]=useState(null);
  const [showNewWorkout,setShowNewWorkout]=useState(false);
  const [newWkName,setNewWkName]=useState("");
  const [newWkTag,setNewWkTag]=useState("");
  const [newWkColor,setNewWkColor]=useState(COLORS[0]);
  const [addExMode,setAddExMode]=useState(null);
  const [exSearch,setExSearch]=useState("");
  const [customEx,setCustomEx]=useState({name:"",sets:"3",reps:"10",rest:"60s",tip:""});
  const [customMode,setCustomMode]=useState(false);
  const [foodTab,setFoodTab]=useState("quick");
  const [showCustomFoodForm,setShowCustomFoodForm]=useState(false);
  const [newFood,setNewFood]=useState({name:"",cal:"",protein:"",carbs:"",fat:""});
  const [scanResult,setScanResult]=useState(null);
  const [scanInput,setScanInput]=useState("");
  const [scanAnimating,setScanAnimating]=useState(false);
  const [scanLoading,setScanLoading]=useState(false);
  const [foodSearch,setFoodSearch]=useState("");
  const [foodSearchResults,setFoodSearchResults]=useState([]);
  const [foodSearchLoading,setFoodSearchLoading]=useState(false);
  const [foodSearchError,setFoodSearchError]=useState(null);
  const [quickFoods,setQuickFoods]=useState(()=>{try{const s=localStorage.getItem("swayd_quickfoods");return s?JSON.parse(s):DEFAULT_QUICK_FOODS;}catch{return DEFAULT_QUICK_FOODS;}});
  const [editingFoodLog,setEditingFoodLog]=useState(null);
  const [editingFood,setEditingFood]=useState({});
  const [showQuickFoodEditor,setShowQuickFoodEditor]=useState(false);
  const [stepLog,setStepLog]=useState(()=>{try{const s=localStorage.getItem("swayd_steps");return s?JSON.parse(s):{};} catch{return {};}});
  const [stepGoal,setStepGoal]=useState(()=>{try{const s=localStorage.getItem("swayd_stepgoal");return s?Number(s):10000;} catch{return 10000;}});
  const [stepInput,setStepInput]=useState("");
  const [showStepInput,setShowStepInput]=useState(false);
  const [editingStepGoal,setEditingStepGoal]=useState(false);
  const [stepGoalInput,setStepGoalInput]=useState("");
  const [swipedWorkout,setSwipedWorkout]=useState(null);
  const [editingRestEx,setEditingRestEx]=useState(null);
  const [restTimer,setRestTimer]=useState(null);
  const [setWeights,setSetWeights]=useState({});
  const [editingWeight,setEditingWeight]=useState(null);
  const [personalBests,setPersonalBests]=useState(()=>{try{const s=localStorage.getItem("swayd_pbs");return s?JSON.parse(s):{};} catch{return {};}});
  const [workoutHistory,setWorkoutHistory]=useState(()=>{try{const s=localStorage.getItem("swayd_history");return s?JSON.parse(s):[];} catch{return [];}});
  const [completionData,setCompletionData]=useState(null);
  const [earnedMilestones,setEarnedMilestones]=useState(()=>{try{const s=localStorage.getItem("swayd_milestones");return s?JSON.parse(s):[];}catch{return [];}});
  const [newMilestone,setNewMilestone]=useState(null);
  const [favourites,setFavourites]=useState(()=>{try{const s=localStorage.getItem("swayd_favs");return s?JSON.parse(s):[];}catch{return [];}});
  const [showWeeklySummary,setShowWeeklySummary]=useState(false);
  const [sessionRestOverrides,setSessionRestOverrides]=useState({});
  const [waterLog,setWaterLog]=useState(()=>{try{const s=localStorage.getItem("swayd_water");return s?JSON.parse(s):{};} catch{return {};}});
  const [weightLog,setWeightLog]=useState(()=>{try{const s=localStorage.getItem("swayd_weightlog");return s?JSON.parse(s):[];} catch{return [];}});
  const [weightInput,setWeightInput]=useState("");
  const [showWeightInput,setShowWeightInput]=useState(false);
  const [aiNudge,setAiNudge]=useState(()=>{try{const s=localStorage.getItem("swayd_nudge");return s?JSON.parse(s):null;}catch{return null;}});
  const [nudgeLoading,setNudgeLoading]=useState(false);
  const [profile,setProfile]=useState(()=>{try{const s=localStorage.getItem("swayd_profile");return s?JSON.parse(s):null;} catch{return null;}});
  const [macroGoals,setMacroGoals]=useState(()=>{try{const s=localStorage.getItem("swayd_macros");return s?JSON.parse(s):{calories:2400,protein:180,carbs:240,fat:75};}catch{return {calories:2400,protein:180,carbs:240,fat:75};}});
  const [showProfile,setShowProfile]=useState(false);
  const [customFoods,setCustomFoods]=useState(()=>{try{const s=localStorage.getItem("swayd_custom_foods");return s?JSON.parse(s):[];}catch{return [];}});
  const [diary,setDiary]=useState(()=>{try{const s=localStorage.getItem("swayd_diary");if(s)return JSON.parse(s);return {[todayStr()]:FOOD_LOG_DEFAULTS};}catch{return {[todayStr()]:FOOD_LOG_DEFAULTS};}});
  const [selectedDate,setSelectedDate]=useState(todayStr());
  const intervalRef=useRef(null);
  const restRef=useRef(null);
  const swipeStartX=useRef(null);

  useEffect(()=>{try{localStorage.setItem("swayd_quickfoods",JSON.stringify(quickFoods));}catch{};},[quickFoods]);
  useEffect(()=>{try{localStorage.setItem("swayd_steps",JSON.stringify(stepLog));}catch{};},[stepLog]);
  useEffect(()=>{try{localStorage.setItem("swayd_stepgoal",String(stepGoal));}catch{};},[stepGoal]);
  useEffect(()=>{try{localStorage.setItem("swayd_pbs",JSON.stringify(personalBests));}catch{};},[personalBests]);
  useEffect(()=>{try{localStorage.setItem("swayd_history",JSON.stringify(workoutHistory));}catch{};},[workoutHistory]);
  useEffect(()=>{try{localStorage.setItem("swayd_milestones",JSON.stringify(earnedMilestones));}catch{};},[earnedMilestones]);
  useEffect(()=>{try{localStorage.setItem("swayd_favs",JSON.stringify(favourites));}catch{};},[favourites]);
  useEffect(()=>{try{localStorage.setItem("swayd_water",JSON.stringify(waterLog));}catch{};},[waterLog]);
  useEffect(()=>{try{localStorage.setItem("swayd_weightlog",JSON.stringify(weightLog));}catch{};},[weightLog]);
  useEffect(()=>{try{localStorage.setItem("swayd_custom_foods",JSON.stringify(customFoods));}catch{};},[customFoods]);
  useEffect(()=>{try{localStorage.setItem("swayd_diary",JSON.stringify(diary));}catch{};},[diary]);
  useEffect(()=>{if(timerActive){intervalRef.current=setInterval(()=>setElapsed(e=>e+1),1000);}else clearInterval(intervalRef.current);return()=>clearInterval(intervalRef.current);},[timerActive]);
  useEffect(()=>{
    if(!restTimer){clearInterval(restRef.current);return;}
    if(restTimer.remaining>0){restRef.current=setInterval(()=>setRestTimer(r=>r?{...r,remaining:r.remaining-1}:null),1000);}
    else{clearInterval(restRef.current);setTimeout(()=>setRestTimer(null),900);}
    return()=>clearInterval(restRef.current);
  },[restTimer]);
  useEffect(()=>{
    if(foodTab!=="search"||!foodSearch.trim()){return;}
    const t=setTimeout(()=>searchFood(foodSearch),520);
    return()=>clearTimeout(t);
  },[foodSearch,foodTab]);
  useEffect(()=>{
    if(!profile||!profile.name) return;
    if(!aiNudge||aiNudge.date!==todayStr()) fetchNudge();
  },[profile]);

  const saveProfile=(prof,macros)=>{setProfile(prof);setMacroGoals(macros);try{localStorage.setItem("swayd_profile",JSON.stringify(prof));localStorage.setItem("swayd_macros",JSON.stringify(macros));}catch{}};

  const foodLog=diary[selectedDate]||[];
  const setFoodLog=(updater)=>setDiary(prev=>{const cur=prev[selectedDate]||[];const next=typeof updater==="function"?updater(cur):updater;return {...prev,[selectedDate]:next};});

  const streak=useMemo(()=>{let n=0;const d=new Date();while(true){const k=d.toISOString().slice(0,10);if(diary[k]&&diary[k].length>0){n++;d.setDate(d.getDate()-1);}else break;}return n;},[diary]);
  const weekDays=useMemo(()=>Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const k=d.toISOString().slice(0,10);const entries=diary[k]||[];const cal=entries.reduce((a,f)=>a+f.cal,0);return {key:k,label:["SUN","MON","TUE","WED","THU","FRI","SAT"][d.getDay()],date:d.getDate(),cal,hit:cal>=macroGoals.calories*0.85&&cal<=macroGoals.calories*1.15,logged:entries.length>0,isToday:k===todayStr()};}), [diary,macroGoals]);
  const totals=useMemo(()=>foodLog.reduce((a,f)=>({cal:a.cal+f.cal,protein:a.protein+f.protein,carbs:a.carbs+f.carbs,fat:a.fat+f.fat}),{cal:0,protein:0,carbs:0,fat:0}),[foodLog]);
  const todayWater=waterLog[todayStr()]||0;
  const todaySteps=stepLog[todayStr()]||0;
  const latestWeight=weightLog.length>0?weightLog[weightLog.length-1].weight:null;
  const weightTrend=weightLog.length>1?weightLog[weightLog.length-1].weight-weightLog[weightLog.length-2].weight:null;
  const todayBurn=useMemo(()=>workoutHistory.filter(h=>h.date===todayStr()).reduce((tot,h)=>{const mins=Math.round(h.duration/60);const isHIIT=(h.workoutTag||"").toLowerCase().includes("cardio")||(h.workoutTag||"").toLowerCase().includes("hiit");return tot+Math.round(mins*(isHIIT?10:7));},0),[workoutHistory]);
  const netCalories=totals.cal-todayBurn;
  const isToday=selectedDate===todayStr();

  const getLastSession=useMemo(()=>{const map={};for(const h of workoutHistory){for(const ex of (h.exercises||[])){if(!map[ex.name]){const doneSets=(ex.sets||[]).filter(s=>s.done&&s.weight);if(doneSets.length>0){const best=Math.max(...doneSets.map(s=>parseFloat(s.weight)||0));map[ex.name]={weight:best,date:h.date};}}}}return map;},[workoutHistory]);
  const getSuggestion=(exName)=>{const last=getLastSession[exName];if(!last||!last.weight)return null;const isLower=["Barbell Back Squat","Romanian Deadlift","Leg Press","Deadlift","Hip Thrust"].includes(exName);return {lastWeight:last.weight,suggested:last.weight+(isLower?5:2.5)};};

  const goToPrevDay=()=>{const d=new Date(selectedDate);d.setDate(d.getDate()-1);setSelectedDate(d.toISOString().slice(0,10));setAddingFood(false);};
  const goToNextDay=()=>{const d=new Date(selectedDate);d.setDate(d.getDate()+1);const n=d.toISOString().slice(0,10);if(n<=todayStr()){setSelectedDate(n);setAddingFood(false);}};
  const friendlyDate=ds=>{if(ds===todayStr())return "TODAY";const d=new Date(ds+"T12:00:00"),y=new Date();y.setDate(y.getDate()-1);if(ds===y.toISOString().slice(0,10))return "YESTERDAY";return d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"}).toUpperCase();};
  const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");

  const addWater=()=>setWaterLog(p=>({...p,[todayStr()]:Math.min((p[todayStr()]||0)+1,12)}));
  const removeWater=()=>setWaterLog(p=>({...p,[todayStr()]:Math.max((p[todayStr()]||0)-1,0)}));
  const logSteps=()=>{const v=parseInt(stepInput);if(!v||v<0)return;setStepLog(p=>({...p,[todayStr()]:v}));setStepInput("");setShowStepInput(false);};
  const saveStepGoal=()=>{const v=parseInt(stepGoalInput);if(!v||v<0)return;setStepGoal(v);setStepGoalInput("");setEditingStepGoal(false);};
  const logBodyWeight=()=>{const v=parseFloat(weightInput);if(!v||v<20)return;setWeightLog(p=>{const f=p.filter(e=>e.date!==todayStr());return [...f,{date:todayStr(),weight:v}].sort((a,b)=>a.date.localeCompare(b.date)).slice(-60);});setWeightInput("");setShowWeightInput(false);};

  const startWorkout=w=>{setActiveWorkout(w);setCompletedSets({});setElapsed(0);setTimerActive(true);setTab("workout");};
  const toggleSetP3=(ei,si,ex)=>{const k=ei+"-"+si;const nowDone=!completedSets[k];setCompletedSets(p=>({...p,[k]:nowDone}));if(nowDone){const secs=parseInt(getExRest(ex.id,ex.rest))||60;setRestTimer({remaining:secs,total:secs,exName:ex.name});const w=parseFloat(setWeights[k]||0);if(w>0)setPersonalBests(p=>{const prev=p[ex.name]||0;return w>prev?{...p,[ex.name]:w}:p;});}else{setRestTimer(null);}};
  const getExRest=(exId,def)=>sessionRestOverrides[exId]||def;
  const setSessionRest=(exId,rest)=>setSessionRestOverrides(p=>({...p,[exId]:rest}));
  const toggleFav=(id)=>setFavourites(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const sortedWorkouts=useMemo(()=>[...workouts].sort((a,b)=>(favourites.includes(b.id)?1:0)-(favourites.includes(a.id)?1:0)),[workouts,favourites]);
  const weeklySummary=useMemo(()=>{const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d.toISOString().slice(0,10);});const avgCal=Math.round(days.reduce((a,k)=>{const e=diary[k]||[];return a+e.reduce((b,f)=>b+f.cal,0);},0)/7);const avgProt=Math.round(days.reduce((a,k)=>{const e=diary[k]||[];return a+e.reduce((b,f)=>b+f.protein,0);},0)/7);const daysLogged=days.filter(k=>(diary[k]||[]).length>0).length;const workouts7=workoutHistory.filter(h=>days.includes(h.date)).length;const avgWater=Math.round(days.reduce((a,k)=>a+(waterLog[k]||0),0)/7*10)/10;const calGoalDays=days.filter(k=>{const cal=(diary[k]||[]).reduce((a,f)=>a+f.cal,0);return cal>=macroGoals.calories*0.85&&cal<=macroGoals.calories*1.15;}).length;return {avgCal,avgProt,daysLogged,workouts7,avgWater,calGoalDays};},[diary,workoutHistory,waterLog,macroGoals]);
  const checkMilestones=(hist)=>{const toEarn=[];if(hist.length>=1&&!earnedMilestones.includes("first_workout"))toEarn.push("first_workout");if(hist.length>=5&&!earnedMilestones.includes("workout_5"))toEarn.push("workout_5");if(hist.length>=10&&!earnedMilestones.includes("workout_10"))toEarn.push("workout_10");if(Object.keys(personalBests).length>=1&&!earnedMilestones.includes("pb_first"))toEarn.push("pb_first");if(toEarn.length>0){setEarnedMilestones(p=>[...p,...toEarn]);setNewMilestone(MILESTONES.find(m=>m.id===toEarn[0]));setTimeout(()=>setNewMilestone(null),4000);}};
  const finishWorkoutP3=()=>{const done=Object.values(completedSets).filter(Boolean).length;const totalSets=activeWorkout.exercises.reduce((a,e)=>a+(parseInt(e.sets)||3),0);const volume=activeWorkout.exercises.reduce((tot,ex,ei)=>{let v=0;for(let si=0;si<(parseInt(ex.sets)||3);si++){const k=ei+"-"+si;if(completedSets[k])v+=(parseFloat(setWeights[k]||0))*(parseInt(ex.reps)||10);}return tot+v;},0);const entry={id:uid(),workoutId:activeWorkout.id,workoutLabel:activeWorkout.label,workoutColor:activeWorkout.color,workoutTag:activeWorkout.tag,date:todayStr(),duration:elapsed,setsCompleted:done,totalSets,volume:Math.round(volume),exercises:activeWorkout.exercises.map((ex,ei)=>({name:ex.name,sets:Array.from({length:parseInt(ex.sets)||3},(_,si)=>({done:!!completedSets[ei+"-"+si],weight:setWeights[ei+"-"+si]||""}))}))}; const newHistory=[entry,...workoutHistory];setWorkoutHistory(newHistory);setTimerActive(false);setWorkoutDone(p=>[...p,activeWorkout.id]);setCompletionData({...entry,message:SWAYD_MESSAGES[Math.floor(Math.random()*SWAYD_MESSAGES.length)]});checkMilestones(newHistory);setRestTimer(null);setSetWeights({});setSessionRestOverrides({});};

  const addQuickFood=f=>{setFoodLog(p=>[...p,{id:Date.now(),...f,meal:selectedMeal}]);setAddingFood(false);};
  const removeFood=id=>setFoodLog(p=>p.filter(f=>f.id!==id));
  const copyPreviousDay=()=>{const prev=new Date(selectedDate);prev.setDate(prev.getDate()-1);const pk=prev.toISOString().slice(0,10);const pm=diary[pk]||[];if(pm.length>0)setFoodLog(p=>[...p,...pm.map(f=>({...f,id:Date.now()+Math.random()}))]);};
  const saveCustomFood=()=>{if(!newFood.name.trim()||!newFood.cal)return;setCustomFoods(p=>[...p,{id:uid(),name:newFood.name,cal:Number(newFood.cal),protein:Number(newFood.protein)||0,carbs:Number(newFood.carbs)||0,fat:Number(newFood.fat)||0}]);setNewFood({name:"",cal:"",protein:"",carbs:"",fat:""});setShowCustomFoodForm(false);};

  const deleteWorkout=id=>setWorkouts(p=>p.filter(w=>w.id!==id));
  const createWorkout=()=>{if(!newWkName.trim())return;setWorkouts(p=>[...p,{id:uid(),label:newWkName.toUpperCase(),tag:newWkTag||"Custom Workout",color:newWkColor,exercises:[]}]);setNewWkName("");setNewWkTag("");setNewWkColor(COLORS[0]);setShowNewWorkout(false);};
  const removeExercise=(wid,eid)=>setWorkouts(p=>p.map(w=>w.id===wid?{...w,exercises:w.exercises.filter(e=>e.id!==eid)}:w));
  const addExerciseFromLib=(wid,name)=>{setWorkouts(p=>p.map(w=>w.id===wid?{...w,exercises:[...w.exercises,{id:uid(),name,sets:"3",reps:"10-12",rest:"60s",tip:"Focus on form"}]}:w));setAddExMode(null);setExSearch("");};
  const addCustomExercise=wid=>{if(!customEx.name.trim())return;setWorkouts(p=>p.map(w=>w.id===wid?{...w,exercises:[...w.exercises,{id:uid(),...customEx}]}:w));setCustomEx({name:"",sets:"3",reps:"10",rest:"60s",tip:""});setCustomMode(false);setAddExMode(null);};
  const updateExRest=(wid,eid,rest)=>{setWorkouts(p=>p.map(w=>w.id===wid?{...w,exercises:w.exercises.map(e=>e.id===eid?{...e,rest}:e)}:w));setEditingRestEx(null);};

  const simulateScan=()=>{
    setScanAnimating(true);setScanResult(null);
    setTimeout(()=>{
      setScanAnimating(false);
      const t=scanInput.trim();
      if(t&&BARCODE_DB[t]){setScanResult({found:true,food:BARCODE_DB[t],barcode:t});}
      else if(t){setScanResult({found:false,barcode:t});}
      else{const bc=DEMO_BARCODES[Math.floor(Math.random()*DEMO_BARCODES.length)];setScanResult({found:true,food:BARCODE_DB[bc],barcode:bc});}
    },1200+Math.random()*400);
  };
  const addScannedFood=()=>{if(!scanResult?.found)return;setFoodLog(p=>[...p,{id:Date.now(),...scanResult.food,meal:selectedMeal}]);setScanResult(null);setScanInput("");setAddingFood(false);};

  const searchFood=async(q)=>{
    if(!q.trim()){setFoodSearchResults([]);return;}
    setFoodSearchLoading(true);setFoodSearchError(null);setFoodSearchResults([]);
    try{
      const res=await fetch(API_BASE+"/api/food/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q})});
      const results=await res.json();
      if(!Array.isArray(results)||results.length===0){setFoodSearchError("No results found.");return;}
      setFoodSearchResults(results);
    }catch{setFoodSearchError("Search failed. Try again.");}
    finally{setFoodSearchLoading(false);}
  };

  const fetchNudge=async()=>{
    setNudgeLoading(true);
    try{
      const avgCal=Object.values(diary).slice(-7).reduce((a,v)=>a+v.reduce((b,f)=>b+f.cal,0),0)/Math.max(Object.keys(diary).length,1);
      const avgProt=Object.values(diary).slice(-7).reduce((a,v)=>a+v.reduce((b,f)=>b+f.protein,0),0)/Math.max(Object.keys(diary).length,1);
      const w7=workoutHistory.filter(h=>{const d=new Date(h.date);const now=new Date();return (now-d)/(86400000)<=7;}).length;
      const trendStr=weightTrend!==null?(weightTrend>0?"+"+weightTrend.toFixed(1)+"kg":weightTrend.toFixed(1)+"kg"):"no data";
      const ctx="User: "+(profile?.name||"Athlete")+", goal: "+(profile?.goal||"maintain")+", target: "+macroGoals.calories+"kcal "+macroGoals.protein+"g protein. "+
        "Last 7 days avg: "+Math.round(avgCal)+"kcal/day, "+Math.round(avgProt)+"g protein/day. "+
        "Workouts last 7 days: "+w7+". Streak: "+streak+" days. Weight trend: "+trendStr+". Water today: "+todayWater+"/"+WATER_GOAL+" glasses.";
      const res=await fetch(API_BASE+"/api/nudge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({context:ctx})});
      const data=await res.json();
      const nudge={text:data.text||"",date:todayStr()};
      setAiNudge(nudge);
      try{localStorage.setItem("swayd_nudge",JSON.stringify(nudge));}catch{}
    }catch{setAiNudge({text:"Could not load coaching insight.",date:todayStr(),error:true});}
    finally{setNudgeLoading(false);}
  };

  const filteredLib=EXERCISE_LIBRARY.filter(n=>n.toLowerCase().includes(exSearch.toLowerCase()));
  const navItems=[{id:"home",label:"HOME"},{id:"macros",label:"MACROS"},{id:"routines",label:"TRAIN"},{id:"gear",label:"SWAYD"}];

  return (
    <>
      <style>{CSS}</style>
      {newMilestone&&<div style={{position:"fixed",top:"20px",left:"50%",transform:"translateX(-50%)",zIndex:9999,maxWidth:360,width:"90%",background:"#111",border:"1px solid #FF573366",borderRadius:14,padding:"14px 18px"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:"50%",background:"#FF573322",border:"2px solid #FF5733",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".9rem",color:"#FF5733",flexShrink:0}}>{newMilestone.icon}</div><div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:".95rem",color:"#FF5733",letterSpacing:".1em"}}>{newMilestone.title}</div><div style={{fontSize:".7rem",color:"#888",marginTop:2}}>{newMilestone.desc}</div></div></div></div>}
      {completionData&&<div style={{position:"fixed",top:"0",left:"0",right:"0",bottom:"0",background:"#0a0a0a",zIndex:9998,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}><div style={{textAlign:"center",marginBottom:28}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"3rem",color:completionData.workoutColor,letterSpacing:".08em",lineHeight:1,marginBottom:6}}>{completionData.workoutLabel}</div><div style={{fontSize:".65rem",color:"#555",letterSpacing:".2em"}}>COMPLETE</div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,width:"100%",maxWidth:340,marginBottom:24}}>{[{label:"TIME",value:fmt(completionData.duration)},{label:"SETS",value:completionData.setsCompleted+"/"+completionData.totalSets},{label:"VOLUME",value:completionData.volume>0?(completionData.volume>999?(completionData.volume/1000).toFixed(1)+"t":completionData.volume+"kg"):"--"}].map(s=><div key={s.label} style={{background:"#111",border:"1px solid #1c1c1c",borderRadius:10,padding:"14px 10px",textAlign:"center"}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.5rem",color:"#fff",lineHeight:1}}>{s.value}</div><div style={{fontSize:".52rem",color:"#444",letterSpacing:".12em",marginTop:3}}>{s.label}</div></div>)}</div><div style={{background:"#111",border:"1px solid #333",borderRadius:12,padding:"14px 18px",maxWidth:340,width:"100%",marginBottom:24,textAlign:"center"}}><div style={{fontSize:".58rem",color:completionData.workoutColor,letterSpacing:".18em",marginBottom:6}}>SWAYD</div><div style={{fontSize:".82rem",color:"#888",lineHeight:1.6,fontStyle:"italic"}}>{completionData.message}</div></div><button onClick={()=>{setCompletionData(null);setActiveWorkout(null);setTab("routines");}} style={{background:"linear-gradient(135deg,#FF5733,#FF8C00)",border:"none",borderRadius:10,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:".15em",padding:"14px 36px",cursor:"pointer",width:"100%",maxWidth:340}}>DONE</button></div>}
      {showWeeklySummary&&<div style={{position:"fixed",top:"0",left:"0",right:"0",bottom:"0",background:"#000000cc",zIndex:9997,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowWeeklySummary(false)}><div style={{background:"#111",border:"1px solid #1c1c1c",borderRadius:"18px 18px 0 0",width:"100%",maxWidth:430,padding:"20px 20px 36px",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.3rem",color:"#fff",letterSpacing:".08em"}}>WEEKLY SUMMARY</div><button style={{background:"none",border:"none",color:"#555",fontSize:"1.1rem",cursor:"pointer"}} onClick={()=>setShowWeeklySummary(false)}>x</button></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>{[{label:"Avg Calories",value:weeklySummary.avgCal,unit:"kcal",color:"#FF5733"},{label:"Avg Protein",value:weeklySummary.avgProt,unit:"g",color:"#3B82F6"},{label:"Days Logged",value:weeklySummary.daysLogged,unit:"of 7",color:"#10B981"},{label:"Workouts",value:weeklySummary.workouts7,unit:"sessions",color:"#F59E0B"},{label:"Goal Days",value:weeklySummary.calGoalDays,unit:"of 7",color:"#A855F7"},{label:"Avg Water",value:weeklySummary.avgWater,unit:"glasses",color:"#3B82F6"}].map(s=><div key={s.label} style={{background:"#161616",border:"1px solid #1c1c1c",borderRadius:8,padding:"10px"}}><div style={{fontSize:".55rem",color:"#555",letterSpacing:".1em",marginBottom:3}}>{s.label.toUpperCase()}</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",color:s.color,lineHeight:1}}>{s.value}<span style={{fontSize:".6rem",color:"#555",marginLeft:2}}>{s.unit}</span></div></div>)}</div><div style={{background:"#161616",border:"1px solid #1c1c1c",borderRadius:8,padding:"12px"}}><div style={{fontSize:".58rem",color:"#555",letterSpacing:".1em",marginBottom:10}}>MACRO SPLIT</div><MacroDonut protein={weeklySummary.avgProt} carbs={Math.round(weeklySummary.avgCal*0.45/4)} fat={Math.round(weeklySummary.avgCal*0.25/9)}/></div></div></div>}
      {!profile&&<OnboardingFlow onComplete={saveProfile}/>}
      {profile&&showProfile&&(
        <div className="app">
          <div className="app-main" style={{padding:"0 16px 16px"}}>
            <ProfilePage profile={profile} macroGoals={macroGoals} onUpdate={saveProfile} onBack={()=>setShowProfile(false)}/>
          </div>
        </div>
      )}
      {profile&&!showProfile&&(
        <div className="app">
          <header className="app-header">
            <div className="brand"><span className="brand-s">S</span>wayd</div>
            <div className="brand-sub">so what are you doing</div>
            {timerActive
              ? <div className="workout-timer-pill"><span className="timer-dot"/>{fmt(elapsed)}</div>
              : <button className="profile-btn" onClick={()=>setShowProfile(true)}>{profile.name?profile.name[0].toUpperCase():"?"}</button>
            }
          </header>
          <main className="app-main">

            {tab==="home"&&(
              <div className="page fade-in">
                <div className="hero-banner">
                  <div className="hero-eyebrow">TODAY'S MISSION</div>
                  <div className="hero-headline">{profile.name?"LET'S GO, "+profile.name.toUpperCase()+".":"SHOW UP. PUT IN WORK."}</div>
                  <div className="hero-sub">so what are you doing?</div>
                  {streak>1&&<div className="streak-badge">🔥 {streak} DAY STREAK</div>}
                </div>

                {aiNudge&&(
                  <div className="nudge-card">
                    <div className="nudge-header">
                      <div className="nudge-label">AI COACH</div>
                      <button className="nudge-refresh" onClick={fetchNudge} disabled={nudgeLoading}>{nudgeLoading?"...":"R"}</button>
                    </div>
                    {nudgeLoading?<div className="nudge-loading"><div className="nudge-dot"/><div className="nudge-dot"/><div className="nudge-dot"/></div>:<div className="nudge-text">{aiNudge.text||"Analysing your data..."}</div>}
                  </div>
                )}

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div className="section-label" style={{marginBottom:0}}>THIS WEEK</div><button onClick={()=>setShowWeeklySummary(true)} style={{background:"#FF573322",border:"1px solid #FF573344",borderRadius:"7px",color:"#FF5733",fontSize:".58rem",padding:"4px 10px",cursor:"pointer"}}>SUMMARY</button></div>
                <div className="week-strip">
                  {weekDays.map(d=>(
                    <button key={d.key} className={"week-day"+(selectedDate===d.key?" week-day-selected":"")+(d.isToday?" week-day-today":"")} onClick={()=>{setSelectedDate(d.key);setTab("macros");}}>
                      <div className="wd-label">{d.label}</div>
                      <div className="wd-num">{d.date}</div>
                      <div className={"wd-dot"+(d.logged?(d.hit?" wd-dot-hit":" wd-dot-partial"):" wd-dot-empty")}/>
                    </button>
                  ))}
                </div>

                <div className="home-stats-row">
                  <div className="card home-stat-card">
                    <div style={{fontSize:".55rem",letterSpacing:".18em",color:"#555",marginBottom:4}}>EATEN</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",color:"#fff",lineHeight:1}}>{totals.cal}<span style={{fontSize:".65rem",color:"#555",marginLeft:3}}>kcal</span></div>
                    <div style={{height:3,background:"#1a1a1a",borderRadius:99,marginTop:8}}>
                      <div style={{height:3,width:Math.min(totals.cal/macroGoals.calories,1)*100+"%",background:totals.cal>macroGoals.calories?"#ff3b3b":"#FF5733",borderRadius:99}}/>
                    </div>
                    <div style={{fontSize:".55rem",color:"#444",marginTop:4}}>{macroGoals.calories} goal</div>
                  </div>
                  <div className="card home-stat-card">
                    <div style={{fontSize:".55rem",letterSpacing:".18em",color:"#555",marginBottom:4}}>BURNED</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",color:todayBurn>0?"#FF5733":"#333",lineHeight:1}}>{todayBurn}<span style={{fontSize:".65rem",color:"#555",marginLeft:3}}>kcal</span></div>
                    <div style={{height:3,background:"#1a1a1a",borderRadius:99,marginTop:8}}>
                      <div style={{height:3,width:Math.min(todayBurn/500,1)*100+"%",background:"#FF5733",borderRadius:99}}/>
                    </div>
                    <div style={{fontSize:".55rem",color:"#444",marginTop:4}}>from workouts</div>
                  </div>
                  <div className="card home-stat-card" style={{borderColor:netCalories<0?"#10B98133":"#1c1c1c"}}>
                    <div style={{fontSize:".55rem",letterSpacing:".18em",color:"#555",marginBottom:4}}>NET</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",color:netCalories<0?"#10B981":"#fff",lineHeight:1}}>{netCalories}<span style={{fontSize:".65rem",color:"#555",marginLeft:3}}>kcal</span></div>
                    <div style={{height:3,background:"#1a1a1a",borderRadius:99,marginTop:8}}>
                      <div style={{height:3,width:Math.min(Math.abs(netCalories)/macroGoals.calories,1)*100+"%",background:netCalories<0?"#10B981":"#FF5733",borderRadius:99}}/>
                    </div>
                    <div style={{fontSize:".55rem",color:"#444",marginTop:4}}>eaten - burned</div>
                  </div>
                </div>

                <div className="section-label">MACROS</div>
                <div className="card"><div className="rings-row">
                  <Ring pct={totals.cal/macroGoals.calories} color="#FF5733" size={84} stroke={8} label="Calories" value={totals.cal} unit="kcal"/>
                  <Ring pct={totals.protein/macroGoals.protein} color="#3B82F6" size={84} stroke={8} label="Protein" value={totals.protein} unit="g"/>
                  <Ring pct={totals.carbs/macroGoals.carbs} color="#F59E0B" size={84} stroke={8} label="Carbs" value={totals.carbs} unit="g"/>
                  <Ring pct={totals.fat/macroGoals.fat} color="#10B981" size={84} stroke={8} label="Fat" value={totals.fat} unit="g"/>
                </div></div>

                <div className="home-stats-row" style={{marginTop:12}}>
                  <div className="card" style={{flex:1.6}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{fontSize:".6rem",letterSpacing:".18em",color:"#555"}}>HYDRATION</div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:".95rem",color:todayWater>=WATER_GOAL?"#3B82F6":"#888"}}>{todayWater}/{WATER_GOAL}</div>
                    </div>
                    <div className="water-glasses">
                      {Array.from({length:WATER_GOAL}).map((_,i)=>(
                        <div key={i} className={"water-glass"+(i<todayWater?" water-glass-full":"")}/>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:6,marginTop:10}}>
                      <button className="water-btn" onClick={removeWater} disabled={todayWater===0}>-</button>
                      <button className="water-btn water-btn-add" onClick={addWater}>+ Glass</button>
                    </div>
                  </div>
                  <div className="card" style={{flex:1}}>
                    <div style={{fontSize:".6rem",letterSpacing:".18em",color:"#555",marginBottom:8}}>BODY WEIGHT</div>
                    {showWeightInput?(
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <input className="form-input" style={{padding:"7px 10px",fontSize:".85rem"}} type="number" placeholder="e.g. 80" value={weightInput} onChange={e=>setWeightInput(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter")logBodyWeight();}}/>
                        <div style={{display:"flex",gap:5}}>
                          <button className="ghost-btn" style={{flex:1,border:"1px solid #2a2a2a",borderRadius:7,padding:"6px 0",fontSize:".65rem"}} onClick={()=>{setShowWeightInput(false);setWeightInput("");}}>CANCEL</button>
                          <button className="create-btn" style={{flex:1,marginTop:0,padding:"6px 0",fontSize:".75rem"}} onClick={logBodyWeight}>SAVE</button>
                        </div>
                      </div>
                    ):(
                      <>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.8rem",color:latestWeight?"#fff":"#333",lineHeight:1,marginBottom:2}}>
                          {latestWeight||"--"}<span style={{fontSize:".65rem",color:"#555",marginLeft:3}}>{profile?.weightUnit||"kg"}</span>
                        </div>
                        {weightTrend!==null&&<div style={{fontSize:".6rem",color:weightTrend<0?"#10B981":weightTrend>0?"#FF5733":"#555",marginBottom:6}}>{weightTrend>0?"+":""}{weightTrend.toFixed(1)} from last</div>}
                        <button className="add-ex-trigger" style={{marginTop:4,padding:"7px 0"}} onClick={()=>setShowWeightInput(true)}>+ LOG</button>
                      </>
                    )}
                    {weightLog.length>1&&!showWeightInput&&<SparkLine data={weightLog.slice(-14).map(e=>e.weight)}/>}
                  </div>
                </div>

                <div className="card" style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontSize:".6rem",letterSpacing:".18em",color:"#555"}}>STEPS TODAY</div>
                    {editingStepGoal?(
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <input className="form-input" style={{width:80,padding:"4px 8px",fontSize:".75rem"}} type="number" placeholder="goal" value={stepGoalInput} onChange={e=>setStepGoalInput(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter")saveStepGoal();}}/>
                        <button className="create-btn" style={{marginTop:0,padding:"4px 12px",fontSize:".7rem",width:"auto"}} onClick={saveStepGoal}>SET</button>
                        <button className="ghost-btn" onClick={()=>setEditingStepGoal(false)}>x</button>
                      </div>
                    ):(
                      <button className="add-ex-trigger" style={{padding:"3px 8px",marginTop:0,width:"auto",fontSize:".58rem"}} onClick={()=>{setEditingStepGoal(true);setStepGoalInput(String(stepGoal));}}>GOAL: {stepGoal.toLocaleString()}</button>
                    )}
                  </div>
                  <div style={{display:"flex",alignItems:"flex-end",gap:12,marginBottom:10}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2.2rem",color:todaySteps>=stepGoal?"#10B981":"#fff",lineHeight:1}}>{todaySteps.toLocaleString()}</div>
                    <div style={{fontSize:".65rem",color:"#555",marginBottom:6}}>of {stepGoal.toLocaleString()}</div>
                    {todaySteps>=stepGoal&&<div style={{fontSize:".65rem",color:"#10B981",marginBottom:6}}>GOAL MET</div>}
                  </div>
                  <div style={{height:4,background:"#1a1a1a",borderRadius:99,marginBottom:10}}>
                    <div style={{height:4,width:Math.min(todaySteps/stepGoal,1)*100+"%",background:todaySteps>=stepGoal?"#10B981":"#3B82F6",borderRadius:99}}/>
                  </div>
                  {showStepInput?(
                    <div style={{display:"flex",gap:8}}>
                      <input className="form-input" style={{flex:1,padding:"7px 10px"}} type="number" placeholder="Enter steps" value={stepInput} onChange={e=>setStepInput(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter")logSteps();}}/>
                      <button className="create-btn" style={{marginTop:0,padding:"7px 16px",width:"auto"}} onClick={logSteps}>SAVE</button>
                      <button className="ghost-btn" style={{border:"1px solid #2a2a2a",borderRadius:7,padding:"7px 10px"}} onClick={()=>{setShowStepInput(false);setStepInput("");}}>x</button>
                    </div>
                  ):(
                    <button className="add-ex-trigger" style={{marginTop:0,padding:"8px 0"}} onClick={()=>setShowStepInput(true)}>+ LOG STEPS</button>
                  )}
                </div>

                <div className="section-label">QUICK START</div>
                <div className="quick-grid">
                  {workouts.map(w=>(
                    <button key={w.id} className="quick-card" style={{"--wc":w.color}} onClick={()=>startWorkout(w)}>
                      <div className="qc-label">{w.label}</div>
                      <div className="qc-tag">{w.tag}</div>
                      {workoutDone.includes(w.id)&&<div className="qc-done">DONE</div>}
                    </button>
                  ))}
                </div>
                <div className="motivational"><span className="mot-brand">SWAYD</span> - built for those who move with purpose.</div>
              </div>
            )}

            {tab==="macros"&&(
              <div className="page fade-in">
                <div className="page-title">MACRO TRACKER</div>
                <div className="date-nav">
                  <button className="date-nav-btn" onClick={goToPrevDay}>{"<<"}</button>
                  <div className="date-nav-label">
                    <div className="date-nav-main">{friendlyDate(selectedDate)}</div>
                    {!isToday&&<div className="date-nav-sub">{selectedDate}</div>}
                  </div>
                  <button className="date-nav-btn" onClick={goToNextDay} disabled={isToday} style={{opacity:isToday?0.3:1}}>{">>"}</button>
                </div>
                <div className="card" style={{marginBottom:16}}>
                  <MacroBar label="Calories" value={totals.cal} goal={macroGoals.calories} color="#FF5733"/>
                  <MacroBar label="Protein" value={totals.protein} goal={macroGoals.protein} color="#3B82F6"/>
                  <MacroBar label="Carbs" value={totals.carbs} goal={macroGoals.carbs} color="#F59E0B"/>
                  <MacroBar label="Fat" value={totals.fat} goal={macroGoals.fat} color="#10B981"/>
                  <div style={{textAlign:"center",marginTop:12,fontSize:".65rem",color:"#555"}}>REMAINING: {Math.max(0,macroGoals.calories-totals.cal)} kcal</div>
                </div>

                <div className="card" style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontSize:".6rem",letterSpacing:".15em",color:"#aaa"}}>LOG FOOD</div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>{setAddingFood(true);setFoodTab("barcode");setScanResult(null);setScanInput("");}} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:6,color:"#888",fontSize:".6rem",padding:"4px 10px",cursor:"pointer"}}>SCAN</button>
                      <button onClick={()=>{setAddingFood(true);setFoodTab("manual");}} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:6,color:"#888",fontSize:".6rem",padding:"4px 10px",cursor:"pointer"}}>MANUAL</button>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                    {MEALS.map(m=><button key={m} className={"meal-chip"+(selectedMeal===m?" meal-chip-active":"")} onClick={()=>setSelectedMeal(m)}>{m}</button>)}
                  </div>
                  <div style={{position:"relative",marginBottom:8}}>
                    <input className="form-input" placeholder="Search food..." value={foodSearch} onChange={e=>{setFoodSearch(e.target.value);if(e.target.value.trim()){setFoodTab("search");setAddingFood(true);}}}/>
                    {foodSearchLoading&&<div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:".65rem",color:"#FF5733"}}>...</div>}
                  </div>
                  {!foodSearch.trim()&&<div className="food-pick-grid" style={{marginBottom:8}}>{quickFoods.slice(0,4).map(f=><button key={f.id} className="food-pick-btn" onClick={()=>addQuickFood(f)}><div className="fpb-name">{f.name}</div><div style={{fontSize:".56rem",color:"#555",marginBottom:2}}>{f.amount}{f.unit}</div><div className="fpb-macros"><span style={{color:"#FF5733"}}>{f.cal}kcal</span> <span style={{color:"#3B82F6"}}>{f.protein}p</span></div></button>)}</div>}
                  {foodSearchResults.length>0&&<div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:8}}>{foodSearchResults.map((f,i)=>{const isOpen=expandedFood===i;const ef=editingFood[i]||f;return <div key={i} style={{background:"#161616",border:"1px solid "+(isOpen?"#FF573366":"#2a2a2a"),borderRadius:8,overflow:"hidden"}}><button style={{width:"100%",background:"none",border:"none",padding:"10px 12px",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}} onClick={()=>{setExpandedFood(isOpen?null:i);setEditingFood(p=>({...p,[i]:f}));}}><div><div className="fpb-name">{f.name}</div><div className="fpb-macros"><span style={{color:"#FF5733"}}>{ef.cal}kcal</span> <span style={{color:"#3B82F6"}}>{ef.protein}p</span> <span style={{color:"#F59E0B"}}>{ef.carbs}c</span></div></div><span style={{color:"#FF5733",fontSize:".7rem"}}>{isOpen?"▲":"EDIT"}</span></button>{isOpen&&<div style={{padding:"10px 12px",borderTop:"1px solid #2a2a2a"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>{[{k:"cal",label:"CALORIES"},{k:"protein",label:"PROTEIN"},{k:"carbs",label:"CARBS"},{k:"fat",label:"FAT"}].map(field=><div key={field.k}><div className="form-label">{field.label}</div><input className="form-input" style={{padding:"5px 8px"}} type="number" value={ef[field.k]||0} onChange={e=>setEditingFood(p=>({...p,[i]:{...ef,[field.k]:Number(e.target.value)}}))}/></div>)}</div><button className="create-btn" style={{marginTop:0}} onClick={()=>{addQuickFood(ef);setFoodSearch("");setFoodSearchResults([]);setExpandedFood(null);setEditingFood({});setAddingFood(false);}}>ADD TO LOG</button></div>}</div>;})}</div>}
                  {foodSearchError&&<div style={{fontSize:".7rem",color:"#555",textAlign:"center",padding:"6px 0"}}>{foodSearchError}</div>}
                  {addingFood&&foodTab==="manual"&&<div style={{borderTop:"1px solid #1c1c1c",paddingTop:10,marginTop:4}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>{[{k:"name",label:"FOOD NAME",full:true},{k:"cal",label:"CALORIES"},{k:"protein",label:"PROTEIN"},{k:"carbs",label:"CARBS"},{k:"fat",label:"FAT"}].map(f=><div key={f.k} style={f.full?{gridColumn:"1/-1"}:{}}><div className="form-label">{f.label}</div><input className="form-input" style={{padding:"6px 10px"}} type={f.k==="name"?"text":"number"} value={newFood[f.k]} onChange={e=>setNewFood(p=>({...p,[f.k]:e.target.value}))}/></div>)}</div><div style={{display:"flex",gap:8}}><button className="ghost-btn" style={{flex:1,border:"1px solid #2a2a2a",borderRadius:8,padding:"9px 0",fontSize:".7rem"}} onClick={()=>{setAddingFood(false);setFoodTab("quick");}}>CANCEL</button><button className="create-btn" style={{flex:2,marginTop:0}} onClick={()=>{if(!newFood.name||!newFood.cal)return;addQuickFood({name:newFood.name,cal:Number(newFood.cal),protein:Number(newFood.protein)||0,carbs:Number(newFood.carbs)||0,fat:Number(newFood.fat)||0,amount:1,unit:"serving"});setNewFood({name:"",cal:"",protein:"",carbs:"",fat:""});setAddingFood(false);}}>ADD FOOD</button></div></div>}
                  {addingFood&&foodTab==="barcode"&&<div style={{borderTop:"1px solid #1c1c1c",paddingTop:10,marginTop:4}}><div className="scanner-viewport"><div className={"scanner-frame"+(scanAnimating?" scanner-active":"")}><div className="scanner-corner tl"/><div className="scanner-corner tr"/><div className="scanner-corner bl"/><div className="scanner-corner br"/>{scanAnimating&&<div className="scanner-beam"/>}<div className="scanner-inner">{!scanAnimating&&!scanResult&&<div style={{textAlign:"center"}}><div style={{fontSize:"1.5rem",marginBottom:4}}>|||</div><div style={{fontSize:".65rem",color:"#555"}}>READY TO SCAN</div></div>}{scanAnimating&&<div style={{textAlign:"center",fontSize:".65rem",color:"#FF5733"}}>SCANNING...</div>}{scanResult&&scanResult.found&&<div style={{textAlign:"center",padding:"0 8px"}}><div style={{fontSize:".6rem",color:"#10B981",marginBottom:4}}>FOUND</div><div style={{fontSize:".78rem",color:"#fff",fontWeight:600,marginBottom:4}}>{scanResult.food.name}</div><div style={{display:"flex",justifyContent:"center",gap:10,fontSize:".65rem"}}><span style={{color:"#FF5733"}}>{scanResult.food.cal}kcal</span><span style={{color:"#3B82F6"}}>{scanResult.food.protein}p</span></div></div>}{scanResult&&!scanResult.found&&<div style={{textAlign:"center",fontSize:".65rem",color:"#ff3b3b"}}>NOT FOUND</div>}</div></div></div><input className="form-input" placeholder="Enter barcode or leave blank for demo" value={scanInput} onChange={e=>setScanInput(e.target.value)} style={{marginBottom:8}}/>{scanResult&&scanResult.found?<div style={{display:"flex",gap:8}}><button className="ghost-btn" style={{flex:1,border:"1px solid #2a2a2a",borderRadius:8,padding:"10px 0",fontSize:".7rem"}} onClick={()=>{setScanResult(null);setScanInput("");}}>RESCAN</button><button className="create-btn" style={{flex:2,marginTop:0}} onClick={addScannedFood}>ADD TO LOG</button></div>:<button className="create-btn" style={{marginTop:0}} onClick={simulateScan} disabled={scanAnimating}>{scanAnimating?"SCANNING...":"SCAN BARCODE"}</button>}</div>}
                  <button style={{width:"100%",background:"none",border:"none",color:"#444",fontSize:".6rem",letterSpacing:".1em",padding:"8px 0 2px",cursor:"pointer",marginTop:4,textAlign:"center"}} onClick={()=>setShowQuickFoodEditor(v=>!v)}>{showQuickFoodEditor?"HIDE EDITOR":"EDIT QUICK FOODS"}</button>
                  {showQuickFoodEditor&&<div style={{borderTop:"1px solid #1c1c1c",paddingTop:8,marginTop:4,display:"flex",flexDirection:"column",gap:8}}>{quickFoods.map((f,i)=><div key={f.id} style={{background:"#161616",border:"1px solid #2a2a2a",borderRadius:8,padding:"10px"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}><div style={{gridColumn:"1/-1"}}><div className="form-label">NAME</div><input className="form-input" style={{padding:"5px 8px"}} value={f.name} onChange={e=>setQuickFoods(p=>p.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/></div><div><div className="form-label">AMOUNT</div><input className="form-input" style={{padding:"5px 8px"}} type="number" value={f.amount} onChange={e=>setQuickFoods(p=>p.map((x,j)=>j===i?{...x,amount:Number(e.target.value)}:x))}/></div><div><div className="form-label">UNIT</div><select className="form-input" style={{padding:"5px 8px"}} value={f.unit} onChange={e=>setQuickFoods(p=>p.map((x,j)=>j===i?{...x,unit:e.target.value}:x))}>{UNITS.map(u=><option key={u} value={u}>{u}</option>)}</select></div><div><div className="form-label">CALORIES</div><input className="form-input" style={{padding:"5px 8px"}} type="number" value={f.cal} onChange={e=>setQuickFoods(p=>p.map((x,j)=>j===i?{...x,cal:Number(e.target.value)}:x))}/></div><div><div className="form-label">PROTEIN</div><input className="form-input" style={{padding:"5px 8px"}} type="number" value={f.protein} onChange={e=>setQuickFoods(p=>p.map((x,j)=>j===i?{...x,protein:Number(e.target.value)}:x))}/></div></div></div>)}<button className="ghost-btn" style={{fontSize:".6rem",color:"#444",padding:"4px 0"}} onClick={()=>setQuickFoods(DEFAULT_QUICK_FOODS)}>RESET TO DEFAULTS</button></div>}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div className="section-label" style={{marginBottom:0}}>FOOD LOG</div>
                  <button className="add-routine-btn" style={{fontSize:".58rem",padding:"5px 10px"}} onClick={copyPreviousDay}>COPY YESTERDAY</button>
                </div>
                {foodLog.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:"#444",fontSize:".75rem"}}>No food logged{!isToday?" for this day":""}.</div>}
                {MEALS.map(meal=>{
                  const items=foodLog.filter(f=>f.meal===meal);
                  if(!items.length) return null;
                  return (
                    <div key={meal} style={{marginBottom:14}}>
                      <div className="meal-heading">{meal}</div>
                      {items.map(f=>(
                        <div key={f.id}>
                          {editingFoodLog===f.id?(
                            <div style={{background:"#161616",border:"1px solid #FF573344",borderRadius:8,padding:"10px 12px",marginBottom:6}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                                <div style={{fontSize:".75rem",color:"#fff",fontWeight:600}}>{f.name}</div>
                                <button style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:".8rem"}} onClick={()=>setEditingFoodLog(null)}>✕</button>
                              </div>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                                <div>
                                  <div className="form-label">AMOUNT</div>
                                  <input className="form-input" style={{padding:"5px 8px"}} type="number" defaultValue={f.amount||1}
                                    onChange={e=>setFoodLog(p=>p.map(x=>x.id===f.id?{...x,amount:Number(e.target.value)}:x))}/>
                                </div>
                                <div>
                                  <div className="form-label">UNIT</div>
                                  <select className="form-input" style={{padding:"5px 8px"}} defaultValue={f.unit||"serving"}
                                    onChange={e=>setFoodLog(p=>p.map(x=>x.id===f.id?{...x,unit:e.target.value}:x))}>
                                    {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                                  </select>
                                </div>
                                {[{k:"cal",label:"CALORIES",color:"#FF5733"},{k:"protein",label:"PROTEIN",color:"#3B82F6"},{k:"carbs",label:"CARBS",color:"#F59E0B"},{k:"fat",label:"FAT",color:"#10B981"}].map(field=>(
                                  <div key={field.k}>
                                    <div className="form-label" style={{color:field.color}}>{field.label}</div>
                                    <input className="form-input" style={{padding:"5px 8px"}} type="number" defaultValue={f[field.k]||0}
                                      onChange={e=>setFoodLog(p=>p.map(x=>x.id===f.id?{...x,[field.k]:Number(e.target.value)}:x))}/>
                                  </div>
                                ))}
                              </div>
                              <div style={{display:"flex",gap:8}}>
                                <button className="create-btn" style={{marginTop:0,flex:2}} onClick={()=>setEditingFoodLog(null)}>SAVE</button>
                                <button style={{flex:1,background:"none",border:"1px solid #ff3b3b33",borderRadius:8,color:"#ff3b3b",fontSize:".7rem",cursor:"pointer"}} onClick={()=>{removeFood(f.id);setEditingFoodLog(null);}}>REMOVE</button>
                              </div>
                            </div>
                          ):(
                            <div className="food-row" onClick={()=>setEditingFoodLog(f.id)} style={{cursor:"pointer"}}>
                              <div className="food-row-name">{f.name}</div>
                              <div className="food-row-macros">
                                <span style={{color:"#FF5733"}}>{f.cal}</span>
                                <span style={{color:"#3B82F6"}}>{f.protein}p</span>
                                <span style={{color:"#F59E0B"}}>{f.carbs}c</span>
                              </div>
                              <div style={{fontSize:".6rem",color:"#444"}}>EDIT</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {tab==="routines"&&!activeWorkout&&(
              <div className="page fade-in">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div className="page-title" style={{marginBottom:0}}>TRAINING</div>
                  <button className="add-routine-btn" onClick={()=>setShowNewWorkout(v=>!v)}>{showNewWorkout?"CANCEL":"+ NEW"}</button>
                </div>
                {showNewWorkout&&(
                  <div className="card new-wk-form">
                    <div className="form-label">WORKOUT NAME</div>
                    <input className="form-input" placeholder="e.g. Upper Body A" value={newWkName} onChange={e=>setNewWkName(e.target.value)}/>
                    <div className="form-label" style={{marginTop:10}}>FOCUS</div>
                    <input className="form-input" placeholder="e.g. Chest, Back, Core" value={newWkTag} onChange={e=>setNewWkTag(e.target.value)}/>
                    <div className="form-label" style={{marginTop:10}}>COLOUR</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                      {COLORS.map(c=><button key={c} className={"color-dot"+(newWkColor===c?" color-dot-active":"")} style={{"--cc":c}} onClick={()=>setNewWkColor(c)}/>)}
                    </div>
                    <button className="create-btn" onClick={createWorkout}>CREATE WORKOUT</button>
                  </div>
                )}
                {sortedWorkouts.map(w=>(
                  <div key={w.id} className={"workout-card"+(swipedWorkout===w.id?" workout-card-swiped":"")} style={{"--wc":w.color}}
                    onTouchStart={e=>{swipeStartX.current=e.touches[0].clientX;}}
                    onTouchEnd={e=>{if(swipeStartX.current===null)return;const diff=swipeStartX.current-e.changedTouches[0].clientX;if(diff>60)setSwipedWorkout(w.id);else if(diff<-20)setSwipedWorkout(null);swipeStartX.current=null;}}
                  >
                    <div className="wc-color-bar"/>
                    <div className="wc-content">
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div onClick={()=>{setSwipedWorkout(null);startWorkout(w);}} style={{flex:1,cursor:"pointer"}}>
                          <div className="wc-label">{w.label}{favourites.includes(w.id)&&<span style={{color:"#F59E0B",marginLeft:6}}>*</span>}</div>
                          <div className="wc-tag">{w.tag}</div>
                        </div>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          {workoutDone.includes(w.id)&&<div className="wc-badge">v</div>}
                          <button className="edit-icon-btn" style={{color:favourites.includes(w.id)?"#F59E0B":"#555"}} onClick={()=>toggleFav(w.id)}>{favourites.includes(w.id)?"*":"o"}</button>
                          <button className="edit-icon-btn" onClick={()=>{setSwipedWorkout(null);setEditingWorkout(editingWorkout===w.id?null:w.id);}}>EDIT</button>
                          <button className="edit-icon-btn" style={{color:"#ff3b3b",borderColor:"#ff3b3b33"}} onClick={()=>deleteWorkout(w.id)}>DEL</button>
                        </div>
                      </div>
                      <div className="wc-exercises">
                        {w.exercises.slice(0,3).map(e=><span key={e.id} className="wc-ex-chip">{e.name}</span>)}
                        {w.exercises.length>3&&<span className="wc-ex-chip" style={{color:"#555"}}>+{w.exercises.length-3} more</span>}
                        {w.exercises.length===0&&<span className="wc-ex-chip" style={{color:"#444",fontStyle:"italic"}}>No exercises yet</span>}
                      </div>
                      {editingWorkout===w.id&&(
                        <div className="edit-panel">
                          <div className="edit-panel-label">EXERCISES ({w.exercises.length})</div>
                          {w.exercises.map(ex=>(
                            <div key={ex.id} className="edit-ex-row">
                              <span className="edit-ex-name">{ex.name}</span>
                              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                                <span className="edit-ex-meta">{ex.sets}x{ex.reps}</span>
                                {editingRestEx===ex.id?(
                                  <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                                    {REST_PRESETS.map(s=>{
                                      const rs=s+"s";
                                      return <button key={s} className={"rest-preset-btn"+(ex.rest===rs?" rest-preset-active":"")} onClick={()=>updateExRest(w.id,ex.id,rs)}>{s}s</button>;
                                    })}
                                    <button className="rest-preset-btn" onClick={()=>setEditingRestEx(null)}>x</button>
                                  </div>
                                ):(
                                  <button style={{background:"none",border:"none",cursor:"pointer",color:"#FF573399",fontSize:".58rem",padding:0}} onClick={()=>setEditingRestEx(ex.id)}>rest: {ex.rest}</button>
                                )}
                              </div>
                              <button className="remove-ex-btn" onClick={()=>removeExercise(w.id,ex.id)}>x</button>
                            </div>
                          ))}
                          {addExMode===w.id?(
                            <div className="add-ex-panel">
                              <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
                                <button className={"ex-mode-tab"+(!customMode?" ex-mode-active":"")} onClick={()=>setCustomMode(false)}>LIBRARY</button>
                                <button className={"ex-mode-tab"+(customMode?" ex-mode-active":"")} onClick={()=>setCustomMode(true)}>CUSTOM</button>
                                <button className="ghost-btn" style={{marginLeft:"auto"}} onClick={()=>{setAddExMode(null);setCustomMode(false);setExSearch("");}}>x</button>
                              </div>
                              {!customMode?(
                                <>
                                  <input className="form-input" placeholder="Search exercises..." value={exSearch} onChange={e=>setExSearch(e.target.value)} style={{marginBottom:8}}/>
                                  <div className="lib-list">
                                    {filteredLib.map(name=>{
                                      const already=w.exercises.some(e=>e.name===name);
                                      return (
                                        <div key={name} className={"lib-item"+(already?" lib-item-added":"")}>
                                          <span style={{flex:1,fontSize:".75rem",color:already?"#444":"#ccc"}}>{name}</span>
                                          <button className="lib-add-btn" disabled={already} onClick={()=>addExerciseFromLib(w.id,name)}>{already?"v":"+"}</button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              ):(
                                <div className="custom-ex-form">
                                  <input className="form-input" placeholder="Exercise name *" value={customEx.name} onChange={e=>setCustomEx(p=>({...p,name:e.target.value}))}/>
                                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,margin:"8px 0"}}>
                                    <div><div className="form-label">SETS</div><input className="form-input" value={customEx.sets} onChange={e=>setCustomEx(p=>({...p,sets:e.target.value}))}/></div>
                                    <div><div className="form-label">REPS</div><input className="form-input" value={customEx.reps} onChange={e=>setCustomEx(p=>({...p,reps:e.target.value}))}/></div>
                                    <div><div className="form-label">REST</div><input className="form-input" value={customEx.rest} onChange={e=>setCustomEx(p=>({...p,rest:e.target.value}))}/></div>
                                  </div>
                                  <input className="form-input" placeholder="Coaching tip (optional)" value={customEx.tip} onChange={e=>setCustomEx(p=>({...p,tip:e.target.value}))} style={{marginBottom:10}}/>
                                  <button className="create-btn" onClick={()=>addCustomExercise(w.id)}>ADD EXERCISE</button>
                                </div>
                              )}
                            </div>
                          ):(
                            <button className="add-ex-trigger" onClick={()=>setAddExMode(w.id)}>+ ADD EXERCISE</button>
                          )}
                          <button className="start-btn-inline" style={{"--wc":w.color}} onClick={()=>startWorkout(w)}>START WORKOUT</button>
                        </div>
                      )}
                      {editingWorkout!==w.id&&<div className="wc-start" onClick={()=>startWorkout(w)}>START</div>}
                    </div>
                    <div className={"swipe-delete-reveal"+(swipedWorkout===w.id?" swipe-delete-visible":"")}>
                      <button className="swipe-delete-btn" onClick={()=>{deleteWorkout(w.id);setSwipedWorkout(null);}}>DELETE</button>
                    </div>
                  </div>
                ))}
                {workoutHistory.length>0&&(
                  <>
                    <div className="section-label" style={{marginTop:24}}>HISTORY</div>
                    {workoutHistory.slice(0,10).map(h=>(
                      <div key={h.id} className="history-card" style={{"--hc":h.workoutColor}}>
                        <div className="history-color-bar"/>
                        <div style={{flex:1,padding:"12px 14px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                            <div>
                              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.1rem",color:h.workoutColor}}>{h.workoutLabel}</div>
                              <div style={{fontSize:".6rem",color:"#555"}}>{h.workoutTag}</div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:".6rem",color:"#555"}}>{h.date}</div>
                              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",color:"#888"}}>{fmt(h.duration)}</div>
                            </div>
                          </div>
                          <div style={{display:"flex",gap:16,marginTop:8}}>
                            <div className="history-stat"><div className="history-stat-val">{h.setsCompleted}/{h.totalSets}</div><div className="history-stat-label">SETS</div></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {tab==="workout"&&activeWorkout&&(
              <div className="page fade-in">
                {restTimer&&(
                  <div className="rest-timer-bar" style={{"--rp":(restTimer.remaining/restTimer.total)*100+"%","--rc":activeWorkout.color}}>
                    <div className="rest-timer-fill"/>
                    <div className="rest-timer-content">
                      <div className="rest-timer-label">REST - {restTimer.exName}</div>
                      <div className="rest-timer-count">{restTimer.remaining}s</div>
                      <button className="rest-timer-skip" onClick={()=>setRestTimer(null)}>SKIP</button>
                    </div>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                  <div>
                    <div className="page-title" style={{color:activeWorkout.color,marginBottom:2}}>{activeWorkout.label}</div>
                    <div style={{fontSize:".65rem",color:"#666"}}>{activeWorkout.tag}</div>
                  </div>
                  <div className="big-timer">{fmt(elapsed)}</div>
                </div>
                {activeWorkout.exercises.map((ex,ei)=>{
                  const pb=personalBests[ex.name];
                  const suggestion=getSuggestion(ex.name);
                  return (
                    <div key={ex.id} className="ex-card">
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                        <div>
                          <div className="ex-name">{ex.name}</div>
                          {pb&&<div className="pb-badge">PB {pb}kg</div>}
                        </div>
                        <button className="watch-btn" onClick={()=>setVideoModal(ex.name)}>WATCH</button>
                      </div>
                      <div className="ex-meta"><span>{ex.sets} sets</span><span>{ex.reps} reps</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,flexWrap:"wrap"}}><span style={{fontSize:".58rem",color:"#555"}}>REST:</span>{REST_PRESETS.map(s=>{const rs=s+"s";const cur=getExRest(ex.id,ex.rest);return <button key={s} onClick={()=>setSessionRest(ex.id,rs)} style={{background:cur===rs?"#FF5733":"#1a1a1a",border:"1px solid "+(cur===rs?"#FF5733":"#2a2a2a"),borderRadius:5,color:cur===rs?"#fff":"#888",fontSize:".62rem",padding:"3px 9px",cursor:"pointer"}}>{s}s</button>;})}</div>
                      {suggestion&&(
                        <div className="overload-hint">
                          <span className="overload-last">Last: {suggestion.lastWeight}kg</span>
                          <span className="overload-arrow"> to </span>
                          <span className="overload-target">Try {suggestion.suggested}kg</span>
                        </div>
                      )}
                      {ex.tip&&<div className="ex-tip">{ex.tip}</div>}
                      <div className="sets-grid">
                        {Array.from({length:parseInt(ex.sets)||3}).map((_,si)=>{
                          const k=ei+"-"+si;
                          const rk="reps-"+ei+"-"+si;
                          const done=!!completedSets[k];
                          const wv=setWeights[k]||"";
                          const rv=setWeights[rk]||"";
                          const isNew=wv&&pb&&parseFloat(wv)>pb;
                          return (
                            <div key={si} className={"set-row"+(done?" set-row-done":"")} style={{"--wc":activeWorkout.color}}>
                              <span className="set-num">SET {si+1}</span>
                              <div style={{display:"flex",gap:4,flex:1}}>
                                {editingWeight===k?(
                                  <input className="weight-input" type="number" placeholder="kg" value={wv} autoFocus
                                    onChange={e=>setSetWeights(p=>({...p,[k]:e.target.value}))}
                                    onBlur={()=>setEditingWeight(null)}
                                    onKeyDown={e=>{if(e.key==="Enter")setEditingWeight(null);}}
                                    style={{width:55}}/>
                                ):(
                                  <button className="weight-pill" onClick={()=>setEditingWeight(k)}>
                                    {wv?wv+"kg":"+ kg"}{isNew&&<span className="pb-star">*</span>}
                                  </button>
                                )}
                                {editingWeight===rk?(
                                  <input className="weight-input" type="number" placeholder="reps" value={rv} autoFocus
                                    onChange={e=>setSetWeights(p=>({...p,[rk]:e.target.value}))}
                                    onBlur={()=>setEditingWeight(null)}
                                    onKeyDown={e=>{if(e.key==="Enter"){setEditingWeight(null);toggleSetP3(ei,si,ex);}}}
                                    style={{width:55}}/>
                                ):(
                                  <button className="weight-pill" style={{color:rv?"#F59E0B":"#555"}} onClick={()=>setEditingWeight(rk)}>
                                    {rv?rv+"r":"+ r"}
                                  </button>
                                )}
                              </div>
                              <button className={"set-btn-v2"+(done?" set-btn-done":"")} style={{"--wc":activeWorkout.color}} onClick={()=>toggleSetP3(ei,si,ex)}>{done?"v":"GO"}</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <button className="finish-btn" onClick={finishWorkoutP3}>FINISH WORKOUT</button>
              </div>
            )}

            {tab==="gear"&&(
              <div className="page fade-in">
                <div className="swayd-hero">
                  <div className="sh-wordmark">SWAYD</div>
                  <div className="sh-tagline">so what are you doing</div>
                </div>
                <div className="brand-manifesto card">
                  <p>We built Swayd for people who do not need motivation - they need movement. Every rep, every meal, every day you show up is a statement.</p>
                </div>
                <div className="section-label" style={{marginTop:20}}>COMMUNITY</div>
                <div className="community-row">
                  <div><div className="cs-num">14K</div><div className="cs-label">Athletes</div></div>
                  <div><div className="cs-num">inf</div><div className="cs-label">Reps Logged</div></div>
                  <div><div className="cs-num">1</div><div className="cs-label">Mission</div></div>
                </div>
              </div>
            )}

          </main>
          <nav className="app-nav">
            {navItems.map(n=>(
              <button key={n.id} className={"nav-btn"+(tab===n.id||(n.id==="routines"&&tab==="workout")?" nav-active":"")}
                onClick={()=>{if(n.id!=="routines")setActiveWorkout(null);setTab(n.id==="routines"&&activeWorkout?"workout":n.id);}}>
                <span className="nav-label">{n.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body,#root{background:#0a0a0a;color:#e0e0e0;font-family:'DM Sans',sans-serif;height:100dvh;overflow:hidden;}
.app{display:flex;flex-direction:column;height:100dvh;max-width:430px;margin:0 auto;background:#0a0a0a;}
.app-header{display:flex;align-items:center;gap:10px;padding:14px 20px 10px;border-bottom:1px solid #1a1a1a;flex-shrink:0;}
.brand{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:.1em;color:#fff;line-height:1;}
.brand-s{color:#FF5733;}
.brand-sub{font-size:.6rem;color:#444;letter-spacing:.18em;text-transform:uppercase;flex:1;}
.workout-timer-pill{display:flex;align-items:center;gap:6px;background:#FF573322;border:1px solid #FF573344;border-radius:99px;padding:4px 12px;font-family:'Bebas Neue',sans-serif;font-size:1rem;color:#FF5733;}
.timer-dot{width:6px;height:6px;border-radius:50%;background:#FF5733;animation:pulse 1s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.profile-btn{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#FF5733,#FF8C00);border:none;color:#fff;font-family:'Bebas Neue',sans-serif;font-size:1rem;cursor:pointer;}
.app-main{flex:1;overflow-y:auto;padding:0 16px 16px;scrollbar-width:none;}
.app-main::-webkit-scrollbar{display:none;}
.page{padding-top:16px;padding-bottom:16px;}
.fade-in{animation:fadeIn .25s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.page-title{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:.1em;color:#fff;margin-bottom:16px;}
.section-label{font-size:.6rem;letter-spacing:.2em;color:#444;text-transform:uppercase;margin-bottom:8px;}
.card{background:#111;border:1px solid #1c1c1c;border-radius:12px;padding:16px;}
.ghost-btn{background:none;border:none;color:#666;cursor:pointer;}
.hero-banner{background:linear-gradient(135deg,#111 0%,#1a0f0a 100%);border:1px solid #FF573322;border-radius:16px;padding:28px 24px 24px;margin-bottom:16px;position:relative;overflow:hidden;}
.hero-eyebrow{font-size:.62rem;letter-spacing:.25em;color:#FF5733;margin-bottom:8px;}
.hero-headline{font-family:'Bebas Neue',sans-serif;font-size:2.4rem;line-height:1.1;color:#fff;letter-spacing:.05em;margin-bottom:10px;}
.hero-sub{font-size:.7rem;color:#666;letter-spacing:.15em;}
.streak-badge{display:inline-flex;align-items:center;gap:6px;margin-top:12px;background:#FF573322;border:1px solid #FF573344;border-radius:99px;padding:4px 12px;font-size:.65rem;color:#FF5733;}
.nudge-card{background:#0f1a14;border:1px solid #10B98133;border-radius:14px;padding:14px 16px;margin-bottom:16px;}
.nudge-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
.nudge-label{font-size:.58rem;letter-spacing:.22em;color:#10B981;}
.nudge-refresh{background:none;border:none;color:#444;font-size:1rem;cursor:pointer;padding:0;}
.nudge-text{font-size:.78rem;color:#ccc;line-height:1.6;}
.nudge-loading{display:flex;gap:5px;align-items:center;height:20px;}
.nudge-dot{width:5px;height:5px;border-radius:50%;background:#10B981;animation:ndp 1.2s ease-in-out infinite;}
.nudge-dot:nth-child(2){animation-delay:.2s;}
.nudge-dot:nth-child(3){animation-delay:.4s;}
@keyframes ndp{0%,100%{opacity:.2}50%{opacity:1}}
.week-strip{display:flex;gap:6px;margin-bottom:16px;}
.week-day{flex:1;background:#111;border:1px solid #1c1c1c;border-radius:10px;padding:8px 4px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:all .2s;}
.week-day-today{border-color:#FF573333;}
.week-day-selected{background:#FF573318;border-color:#FF5733;}
.wd-label{font-size:.52rem;letter-spacing:.08em;color:#555;}
.wd-num{font-family:'Bebas Neue',sans-serif;font-size:1rem;color:#aaa;line-height:1;}
.week-day-selected .wd-num,.week-day-today .wd-num{color:#fff;}
.week-day-selected .wd-num{color:#FF5733;}
.wd-dot{width:6px;height:6px;border-radius:50%;background:#222;}
.wd-dot-hit{background:#10B981;}
.wd-dot-partial{background:#F59E0B;}
.home-stats-row{display:flex;gap:8px;margin-bottom:12px;}
.home-stat-card{flex:1;padding:12px 12px 10px;}
.date-nav{display:flex;align-items:center;justify-content:space-between;background:#111;border:1px solid #1c1c1c;border-radius:12px;padding:10px 16px;margin-bottom:14px;}
.date-nav-btn{background:none;border:none;color:#FF5733;font-size:1.8rem;cursor:pointer;padding:0 4px;line-height:1;}
.date-nav-label{text-align:center;}
.date-nav-main{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.15em;color:#fff;}
.date-nav-sub{font-size:.58rem;color:#555;}
.rings-row{display:flex;justify-content:space-around;align-items:center;padding:8px 0 4px;}
.quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
.quick-card{background:#111;border:1px solid #1c1c1c;border-radius:12px;padding:16px 14px;cursor:pointer;text-align:left;position:relative;overflow:hidden;}
.quick-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--wc);}
.qc-label{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:var(--wc);}
.qc-tag{font-size:.58rem;color:#666;margin-top:2px;}
.qc-done{font-size:.6rem;color:#10B981;margin-top:8px;}
.motivational{text-align:center;font-size:.65rem;color:#333;letter-spacing:.1em;padding:16px 0 4px;}
.mot-brand{color:#FF5733;font-family:'Bebas Neue',sans-serif;}
.water-glasses{display:flex;gap:4px;flex-wrap:wrap;}
.water-glass{width:14px;height:18px;border-radius:2px 2px 4px 4px;border:1px solid #2a2a2a;background:#1a1a1a;}
.water-glass-full{background:#3B82F6;border-color:#3B82F655;}
.water-btn{flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:7px;color:#888;font-family:'DM Sans',sans-serif;font-size:.7rem;padding:6px 0;cursor:pointer;}
.water-btn:disabled{opacity:.3;cursor:default;}
.water-btn-add{color:#3B82F6;border-color:#3B82F633;background:#3B82F611;}
.add-food-btn{width:100%;background:transparent;border:1px dashed #FF573344;border-radius:10px;color:#FF5733;font-family:'DM Sans',sans-serif;font-size:.75rem;letter-spacing:.15em;padding:12px;cursor:pointer;margin-bottom:16px;}
.meal-chip{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:99px;padding:4px 12px;font-size:.65rem;color:#777;cursor:pointer;font-family:'DM Sans',sans-serif;}
.meal-chip-active{background:#FF573320;border-color:#FF573366;color:#FF5733;}
.food-mode-tab{flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:#666;font-family:'DM Sans',sans-serif;font-size:.6rem;padding:7px 4px;cursor:pointer;text-align:center;}
.food-mode-active{background:#FF573320;border-color:#FF573366;color:#FF5733;}
.food-pick-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.food-pick-btn{background:#161616;border:1px solid #222;border-radius:8px;padding:10px;cursor:pointer;text-align:left;width:100%;}
.fpb-name{font-size:.65rem;color:#ccc;margin-bottom:4px;line-height:1.3;}
.fpb-macros{display:flex;gap:6px;font-size:.6rem;font-family:'Bebas Neue',sans-serif;}
.custom-food-del{position:absolute;top:6px;right:6px;background:none;border:none;color:#333;cursor:pointer;font-size:.7rem;}
.meal-heading{font-size:.62rem;letter-spacing:.2em;color:#555;text-transform:uppercase;margin-bottom:6px;}
.food-row{display:flex;align-items:center;background:#111;border:1px solid #1c1c1c;border-radius:8px;padding:10px 12px;margin-bottom:6px;gap:10px;}
.food-row-name{flex:1;font-size:.75rem;color:#ddd;}
.food-row-macros{display:flex;gap:8px;font-size:.65rem;font-family:'Bebas Neue',sans-serif;}
.remove-btn{background:none;border:none;color:#333;cursor:pointer;font-size:.75rem;padding:2px 4px;}
.barcode-section{display:flex;flex-direction:column;gap:12px;}
.scanner-viewport{display:flex;justify-content:center;padding:8px 0;}
.scanner-frame{width:200px;height:140px;position:relative;display:flex;align-items:center;justify-content:center;background:#0a0a0a;border-radius:8px;overflow:hidden;}
.scanner-corner{position:absolute;width:16px;height:16px;border-color:#FF5733;border-style:solid;border-width:0;}
.scanner-corner.tl{top:8px;left:8px;border-top-width:2px;border-left-width:2px;}
.scanner-corner.tr{top:8px;right:8px;border-top-width:2px;border-right-width:2px;}
.scanner-corner.bl{bottom:8px;left:8px;border-bottom-width:2px;border-left-width:2px;}
.scanner-corner.br{bottom:8px;right:8px;border-bottom-width:2px;border-right-width:2px;}
@keyframes beamScan{0%{top:12px}100%{top:calc(100% - 12px)}}
.scanner-beam{position:absolute;left:12px;right:12px;height:2px;background:linear-gradient(90deg,transparent,#FF5733,transparent);animation:beamScan .8s ease-in-out infinite alternate;}
.scanner-inner{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#555;z-index:1;}
.add-routine-btn{background:transparent;border:1px solid #FF573344;border-radius:8px;color:#FF5733;font-family:'DM Sans',sans-serif;font-size:.65rem;letter-spacing:.15em;padding:7px 14px;cursor:pointer;}
.new-wk-form{margin-bottom:16px;}
.form-label{font-size:.58rem;letter-spacing:.18em;color:#555;text-transform:uppercase;margin-bottom:5px;}
.form-input{width:100%;background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:9px 12px;color:#ddd;font-family:'DM Sans',sans-serif;font-size:.8rem;outline:none;}
.form-input:focus{border-color:#FF573366;}
.form-input::placeholder{color:#333;}
.color-dot{width:24px;height:24px;border-radius:50%;background:var(--cc);border:2px solid transparent;cursor:pointer;}
.color-dot-active{border-color:#fff;transform:scale(1.2);}
.create-btn{width:100%;background:linear-gradient(135deg,#FF5733,#FF8C00);border:none;border-radius:8px;color:#fff;font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:.15em;padding:11px;cursor:pointer;margin-top:4px;}
.workout-card{display:flex;background:#111;border:1px solid #1c1c1c;border-radius:14px;margin-bottom:12px;overflow:hidden;position:relative;transition:transform .2s;}
.workout-card-swiped{transform:translateX(-80px);}
.swipe-delete-reveal{position:absolute;right:0;top:0;bottom:0;width:80px;background:#ff3b3b;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;}
.swipe-delete-visible{opacity:1;pointer-events:all;}
.swipe-delete-btn{background:none;border:none;color:#fff;font-family:'Bebas Neue',sans-serif;font-size:.8rem;cursor:pointer;width:100%;height:100%;}
.wc-color-bar{width:3px;background:var(--wc);flex-shrink:0;}
.wc-content{flex:1;padding:16px;}
.wc-label{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:var(--wc);line-height:1;}
.wc-tag{font-size:.62rem;color:#666;margin:2px 0 10px;}
.wc-exercises{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;}
.wc-ex-chip{font-size:.58rem;background:#1a1a1a;border:1px solid #222;border-radius:4px;padding:2px 7px;color:#888;}
.wc-start{font-size:.65rem;letter-spacing:.2em;color:var(--wc);cursor:pointer;}
.wc-badge{width:28px;height:28px;border-radius:50%;background:#10B98122;border:1px solid #10B981;display:flex;align-items:center;justify-content:center;font-size:.75rem;color:#10B981;}
.edit-icon-btn{background:none;border:1px solid #2a2a2a;border-radius:5px;color:#555;cursor:pointer;font-size:.7rem;padding:3px 7px;font-family:'DM Sans',sans-serif;}
.edit-panel{margin-top:12px;border-top:1px solid #1c1c1c;padding-top:12px;}
.edit-panel-label{font-size:.58rem;letter-spacing:.2em;color:#444;margin-bottom:8px;}
.edit-ex-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #161616;}
.edit-ex-name{flex:1;font-size:.75rem;color:#ccc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.edit-ex-meta{font-size:.62rem;color:#555;white-space:nowrap;}
.remove-ex-btn{background:none;border:none;color:#333;cursor:pointer;font-size:.8rem;padding:2px 5px;}
.add-ex-trigger{width:100%;background:transparent;border:1px dashed #2a2a2a;border-radius:8px;color:#555;font-size:.65rem;letter-spacing:.15em;padding:9px;cursor:pointer;margin-top:10px;font-family:'DM Sans',sans-serif;}
.start-btn-inline{width:100%;background:transparent;border:1px solid var(--wc);border-radius:8px;color:var(--wc);font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:.15em;padding:10px;cursor:pointer;margin-top:10px;}
.add-ex-panel{margin-top:10px;background:#0d0d0d;border:1px solid #1c1c1c;border-radius:10px;padding:12px;}
.ex-mode-tab{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;color:#666;font-family:'DM Sans',sans-serif;font-size:.62rem;letter-spacing:.1em;padding:5px 12px;cursor:pointer;}
.ex-mode-active{background:#FF573320;border-color:#FF573366;color:#FF5733;}
.lib-list{max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;}
.lib-item{display:flex;align-items:center;gap:8px;padding:7px 8px;background:#111;border-radius:7px;}
.lib-item-added{opacity:.4;}
.lib-add-btn{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:5px;color:#aaa;font-size:.75rem;width:24px;height:24px;cursor:pointer;}
.custom-ex-form{display:flex;flex-direction:column;gap:6px;}
.rest-preset-btn{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:5px;color:#888;font-size:.58rem;padding:3px 6px;cursor:pointer;font-family:'DM Sans',sans-serif;}
.rest-preset-active{background:#FF573320;border-color:#FF5733;color:#FF5733;}
.history-card{display:flex;background:#111;border:1px solid #1c1c1c;border-radius:12px;margin-bottom:8px;overflow:hidden;}
.history-color-bar{width:3px;background:var(--hc);flex-shrink:0;}
.history-stat{display:flex;flex-direction:column;gap:2px;}
.history-stat-val{font-family:'Bebas Neue',sans-serif;font-size:1rem;color:#ccc;}
.history-stat-label{font-size:.52rem;letter-spacing:.15em;color:#444;}
.rest-timer-bar{position:relative;background:#111;border:1px solid #1c1c1c;border-radius:12px;overflow:hidden;margin-bottom:16px;}
.rest-timer-fill{position:absolute;inset:0;background:var(--rc);width:var(--rp);opacity:.15;transition:width 1s linear;}
.rest-timer-content{position:relative;display:flex;align-items:center;gap:12px;padding:12px 16px;}
.rest-timer-label{flex:1;font-size:.62rem;letter-spacing:.12em;color:#aaa;}
.rest-timer-count{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:var(--rc);letter-spacing:.05em;line-height:1;}
.rest-timer-skip{background:none;border:1px solid #2a2a2a;border-radius:6px;color:#555;font-size:.58rem;letter-spacing:.12em;padding:4px 10px;cursor:pointer;font-family:'DM Sans',sans-serif;}
.big-timer{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;letter-spacing:.1em;color:#fff;}
.ex-card{background:#111;border:1px solid #1c1c1c;border-radius:12px;padding:14px;margin-bottom:10px;}
.ex-name{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:#fff;}
.ex-meta{display:flex;gap:12px;font-size:.62rem;color:#777;margin:6px 0 8px;}
.ex-tip{font-size:.63rem;color:#555;margin-bottom:12px;font-style:italic;}
.watch-btn{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;color:#FF5733;font-size:.58rem;letter-spacing:.1em;padding:4px 10px;cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif;}
.pb-badge{display:inline-flex;font-size:.58rem;color:#F59E0B;background:#F59E0B11;border:1px solid #F59E0B33;border-radius:99px;padding:2px 8px;margin-top:3px;}
.overload-hint{display:flex;align-items:center;gap:8px;background:#FF573314;border:1px solid #FF573333;border-radius:7px;padding:6px 10px;margin-bottom:8px;}
.overload-last{font-size:.65rem;color:#888;}
.overload-arrow{font-size:.75rem;color:#555;}
.overload-target{font-size:.68rem;color:#FF5733;font-weight:600;}
.sets-grid{display:flex;flex-direction:column;gap:6px;margin-top:10px;}
.set-row{display:flex;align-items:center;gap:10px;background:#161616;border:1px solid #1e1e1e;border-radius:8px;padding:8px 12px;}
.set-row-done{background:#1e1e1e;border-color:#FF573344;}
.set-num{font-size:.58rem;letter-spacing:.12em;color:#444;min-width:38px;}
.weight-pill{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;color:#666;font-size:.72rem;padding:5px 10px;cursor:pointer;font-family:'DM Sans',sans-serif;}
.weight-input{background:#0d0d0d;border:1px solid #FF573366;border-radius:6px;color:#fff;font-family:'DM Sans',sans-serif;font-size:.8rem;padding:5px 8px;outline:none;}
.pb-star{color:#F59E0B;font-size:.7rem;margin-left:2px;}
.set-btn-v2{min-width:52px;height:34px;border-radius:7px;background:#1a1a1a;border:1px solid #2a2a2a;color:#555;font-family:'Bebas Neue',sans-serif;font-size:.9rem;letter-spacing:.1em;cursor:pointer;}
.set-btn-done{background:var(--wc) !important;border-color:var(--wc) !important;color:#fff !important;}
.finish-btn{width:100%;margin-top:16px;padding:16px;background:linear-gradient(135deg,#FF5733,#FF8C00);border:none;border-radius:12px;color:#fff;font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:.15em;cursor:pointer;}
.swayd-hero{background:linear-gradient(135deg,#0f0f0f,#1a0f0a);border:1px solid #FF573322;border-radius:16px;padding:40px 24px;text-align:center;margin-bottom:16px;}
.sh-wordmark{font-family:'Bebas Neue',sans-serif;font-size:4rem;letter-spacing:.3em;color:#FF5733;}
.sh-tagline{font-size:.7rem;letter-spacing:.3em;color:#666;margin-top:4px;}
.brand-manifesto{font-size:.8rem;line-height:1.7;color:#aaa;}
.community-row{display:flex;justify-content:space-around;padding:16px;background:#111;border:1px solid #1c1c1c;border-radius:12px;}
.cs-num{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:#FF5733;text-align:center;}
.cs-label{font-size:.6rem;color:#555;text-align:center;letter-spacing:.1em;}
.app-nav{display:flex;border-top:1px solid #222;background:#0d0d0d;padding:12px 0 calc(12px + env(safe-area-inset-bottom));flex-shrink:0;}
.nav-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:none;cursor:pointer;padding:6px 0;}
.nav-label{font-size:.65rem;letter-spacing:.12em;color:#777;font-family:'DM Sans',sans-serif;font-weight:500;}
.nav-active .nav-label{color:#FF5733;font-weight:700;}
.onboard-wrap{position:fixed;inset:0;background:#0a0a0a;z-index:8888;display:flex;flex-direction:column;max-width:430px;margin:0 auto;padding:0 24px 32px;}
.ob-screen{display:flex;flex-direction:column;flex:1;padding-top:48px;}
.ob-progress{display:flex;gap:6px;justify-content:center;padding:16px 0 0;}
.ob-dot{width:6px;height:6px;border-radius:50%;background:#222;}
.ob-dot-active{background:#FF5733;transform:scale(1.3);}
.ob-dot-done{background:#FF573366;}
.ob-logo{font-family:'Bebas Neue',sans-serif;font-size:2.6rem;letter-spacing:.15em;color:#fff;text-align:center;margin-bottom:4px;}
.ob-welcome-tag{text-align:center;font-size:.65rem;letter-spacing:.25em;color:#444;margin-bottom:32px;}
.ob-headline{font-family:'Bebas Neue',sans-serif;font-size:3rem;line-height:1;color:#fff;text-align:center;margin-bottom:16px;}
.ob-body{font-size:.82rem;color:#666;text-align:center;line-height:1.7;max-width:280px;margin:0 auto;}
.ob-step-label{font-size:.58rem;letter-spacing:.25em;color:#FF5733;margin-bottom:8px;}
.ob-step-title{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:#fff;margin-bottom:20px;line-height:1.1;}
.ob-input{width:100%;background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:12px 14px;color:#fff;font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;margin-bottom:4px;}
.ob-input:focus{border-color:#FF573366;}
.ob-option-row{display:flex;gap:10px;margin-bottom:20px;}
.ob-option-btn{flex:1;background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:16px 10px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;color:#888;font-size:.75rem;}
.ob-option-active{background:#FF573318;border-color:#FF573366;color:#FF5733;}
.ob-field{margin-bottom:16px;}
.ob-field-label{font-size:.58rem;letter-spacing:.2em;color:#555;margin-bottom:6px;}
.ob-unit-toggle{display:flex;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden;}
.ob-unit-btn{background:transparent;border:none;padding:8px 14px;color:#555;font-family:'DM Sans',sans-serif;font-size:.72rem;cursor:pointer;}
.ob-unit-active{background:#FF573320;color:#FF5733;}
.ob-list{display:flex;flex-direction:column;gap:6px;margin-bottom:20px;}
.ob-list-item{background:#111;border:1px solid #1c1c1c;border-radius:10px;padding:12px 14px;display:flex;align-items:center;gap:10px;cursor:pointer;color:#888;font-family:'DM Sans',sans-serif;}
.ob-list-active{background:#FF573314;border-color:#FF573355;color:#fff;}
.ob-goal-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
.ob-goal-card{background:#111;border:1px solid #1c1c1c;border-radius:12px;padding:16px 10px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;border-top:2px solid transparent;}
.ob-goal-active{border-color:var(--gc);background:#1a1a1a;}
.ob-goal-label{font-size:.62rem;color:#888;text-align:center;line-height:1.3;}
.ob-goal-active .ob-goal-label{color:#fff;}
.ob-goal-pill{display:inline-flex;align-items:center;border-radius:99px;border:1px solid;padding:3px 12px;font-size:.6rem;margin-bottom:16px;}
.ob-macro-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
.ob-macro-card{background:#111;border:1px solid #1c1c1c;border-radius:10px;padding:14px 12px;border-top:2px solid var(--mc);}
.ob-macro-val{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:#fff;line-height:1;}
.ob-macro-unit{font-size:.7rem;color:#555;margin-left:2px;}
.ob-macro-label{font-size:.58rem;color:#555;margin-top:3px;}
.ob-calc-note{font-size:.63rem;color:#444;line-height:1.6;text-align:center;margin-bottom:8px;}
.ob-nav-row{display:flex;gap:10px;margin-top:auto;padding-top:24px;}
.ob-btn-primary{width:100%;background:linear-gradient(135deg,#FF5733,#FF8C00);border:none;border-radius:12px;color:#fff;font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.15em;padding:15px;cursor:pointer;}
.ob-btn-primary:disabled{opacity:.35;cursor:default;}
.ob-btn-ghost{background:transparent;border:1px solid #2a2a2a;border-radius:12px;color:#666;font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:.15em;padding:14px 18px;cursor:pointer;}
.profile-avatar{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#FF5733,#FF8C00);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:#fff;flex-shrink:0;}
.profile-stat-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #161616;}
.profile-stat-row:last-child{border-bottom:none;}
.profile-stat-label{font-size:.6rem;letter-spacing:.15em;color:#555;}
.profile-stat-val{font-size:.85rem;color:#ccc;}
`;
