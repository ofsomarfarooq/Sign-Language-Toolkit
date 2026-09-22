import React, { useState, useEffect, useRef } from "react";
import Slider from 'react-input-slider';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '../App.css';

import xbot from '../Models/xbot/xbot.glb';
import ybot from '../Models/ybot/ybot.glb';
import xbotPic from '../Models/xbot/xbot.png';
import ybotPic from '../Models/ybot/ybot.png';

// Restoring the original animation dictionaries
import * as words from '../Animations/words';
import * as alphabets from '../Animations/alphabets';
import { defaultPose } from '../Animations/defaultPose';

function Convert({ navigate }) {
  const [text, setText] = useState("");
  const [bot, setBot] = useState(xbot);
  const [speed, setSpeed] = useState(0.1);
  const [pause, setPause] = useState(800);
  const [inputText, setInputText] = useState("");

  const componentRef = useRef({});
  const { current: ref } = componentRef;

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    ref.flag = false;
    ref.pending = false;
    ref.animations = [];
    ref.characters = [];

    ref.scene = new THREE.Scene();
    ref.scene.background = new THREE.Color(0xdddddd);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); 
    ref.scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 5, 5);
    ref.scene.add(spotLight);

    ref.renderer = new THREE.WebGLRenderer({ antialias: true });
    ref.camera = new THREE.PerspectiveCamera(30, (window.innerWidth * 0.57) / (window.innerHeight - 70), 0.1, 1000);
    ref.renderer.setSize(window.innerWidth * 0.57, window.innerHeight - 70);

    const canvasDiv = document.getElementById("canvas-container");
    if (canvasDiv) {
        canvasDiv.innerHTML = "";
        canvasDiv.appendChild(ref.renderer.domElement);
    }

    // X = 0 (centered), Y = 1.4 (camera height at chest level), Z = 1.2 (zoomed in closer)
    ref.camera.position.set(0, 1.4, 1.6); 
    
    // Point the camera lens directly at the upper chest/neck area instead of the waist
    ref.camera.lookAt(0, 1.4, 0);

    let loader = new GLTFLoader();
    loader.load(bot, (gltf) => {
        // THE FIX: Stop Three.js from hiding the model
        gltf.scene.traverse((child) => {
          if (child.type === 'SkinnedMesh') {
            child.frustumCulled = false;
          }
        });

        ref.avatar = gltf.scene;
        ref.avatar.position.set(0, 0, 0);
        ref.scene.add(ref.avatar);
        defaultPose(ref);
      }
    );
  }, [ref, bot]);

  // The original animation loop
  ref.animate = () => {
    if(ref.animations.length === 0){
        ref.pending = false;
      return ;
    }
    requestAnimationFrame(ref.animate);
    if(ref.animations[0].length){
        if(!ref.flag) {
          if(ref.animations[0][0]==='add-text'){
            setText(text + ref.animations[0][1]);
            ref.animations.shift();
          }
          else{
            for(let i=0;i<ref.animations[0].length;){
              let [boneName, action, axis, limit, sign] = ref.animations[0][i];
              let bone = ref.avatar.getObjectByName(boneName);
              if (bone) {
                  if(sign === "+" && bone[action][axis] < limit){
                      bone[action][axis] += speed;
                      bone[action][axis] = Math.min(bone[action][axis], limit);
                      i++;
                  }
                  else if(sign === "-" && bone[action][axis] > limit){
                      bone[action][axis] -= speed;
                      bone[action][axis] = Math.max(bone[action][axis], limit);
                      i++;
                  }
                  else {
                      ref.animations[0].splice(i, 1);
                  }
              } else {
                  ref.animations[0].splice(i, 1);
              }
            }
          }
        }
    }
    else {
      ref.flag = true;
      setTimeout(() => {
        ref.flag = false
      }, pause);
      ref.animations.shift();
    }
    ref.renderer.render(ref.scene, ref.camera);
  }

  // The original sentence parser
  const sign = (inputString) => {
    if (!inputString) return;
    
    var str = inputString.toUpperCase();
    var strWords = str.split(' ');
    setText('');

    for(let word of strWords){
      if(words[word]){
        ref.animations.push(['add-text', word+' ']);
        words[word](ref);
      }
      else{
        for(const [index, ch] of word.split('').entries()){
          if(index === word.length-1)
            ref.animations.push(['add-text', ch+' ']);
          else 
            ref.animations.push(['add-text', ch]);
          
          if (alphabets[ch]) {
              alphabets[ch](ref);
          }
        }
      }
    }
    
    if (!ref.pending) {
        ref.pending = true;
        ref.animate();
    }
    setInputText("");
    resetTranscript();
  }

  return (
    <div className='container-fluid'>
      <div className='row mt-3'>
        <div className='col-md-3'>
          <label className='label-style fw-bold'>Speech Recognition: {listening ? 'ON' : 'OFF'}</label>
          <div className='d-flex justify-content-between mb-2'>
            <button className="btn btn-primary w-33" onClick={SpeechRecognition.startListening}>
              Mic On <i className="fa fa-microphone"/>
            </button>
            <button className="btn btn-secondary w-33" onClick={SpeechRecognition.stopListening}>
              Mic Off
            </button>
            <button className="btn btn-danger w-33" onClick={resetTranscript}>Clear</button>
          </div>
          
          <textarea rows={3} value={transcript} readOnly className='w-100 form-control mb-2' placeholder="Speech input..." />
          <button onClick={() => sign(transcript)} className='btn btn-success w-100 mb-4'>
            Translate Speech
          </button>

          <label className='label-style fw-bold'>Text Input</label>
          <textarea rows={3} value={inputText} onChange={(e) => setInputText(e.target.value)} className='w-100 form-control mb-2' placeholder="Type here..." />
          <button onClick={() => sign(inputText)} className='btn btn-success w-100'>
            Translate Text
          </button>

          <label className='label-style fw-bold mt-4'>Translated Output</label>
          <textarea rows={2} value={text} readOnly className='w-100 form-control bg-light text-primary fw-bold' />


          <button onClick={() => navigate('learn')} className='btn btn-outline-primary w-100 fw-bold shadow-sm'>
            Go to Learn Sign
          </button>
        </div>

        

        <div className='col-md-7'>
          <div id='canvas-container' style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}/>
        </div>


        <div className='col-md-2'>
          <p className='fw-bold mb-2'>Select Avatar</p>
          <div className="d-flex flex-column align-items-center mb-4">
              <img src={xbotPic} className='img-fluid mb-2' style={{cursor: 'pointer', border: bot === xbot ? '3px solid blue' : 'none'}} onClick={() => setBot(xbot)} alt='XBOT'/>
              <img src={ybotPic} className='img-fluid' style={{cursor: 'pointer', border: bot === ybot ? '3px solid blue' : 'none'}} onClick={() => setBot(ybot)} alt='YBOT'/>
          </div>

          <p className='fw-bold mb-1'>Speed: {Math.round(speed*100)/100}</p>
          <Slider axis="x" xmin={0.05} xmax={0.50} xstep={0.01} x={speed} onChange={({ x }) => setSpeed(x)} className='w-100 mb-3' />
          
          <p className='fw-bold mb-1'>Pause time: {pause} ms</p>
          <Slider axis="x" xmin={0} xmax={2000} xstep={100} x={pause} onChange={({ x }) => setPause(x)} className='w-100' />
        </div>
      </div>
    </div>
  )
}

export default Convert;