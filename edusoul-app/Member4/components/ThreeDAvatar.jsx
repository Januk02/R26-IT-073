import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Text-to-Viseme Mapping:
 * Maps English letter patterns to Oculus/Avaturn viseme blendshapes.
 * The model has: viseme_sil, viseme_PP, viseme_FF, viseme_TH, viseme_DD,
 *   viseme_kk, viseme_CH, viseme_SS, viseme_nn, viseme_RR,
 *   viseme_aa, viseme_E, viseme_I, viseme_O, viseme_U
 */
const VISEME_RULES = [
  // Digraphs first (longer matches take priority)
  { re: /^th/i,       viseme: 'viseme_TH', len: 2 },
  { re: /^ch|^sh/i,   viseme: 'viseme_CH', len: 2 },
  { re: /^ph/i,       viseme: 'viseme_FF', len: 2 },
  { re: /^ee|^ea/i,   viseme: 'viseme_E',  len: 2 },
  { re: /^oo|^ou/i,   viseme: 'viseme_U',  len: 2 },
  { re: /^ow/i,       viseme: 'viseme_O',  len: 2 },
  { re: /^ai|^ay/i,   viseme: 'viseme_E',  len: 2 },
  // Single consonants
  { re: /^[pbm]/i,    viseme: 'viseme_PP', len: 1 },
  { re: /^[fv]/i,     viseme: 'viseme_FF', len: 1 },
  { re: /^[tdnl]/i,   viseme: 'viseme_DD', len: 1 },
  { re: /^[kgcq]/i,   viseme: 'viseme_kk', len: 1 },
  { re: /^[szx]/i,    viseme: 'viseme_SS', len: 1 },
  { re: /^[r]/i,      viseme: 'viseme_RR', len: 1 },
  { re: /^[h]/i,      viseme: 'viseme_aa', len: 1 },
  { re: /^[w]/i,      viseme: 'viseme_U',  len: 1 },
  { re: /^[y]/i,      viseme: 'viseme_I',  len: 1 },
  // Vowels
  { re: /^[a]/i,      viseme: 'viseme_aa', len: 1 },
  { re: /^[e]/i,      viseme: 'viseme_E',  len: 1 },
  { re: /^[i]/i,      viseme: 'viseme_I',  len: 1 },
  { re: /^[o]/i,      viseme: 'viseme_O',  len: 1 },
  { re: /^[u]/i,      viseme: 'viseme_U',  len: 1 },
];

// The set of all viseme blendshape names in the model
const ALL_VISEMES = [
  'viseme_sil', 'viseme_PP', 'viseme_FF', 'viseme_TH',
  'viseme_DD', 'viseme_kk', 'viseme_CH', 'viseme_SS',
  'viseme_nn', 'viseme_RR', 'viseme_aa', 'viseme_E',
  'viseme_I', 'viseme_O', 'viseme_U',
];

/**
 * Build timed viseme keyframes from English text.
 * Each keyframe = { viseme, start, end } in seconds.
 */
function buildVisemeTimeline(text) {
  if (!text) return [];
  const clean = text.replace(/[^a-zA-Z\s]/g, '').toLowerCase();
  const timeline = [];
  let t = 0;
  const CHAR_DUR = 0.065; // seconds per character
  const WORD_GAP = 0.12;  // silence between words

  for (const word of clean.split(/\s+/)) {
    if (!word) continue;
    let pos = 0;
    while (pos < word.length) {
      const slice = word.slice(pos);
      let matched = false;
      for (const rule of VISEME_RULES) {
        if (rule.re.test(slice)) {
          const dur = rule.len * CHAR_DUR;
          timeline.push({ viseme: rule.viseme, start: t, end: t + dur });
          t += dur;
          pos += rule.len;
          matched = true;
          break;
        }
      }
      if (!matched) {
        // Unknown char → open mouth briefly
        timeline.push({ viseme: 'viseme_aa', start: t, end: t + CHAR_DUR });
        t += CHAR_DUR;
        pos++;
      }
    }
    // Insert a short silence between words
    timeline.push({ viseme: 'viseme_sil', start: t, end: t + WORD_GAP });
    t += WORD_GAP;
  }
  return timeline;
}

/**
 * ThreeDAvatar — 3D GLB Avatar with real-time viseme lip sync.
 *
 * Props:
 *   modelUrl   – path to .glb file (default: /model.glb)
 *   isSpeaking – boolean, true while TTS is active
 *   currentText – the sentence being spoken (drives viseme timeline)
 */
const ThreeDAvatar = ({
  modelUrl = '/model.glb',
  isSpeaking = false,
  currentText = '',
  className = '',
}) => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Three.js refs
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const avatarRef = useRef(null);
  const morphMeshesRef = useRef([]);
  const headBoneRef = useRef(null);
  const animFrameRef = useRef(null);

  // Speech state refs (accessed inside rAF)
  const isSpeakingRef = useRef(false);
  const speakStartRef = useRef(0);
  const timelineRef = useRef([]);
  const totalDurRef = useRef(0);

  // Animation state
  const smoothAmpRef = useRef(0);
  const blinkTimerRef = useRef(0);
  const nextBlinkRef = useRef(2 + Math.random() * 3);
  const isBlinkingRef = useRef(false);
  const blinkProgRef = useRef(0);

  // Sync props → refs
  useEffect(() => {
    if (isSpeaking && !isSpeakingRef.current) {
      speakStartRef.current = performance.now() / 1000;
    }
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    const tl = buildVisemeTimeline(currentText);
    timelineRef.current = tl;
    totalDurRef.current = tl.length > 0 ? tl[tl.length - 1].end : 0;
  }, [currentText]);

  // ===== Scene setup & render loop =====
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth || 300;
    const h = container.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(30, w / h, 0.01, 100);
    camera.position.set(0, 1.55, 0.85);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(2, 3, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xb48ef7, 1.0);
    fill.position.set(-2, 2, 0);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x6366f1, 0.8);
    rim.position.set(0, 1, -3);
    scene.add(rim);

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        avatarRef.current = model;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.x = -center.x;
        model.position.z = -center.z;
        model.position.y = -box.min.y;

        const faceCenterY = size.y > 1.0 ? size.y * 0.83 : size.y * 0.5;
        const camDist = size.y > 1.0 ? 1.1 : 0.9;
        camera.position.set(0, faceCenterY, camDist);
        camera.lookAt(0, faceCenterY, 0);

        // Gather morph meshes & head bone
        const morphMeshes = [];
        model.traverse((child) => {
          if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
            morphMeshes.push(child);
            console.log('[3DAvatar] Morph mesh:', child.name, 'targets:', Object.keys(child.morphTargetDictionary).length);
          }
          if (child.isBone && child.name.toLowerCase().includes('head') && !headBoneRef.current) {
            headBoneRef.current = child;
          }
        });
        morphMeshesRef.current = morphMeshes;

        scene.add(model);
        setLoading(false);
        console.log('[3DAvatar] ✅ Model loaded, morph meshes:', morphMeshes.length);
        startLoop();
      },
      undefined,
      (error) => {
        console.error('[3DAvatar] ❌ Load error:', error);
        setLoadError('Failed to load 3D model');
        setLoading(false);
      }
    );

    function startLoop() {
      const clock = new THREE.Clock();

      function animate() {
        animFrameRef.current = requestAnimationFrame(animate);
        const dt = clock.getDelta();
        const t = clock.getElapsedTime();
        const speaking = isSpeakingRef.current;

        // ======== Determine current viseme & amplitude ========
        let activeViseme = 'viseme_sil';
        let targetAmp = 0;

        if (speaking) {
          const elapsed = (performance.now() / 1000) - speakStartRef.current;
          const tl = timelineRef.current;
          const totalDur = totalDurRef.current;

          if (tl.length > 0 && totalDur > 0) {
            // Loop the timeline if speech is longer than the text sequence
            const loopedT = elapsed % (totalDur + 0.3);
            const hit = tl.find(kf => loopedT >= kf.start && loopedT < kf.end);
            if (hit) {
              activeViseme = hit.viseme;
            }
          }

          // Procedural amplitude: syllable rhythm modulated by word cadence
          const st = elapsed;
          const syllable = Math.pow(Math.abs(Math.sin(st * 6.5 * Math.PI)), 0.35);
          const wordMod = 0.5 + 0.5 * Math.sin(st * 2.8 * Math.PI);
          const pause = (Math.sin(st * 3.1) * Math.sin(st * 5.3)) > 0.8 ? 0.1 : 1.0;
          targetAmp = Math.max(0.08, Math.min(0.95, syllable * wordMod * pause * 0.92));
        }

        // Smooth amplitude
        const lerpSpeed = speaking ? 0.3 : 0.12;
        smoothAmpRef.current += (targetAmp - smoothAmpRef.current) * lerpSpeed;
        const amp = smoothAmpRef.current;

        // ======== Apply morph targets across ALL meshes ========
        const meshes = morphMeshesRef.current;

        meshes.forEach((mesh) => {
          const dict = mesh.morphTargetDictionary;
          const infl = mesh.morphTargetInfluences;
          if (!dict || !infl) return;

          // Set jawOpen proportional to amplitude
          if (dict.jawOpen !== undefined) {
            infl[dict.jawOpen] = lerp(infl[dict.jawOpen], speaking ? amp * 0.8 : 0, 0.35);
          }
          if (dict.mouthOpen !== undefined) {
            infl[dict.mouthOpen] = lerp(infl[dict.mouthOpen], speaking ? amp * 0.7 : 0, 0.35);
          }

          // Set each viseme blendshape
          for (const visemeName of ALL_VISEMES) {
            if (dict[visemeName] === undefined) continue;
            const idx = dict[visemeName];

            if (speaking && visemeName === activeViseme) {
              // Active viseme: strong weight
              const w = visemeName === 'viseme_sil' ? 0.3 : Math.min(1.0, amp * 1.4 + 0.3);
              infl[idx] = lerp(infl[idx], w, 0.4);
            } else if (visemeName === 'viseme_sil') {
              // Silence shape: full when not speaking, low when speaking
              infl[idx] = lerp(infl[idx], speaking ? 0 : 0.8, 0.15);
            } else {
              // Inactive visemes: lerp to zero
              infl[idx] = lerp(infl[idx], 0, 0.3);
            }
          }
        });

        // ======== Eye blinking ========
        blinkTimerRef.current += dt;
        if (!isBlinkingRef.current && blinkTimerRef.current >= nextBlinkRef.current) {
          isBlinkingRef.current = true;
          blinkProgRef.current = 0;
        }
        let blinkVal = 0;
        if (isBlinkingRef.current) {
          blinkProgRef.current += dt * 8;
          if (blinkProgRef.current < 1) blinkVal = blinkProgRef.current;
          else if (blinkProgRef.current < 2) blinkVal = 2 - blinkProgRef.current;
          else {
            isBlinkingRef.current = false;
            blinkTimerRef.current = 0;
            nextBlinkRef.current = 2 + Math.random() * 4;
          }
        }
        meshes.forEach((mesh) => {
          const dict = mesh.morphTargetDictionary;
          const infl = mesh.morphTargetInfluences;
          if (!dict || !infl) return;
          if (dict.eyeBlinkLeft !== undefined) infl[dict.eyeBlinkLeft] = blinkVal;
          if (dict.eyeBlinkRight !== undefined) infl[dict.eyeBlinkRight] = blinkVal;
          if (dict.eyesClosed !== undefined) infl[dict.eyesClosed] = blinkVal * 0.5;
        });

        // ======== Head movement ========
        if (headBoneRef.current) {
          if (speaking) {
            headBoneRef.current.rotation.x = Math.sin(t * 4.5) * 0.04 * amp + 0.02;
            headBoneRef.current.rotation.y = Math.cos(t * 2.8) * 0.055 * amp;
            headBoneRef.current.rotation.z = Math.sin(t * 3.5) * 0.025 * amp;
          } else {
            headBoneRef.current.rotation.x = lerp(headBoneRef.current.rotation.x, Math.sin(t * 0.6) * 0.012, 0.04);
            headBoneRef.current.rotation.y = lerp(headBoneRef.current.rotation.y, Math.sin(t * 0.4) * 0.015, 0.04);
            headBoneRef.current.rotation.z = lerp(headBoneRef.current.rotation.z, 0, 0.04);
          }
        }

        // Render
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }

      animate();
    }

    const onResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [modelUrl]);

  if (loadError) {
    return (
      <div className={`bg-slate-950 flex items-center justify-center ${className}`}>
        <p className="text-xs text-rose-400 font-medium text-center px-4">{loadError}</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold text-white">Loading 3D Avatar...</p>
        </div>
      )}
    </div>
  );
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default ThreeDAvatar;
