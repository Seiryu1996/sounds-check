// index.js

// グローバル変数の定義
        let audioContext;
        let analyser;
        let source;
        let dataArray;
        let bufferLength;
        let animationId;
        let audioBuffer;
        let startTime = 0;
        let pauseTime = 0;
        let isPlaying = false;
        let sensitivity = 1;
        let visualizationMode = 'bars';
        let isFrozen = false;
        let frozenData = null;
        let loopSource = null;
        let loopBuffer = null;
        let micStream = null;
        let micSource = null;
        let isMicActive = false;
        let tunerMode = false;
        let tunerAnimationId = null;
        let tunerA4Frequency = 440; // デフォルトA4周波数
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const fileInput = document.getElementById('fileInput');
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const freezeBtn = document.getElementById('freezeBtn');
        const sensitivitySlider = document.getElementById('sensitivity');
        const sensitivityValue = document.getElementById('sensitivityValue');
        const info = document.getElementById('info');
        const loading = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        const harmonyOverlay = document.getElementById('harmonyOverlay');
        const noteDisplay = document.getElementById('noteDisplay');
        const chordDisplay = document.getElementById('chordDisplay');
        const chordName = document.getElementById('chordName');
        const chordType = document.getElementById('chordType');
        const frequencyCanvas = document.getElementById('frequencyCanvas');
        const freqCtx = frequencyCanvas.getContext('2d');
        const micBtn = document.getElementById('micBtn');
        const tunerBtn = document.getElementById('tunerBtn');
        const micIndicator = document.getElementById('micIndicator');
        const tunerOverlay = document.getElementById('tunerOverlay');
        const tunerNote = document.getElementById('tunerNote');
        const tunerFrequency = document.getElementById('tunerFrequency');
        const tunerCents = document.getElementById('tunerCents');
        const tunerIndicator = document.getElementById('tunerIndicator');
        const tunerA4Select = document.getElementById('tunerA4');
        // コード進行の定義
        const chordPatterns = {
            // メジャーコード
            major: { intervals: [0, 4, 7], symbol: '', name: 'メジャー' },
            // マイナーコード
            minor: { intervals: [0, 3, 7], symbol: 'm', name: 'マイナー' },
            // セブンスコード
            dominant7: { intervals: [0, 4, 7, 10], symbol: '7', name: 'セブンス' },
            major7: { intervals: [0, 4, 7, 11], symbol: 'M7', name: 'メジャーセブンス' },
            minor7: { intervals: [0, 3, 7, 10], symbol: 'm7', name: 'マイナーセブンス' },
            // サスペンデッドコード
            sus2: { intervals: [0, 2, 7], symbol: 'sus2', name: 'サスペンデッド2' },
            sus4: { intervals: [0, 5, 7], symbol: 'sus4', name: 'サスペンデッド4' },
            // 6thコード
            major6: { intervals: [0, 4, 7, 9], symbol: '6', name: 'シックス' },
            minor6: { intervals: [0, 3, 7, 9], symbol: 'm6', name: 'マイナーシックス' },
            // ディミニッシュ・オーギュメント
            dim: { intervals: [0, 3, 6], symbol: 'dim', name: 'ディミニッシュ' },
            dim7: { intervals: [0, 3, 6, 9], symbol: 'dim7', name: 'ディミニッシュセブンス' },
            aug: { intervals: [0, 4, 8], symbol: 'aug', name: 'オーギュメント' },
            // 9thコード
            add9: { intervals: [0, 4, 7, 14], symbol: 'add9', name: 'アドナインス' },
            major9: { intervals: [0, 4, 7, 11, 14], symbol: 'M9', name: 'メジャーナインス' },
            minor9: { intervals: [0, 3, 7, 10, 14], symbol: 'm9', name: 'マイナーナインス' },
            // その他
            minorMajor7: { intervals: [0, 3, 7, 11], symbol: 'mM7', name: 'マイナーメジャーセブンス' },
            halfDim7: { intervals: [0, 3, 6, 10], symbol: 'm7♭5', name: 'ハーフディミニッシュ' }
        };
        // 音階と周波数の対応表
        const noteFrequencies = {
            'C': [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00, 4186.01],
            'C#': [17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
            'D': [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.63],
            'D#': [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
            'E': [20.60, 41.20, 82.41, 164.81, 329.63, 659.25, 1318.51, 2637.02, 5274.04],
            'F': [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83, 5587.65],
            'F#': [23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96, 5919.91],
            'G': [24.50, 49.00, 98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96, 6271.93],
            'G#': [25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44, 6644.88],
            'A': [27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00, 7040.00],
            'A#': [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31, 7458.62],
            'B': [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07, 7902.13]
        };
        // キャンバスのリサイズ
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight - document.querySelector('.controls').offsetHeight;
            // 周波数キャンバスのサイズ設定
            if (frequencyCanvas.parentElement) {
                frequencyCanvas.width = frequencyCanvas.parentElement.offsetWidth - 20;
                frequencyCanvas.height = window.innerWidth <= 375 ? 100 : 130;
            }
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        // AudioContextの初期化
        function initAudioContext() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 4096; // より高い解像度で周波数分析
                bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);
            }
        }
        // 周波数から音階を検出（基準周波数対応版）
        function frequencyToNote(frequency, referenceA4 = tunerA4Frequency) {
            const A4 = referenceA4 || 440;
            const C0 = A4 * Math.pow(2, -4.75);
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            if (frequency === 0) return null;
            const halfSteps = 12 * Math.log2(frequency / C0);
            const octave = Math.floor(halfSteps / 12);
            const noteIndex = Math.round(halfSteps % 12);
            return {
                note: noteNames[noteIndex],
                octave: octave,
                frequency: frequency,
                cents: (halfSteps % 12 - noteIndex) * 100
            };
        }
        // 周波数スペクトルから主要な周波数を検出
        function detectPeakFrequencies(dataArray, sampleRate) {
            const frequencies = [];
            const minFreq = 80; // 最小周波数 (Hz)
            const maxFreq = 2000; // 最大周波数 (Hz)
            const threshold = 50; // 閾値
            for (let i = 0; i < dataArray.length; i++) {
                const frequency = i * sampleRate / (dataArray.length * 2);
                if (frequency >= minFreq && frequency <= maxFreq && dataArray[i] > threshold) {
                    // ピーク検出
                    if (i > 0 && i < dataArray.length - 1 &&
                        dataArray[i] > dataArray[i - 1] &&
                        dataArray[i] > dataArray[i + 1]) {
                        frequencies.push({
                            frequency: frequency,
                            amplitude: dataArray[i]
                        });
                    }
                }
            }
            // 振幅でソートして上位を返す
            return frequencies
                .sort((a, b) => b.amplitude - a.amplitude)
                .slice(0, 8)
                .map(f => f.frequency);
        }
        // 音階名を半音階のインデックスに変換
        function noteToSemitone(noteName) {
            if (!noteName) return null;
            const noteMap = {
                'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
                'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
            };
            return noteMap[noteName];
        }
        // コードを判定
        function identifyChord(notes) {
            if (!notes || notes.length < 2) return null;
            // 音階名を抽出してソート
            const noteNames = notes.map(n => n.note).filter(n => n !== null);
            const semitones = noteNames.map(noteToSemitone).filter(s => s !== null).sort((a, b) => a - b);
            if (semitones.length < 2) return null;
            // 音階名のマップを作成
            const semitoneToNote = {
                0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
                6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B'
            };
            // 各音をルートとして試す
            for (let rootIndex = 0; rootIndex < semitones.length; rootIndex++) {
                const root = semitones[rootIndex];
                const intervals = semitones.map(note => {
                    const interval = (note - root + 12) % 12;
                    return interval;
                }).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
                // パターンマッチング
                for (const [chordType, pattern] of Object.entries(chordPatterns)) {
                    if (intervals.length === pattern.intervals.length) {
                        let match = true;
                        for (let i = 0; i < intervals.length; i++) {
                            if (intervals[i] !== pattern.intervals[i]) {
                                match = false;
                                break;
                            }
                        }
                        if (match) {
                            const rootNote = semitoneToNote[root];
                            return {
                                root: rootNote,
                                type: chordType,
                                symbol: pattern.symbol,
                                name: pattern.name,
                                notes: noteNames
                            };
                        }
                    }
                }
            }
            // 部分一致を試す（3和音以上の場合）
            if (semitones.length >= 3) {
                for (let rootIndex = 0; rootIndex < semitones.length; rootIndex++) {
                    const root = semitones[rootIndex];
                    const intervals = semitones.map(note => (note - root + 12) % 12)
                        .filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
                    // 基本的なコードパターンをチェック
                    for (const [chordType, pattern] of Object.entries(chordPatterns)) {
                        if (pattern.intervals.length <= intervals.length) {
                            let matchCount = 0;
                            for (const patternInterval of pattern.intervals) {
                                if (intervals.includes(patternInterval)) {
                                    matchCount++;
                                }
                            }
                            if (matchCount >= pattern.intervals.length * 0.75) {
                                const rootNote = semitoneToNote[root];
                                return {
                                    root: rootNote,
                                    type: chordType,
                                    symbol: pattern.symbol,
                                    name: pattern.name,
                                    notes: noteNames,
                                    partial: true
                                };
                            }
                        }
                    }
                }
            }
            return null;
        }
        // 和音の検出と表示
        function analyzeHarmony() {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            const sampleRate = audioContext.sampleRate;
            const peakFrequencies = detectPeakFrequencies(dataArray, sampleRate);
            const notes = peakFrequencies
                .map(freq => frequencyToNote(freq))
                .filter(note => note !== null);
            // 重複を除去
            const uniqueNotes = notes.reduce((acc, note) => {
                const key = note.note;
                if (!acc.find(n => n.note === key)) {
                    acc.push(note);
                }
                return acc;
            }, []);
            // 音階を表示
            noteDisplay.innerHTML = uniqueNotes
                .map(note => `<div class="note">${note.note}${note.octave}</div>`)
                .join('');
            // コードを判定
            const chord = identifyChord(uniqueNotes);
            if (chord && chord.root) {
                // ♭と♯の表示を調整
                let displayRoot = chord.root.replace('#', '♯').replace('b', '♭');
                chordName.textContent = displayRoot + chord.symbol;
                chordType.textContent = chord.name + (chord.partial ? ' (推定)' : '');
            } else {
                chordName.textContent = '-';
                chordType.textContent = '判定できません';
            }
            // 周波数スペクトラムを描画
            drawFrequencySpectrum();
            return { notes: uniqueNotes, chord: chord, rawData: dataArray.slice() };
        }
        // 周波数スペクトラムの描画
        function drawFrequencySpectrum() {
            freqCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            freqCtx.fillRect(0, 0, frequencyCanvas.width, frequencyCanvas.height);
            const barWidth = frequencyCanvas.width / bufferLength * 10;
            let x = 0;
            for (let i = 0; i < bufferLength / 10; i++) {
                const barHeight = (dataArray[i] / 255) * frequencyCanvas.height * 0.8;
                const gradient = freqCtx.createLinearGradient(0, frequencyCanvas.height - barHeight, 0, frequencyCanvas.height);
                gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
                gradient.addColorStop(1, 'rgba(118, 75, 162, 0.3)');
                freqCtx.fillStyle = gradient;
                freqCtx.fillRect(x, frequencyCanvas.height - barHeight, barWidth - 1, barHeight);
                x += barWidth;
            }
        }
        // ループ用のバッファを作成
        function createLoopBuffer(duration = 0.1) {
            if (!audioBuffer || !audioContext) return null;
            const sampleRate = audioContext.sampleRate;
            const loopDuration = Math.min(duration, audioBuffer.duration - pauseTime);
            const startSample = Math.floor(pauseTime * sampleRate);
            const endSample = Math.floor((pauseTime + loopDuration) * sampleRate);
            const length = endSample - startSample;
            const newBuffer = audioContext.createBuffer(
                audioBuffer.numberOfChannels,
                length,
                sampleRate
            );
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                const sourceData = audioBuffer.getChannelData(channel);
                const targetData = newBuffer.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    targetData[i] = sourceData[startSample + i];
                }
            }
            return newBuffer;
        }
        // ファイル選択イベント
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // ファイルタイプの確認
            const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/mp4'];
            const fileType = file.type.toLowerCase();
            
            // MIMEタイプが空の場合は拡張子で判断
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'mp4'];
            
            if (!validTypes.includes(fileType) && !validExtensions.includes(fileExtension)) {
                showError('対応していないファイル形式です。MP3、WAV、OGG、M4A、AACファイルを選択してください。');
                return;
            }
            
            try {
                loading.style.display = 'block';
                errorDiv.style.display = 'none';
                info.textContent = `読み込み中: ${file.name}`;
                
                initAudioContext();
                
                // モバイルでのAudioContext resume
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }
                
                // ファイルサイズチェック（モバイル用）
                const maxSize = 100 * 1024 * 1024; // 100MB
                if (file.size > maxSize) {
                    loading.style.display = 'none';
                    showError('ファイルサイズが大きすぎます。100MB以下のファイルを選択してください。');
                    return;
                }
                
                const arrayBuffer = await file.arrayBuffer();
                
                // デコードエラーハンドリング
                try {
                    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                } catch (decodeError) {
                    // フォールバック: 別の方法でデコードを試みる
                    console.warn('Initial decode failed, trying fallback:', decodeError);
                    
                    // ArrayBufferをコピー（一部のブラウザで必要）
                    const bufferCopy = arrayBuffer.slice(0);
                    audioBuffer = await audioContext.decodeAudioData(bufferCopy);
                }
                
                loading.style.display = 'none';
                info.textContent = `準備完了: ${file.name}`;
                playBtn.disabled = false;
                pauseBtn.disabled = true;
                freezeBtn.disabled = true;
                
                // リセット
                if (source) {
                    source.stop();
                    source.disconnect();
                }
                if (loopSource) {
                    loopSource.stop();
                    loopSource.disconnect();
                }
                isPlaying = false;
                isFrozen = false;
                pauseTime = 0;
                harmonyOverlay.classList.remove('active');
                freezeBtn.classList.remove('active');
                
                // モバイルでの成功フィードバック
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
                
            } catch (error) {
                loading.style.display = 'none';
                console.error('Audio loading error:', error);
                
                if (error.name === 'NotSupportedError') {
                    showError('このファイル形式はお使いのブラウザでサポートされていません。別の形式（MP3など）をお試しください。');
                } else if (error.name === 'EncodingError') {
                    showError('音楽ファイルのデコードに失敗しました。ファイルが破損している可能性があります。');
                } else {
                    showError('音楽ファイルの読み込みに失敗しました: ' + error.message);
                }
            }
        });
        // モバイルでのファイル選択を改善
        fileInput.addEventListener('click', (e) => {
            // iOSでのファイル選択ダイアログの問題を回避
            e.target.value = null;
        });
        // 再生ボタン
        playBtn.addEventListener('click', async () => {
            if (!audioBuffer) return;
            try {
                // モバイルでのAudioContext初期化
                if (!audioContext) {
                    initAudioContext();
                }
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }
                // フリーズ状態を解除
                if (isFrozen) {
                    isFrozen = false;
                    freezeBtn.classList.remove('active');
                    harmonyOverlay.classList.remove('active');
                    if (loopSource) {
                        loopSource.stop();
                        loopSource.disconnect();
                    }
                }
                source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                const offset = pauseTime;
                source.start(0, offset);
                startTime = audioContext.currentTime - offset;
                isPlaying = true;
                playBtn.disabled = true;
                pauseBtn.disabled = false;
                freezeBtn.disabled = false;
                source.onended = () => {
                    if (isPlaying) {
                        isPlaying = false;
                        playBtn.disabled = false;
                        pauseBtn.disabled = true;
                        freezeBtn.disabled = true;
                        pauseTime = 0;
                        cancelAnimationFrame(animationId);
                    }
                };
                visualize();
            } catch (error) {
                showError('再生エラー: ' + error.message);
                console.error('Playback error:', error);
            }
        });
        // 一時停止ボタン
        pauseBtn.addEventListener('click', () => {
            if (!isPlaying || !source) return;
            
            pauseTime = audioContext.currentTime - startTime;
            source.stop();
            source.disconnect();
            
            isPlaying = false;
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            
            // 一時停止時に和音を分析
            const harmonyData = analyzeHarmony();
            harmonyOverlay.classList.add('active');
            frozenData = harmonyData;
            
            cancelAnimationFrame(animationId);
        });
        // 音声固定ボタン
        freezeBtn.addEventListener('click', () => {
            if (!frozenData || isPlaying) return;
            
            isFrozen = !isFrozen;
            freezeBtn.classList.toggle('active');
            
            if (isFrozen) {
                // ループ再生開始
                loopBuffer = createLoopBuffer(0.2); // 0.2秒のループ
                if (loopBuffer) {
                    playLoop();
                }
            } else {
                // ループ再生停止
                if (loopSource) {
                    loopSource.stop();
                    loopSource.disconnect();
                }
            }
        });
        // ループ再生
        function playLoop() {
            if (!loopBuffer || !isFrozen) return;
            
            loopSource = audioContext.createBufferSource();
            loopSource.buffer = loopBuffer;
            loopSource.loop = true;
            loopSource.connect(audioContext.destination);
            loopSource.start();
        }
        // 感度スライダー
        sensitivitySlider.addEventListener('input', (e) => {
            sensitivity = parseFloat(e.target.value);
            sensitivityValue.textContent = sensitivity.toFixed(1);
        });
        // ビジュアライゼーションモード切り替え
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                visualizationMode = e.target.dataset.mode;
            });
        });
        // ビジュアライゼーション
        function visualize() {
            animationId = requestAnimationFrame(visualize);
            
            if (!isFrozen) {
                analyser.getByteFrequencyData(dataArray);
            } else if (frozenData && frozenData.rawData) {
                // フリーズ時は保存されたデータを使用
                dataArray = new Uint8Array(frozenData.rawData);
            }
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            switch (visualizationMode) {
                case 'bars':
                    drawBars();
                    break;
                case 'circle':
                    drawCircle();
                    break;
                case 'wave':
                    drawWave();
                    break;
            }
            
            // フリーズ時も和音分析を更新
            if (isFrozen && frozenData) {
                analyzeHarmony();
            }
        }
        // バー表示
        function drawBars() {
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.8 * sensitivity;
                
                const r = (dataArray[i] / 255) * 255;
                const g = 100 + (i / bufferLength) * 155;
                const b = 200;
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        }
        // サークル表示
        function drawCircle() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) * 0.3;
            
            ctx.beginPath();
            
            for (let i = 0; i < bufferLength; i++) {
                const amplitude = (dataArray[i] / 255) * sensitivity;
                const angle = (i / bufferLength) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * (radius + amplitude * 100);
                const y = centerY + Math.sin(angle) * (radius + amplitude * 100);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
            gradient.addColorStop(1, 'rgba(118, 75, 162, 0.3)');
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        // ウェーブ表示
        function drawWave() {
            const tempArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(tempArray);
            
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
            ctx.beginPath();
            
            const sliceWidth = canvas.width / bufferLength;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const v = tempArray[i] / 128.0;
                const y = (v * canvas.height / 2) * sensitivity;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            ctx.stroke();
            
            // グロー効果
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(102, 126, 234, 0.5)';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // エラー表示
        function showError(message) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }

        // マイク入力の開始/停止
        micBtn.addEventListener('click', async () => {
            if (!isMicActive) {
                try {
                    // セキュリティチェック
                    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                        showError('マイク機能を使用するには、HTTPS接続が必要です。\nローカルでテストする場合は、サーバーを起動してlocalhost経由でアクセスしてください。');
                        return;
                    }
                    
                    initAudioContext();
                    
                    // ブラウザの対応チェック
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        showError('お使いのブラウザはマイク入力に対応していません。\nChrome、Firefox、Edge等の最新ブラウザをご利用ください。');
                        return;
                    }
                    
                    // マイクのアクセス許可を要求
                    micStream = await navigator.mediaDevices.getUserMedia({ 
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        } 
                    });
                    
                    // マイクソースを作成
                    micSource = audioContext.createMediaStreamSource(micStream);
                    micSource.connect(analyser);
                    
                    isMicActive = true;
                    micBtn.textContent = '🎤 マイク停止';
                    micBtn.style.background = 'linear-gradient(45deg, #f44336, #e91e63)';
                    micIndicator.classList.add('active');
                    info.textContent = 'マイク入力中...';
                    
                    // 既存の音楽を停止
                    if (isPlaying && source) {
                        source.stop();
                        source.disconnect();
                        isPlaying = false;
                        playBtn.disabled = false;
                        pauseBtn.disabled = true;
                    }
                    
                    // ハーモニー表示を有効化
                    harmonyOverlay.classList.add('active');
                    
                    // ビジュアライゼーション開始
                    if (!animationId) {
                        visualize();
                    }
                    
                    // リアルタイム和音分析開始
                    startRealtimeHarmonyAnalysis();
                    
                } catch (error) {
                    console.error('Mic access error:', error);
                    
                    if (error.name === 'NotAllowedError') {
                        showError('マイクへのアクセスが拒否されました。\nブラウザの設定でマイクの使用を許可してください。');
                    } else if (error.name === 'NotFoundError') {
                        showError('マイクが見つかりません。\nマイクが正しく接続されているか確認してください。');
                    } else if (error.name === 'SecurityError' || error.name === 'TypeError') {
                        showError('セキュリティエラー: この機能を使用するには以下のいずれかが必要です：\n' +
                                '1. HTTPSでアクセスする\n' +
                                '2. localhost または 127.0.0.1 でアクセスする\n' +
                                '3. ローカルサーバーを起動する（例: python -m http.server）');
                    } else {
                        showError('マイクへのアクセスエラー: ' + error.message);
                    }
                }
            } else {
                stopMicInput();
            }
        });

        // マイク入力の停止
        function stopMicInput() {
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
                micStream = null;
            }
            if (micSource) {
                micSource.disconnect();
                micSource = null;
            }
            isMicActive = false;
            micBtn.textContent = '🎤 マイク入力';
            micBtn.style.background = 'linear-gradient(45deg, #00d4ff, #0099cc)';
            micIndicator.classList.remove('active');
            info.textContent = 'マイク入力を停止しました';
            if (!isPlaying) {
                harmonyOverlay.classList.remove('active');
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }

        // リアルタイム和音分析
        function startRealtimeHarmonyAnalysis() {
            if (!isMicActive) return;
            // 定期的に和音を分析
            const analyzeInterval = setInterval(() => {
                if (!isMicActive) {
                    clearInterval(analyzeInterval);
                    return;
                }
                analyzeHarmony();
            }, 100); // 100msごとに分析
        }

        // チューナーモード
        tunerBtn.addEventListener('click', async () => {
            if (!tunerMode) {
                try {
                    // セキュリティチェック
                    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                        showError('チューナー機能を使用するには、HTTPS接続が必要です。\nローカルでテストする場合は、サーバーを起動してlocalhost経由でアクセスしてください。');
                        return;
                    }
                    initAudioContext();
                    // ブラウザの対応チェック
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        showError('お使いのブラウザはマイク入力に対応していません。\nChrome、Firefox、Edge等の最新ブラウザをご利用ください。');
                        return;
                    }
                    if (!micStream) {
                        micStream = await navigator.mediaDevices.getUserMedia({
                            audio: {
                                echoCancellation: false,  // チューナーでは無効化
                                noiseSuppression: false,  // より正確な周波数検出のため
                                autoGainControl: false
                            }
                        });
                    }
                    if (!micSource) {
                        micSource = audioContext.createMediaStreamSource(micStream);
                        micSource.connect(analyser);
                    }
                    tunerMode = true;
                    tunerOverlay.classList.add('active');
                    startTuner();
                } catch (error) {
                    console.error('Mic access error:', error);
                    if (error.name === 'NotAllowedError') {
                        showError('マイクへのアクセスが拒否されました。\nブラウザの設定でマイクの使用を許可してください。');
                    } else if (error.name === 'NotFoundError') {
                        showError('マイクが見つかりません。\nマイクが正しく接続されているか確認してください。');
                    } else if (error.name === 'SecurityError' || error.name === 'TypeError') {
                        showError('セキュリティエラー: この機能を使用するには以下のいずれかが必要です：\n' +
                                '1. HTTPSでアクセスする\n' +
                                '2. localhost または 127.0.0.1 でアクセスする\n' +
                                '3. ローカルサーバーを起動する（例: python -m http.server）');
                    } else {
                        showError('マイクへのアクセスエラー: ' + error.message);
                    }
                }
            } else {
                closeTuner();
            }
        });

        // A4周波数選択イベント
        if (tunerA4Select) {
            tunerA4Select.addEventListener('change', (e) => {
                tunerA4Frequency = parseFloat(e.target.value);
            });
        }
        // チューナーの開始
        function startTuner() {
            if (!tunerMode) return;
            analyser.getByteFrequencyData(dataArray);
            // ピッチ検出（自己相関法）
            const pitch = detectPitch();
            if (pitch > 0) {
                const noteInfo = frequencyToNote(pitch, tunerA4Frequency);
                if (noteInfo) {
                    tunerNote.textContent = noteInfo.note + noteInfo.octave;
                    tunerFrequency.textContent = pitch.toFixed(1) + ' Hz';
                    // セント値の計算と表示
                    const cents = noteInfo.cents;
                    tunerCents.textContent = (cents > 0 ? '+' : '') + cents.toFixed(0) + ' cents';
                    // インジケーターの位置を更新
                    const position = 50 + (cents / 50) * 45; // ±50セントを画面幅にマップ
                    tunerIndicator.style.left = Math.max(5, Math.min(95, position)) + '%';
                    // 色の変更（チューニングが合っているかどうか）
                    if (Math.abs(cents) < 5) {
                        tunerIndicator.style.background = '#4caf50';
                        tunerNote.style.background = 'linear-gradient(45deg, #4caf50, #8bc34a)';
                        tunerNote.style.webkitBackgroundClip = 'text';
                        tunerNote.style.webkitTextFillColor = 'transparent';
                    } else {
                        tunerIndicator.style.background = '#fff';
                        tunerNote.style.background = 'linear-gradient(45deg, #ff9800, #ff5722)';
                        tunerNote.style.webkitBackgroundClip = 'text';
                        tunerNote.style.webkitTextFillColor = 'transparent';
                    }
                }
            }
            tunerAnimationId = requestAnimationFrame(startTuner);
        }

        // ピッチ検出（自己相関法）
        function detectPitch() {
            const sampleRate = audioContext.sampleRate;
            const bufferSize = analyser.fftSize;
            const buffer = new Float32Array(bufferSize);
            analyser.getFloatTimeDomainData(buffer);
            // 自己相関
            const r = new Array(bufferSize).fill(0);
            for (let i = 0; i < bufferSize; i++) {
                for (let j = 0; j < bufferSize - i; j++) {
                    r[i] += buffer[j] * buffer[j + i];
                }
            }
            // ピーク検出
            let maxValue = 0;
            let bestOffset = -1;
            const minOffset = Math.floor(sampleRate / 800); // 800Hz
            const maxOffset = Math.floor(sampleRate / 80);  // 80Hz
            for (let offset = minOffset; offset < maxOffset; offset++) {
                if (r[offset] > maxValue) {
                    maxValue = r[offset];
                    bestOffset = offset;
                }
            }
            if (bestOffset === -1 || r[0] < 0.01) {
                return -1;
            }
            // 補間でより正確な周波数を計算
            const y1 = r[bestOffset - 1] || 0;
            const y2 = r[bestOffset];
            const y3 = r[bestOffset + 1] || 0;
            const x = (y3 - y1) / (2 * (2 * y2 - y1 - y3));
            return sampleRate / (bestOffset + x);
        }

        // チューナーを閉じる
        function closeTuner() {
            tunerMode = false;
            tunerOverlay.classList.remove('active');
            if (tunerAnimationId) {
                cancelAnimationFrame(tunerAnimationId);
                tunerAnimationId = null;
            }
            // マイク入力も停止（マイクモードでない場合）
            if (!isMicActive) {
                if (micStream) {
                    micStream.getTracks().forEach(track => track.stop());
                    micStream = null;
                }
                if (micSource) {
                    micSource.disconnect();
                    micSource = null;
                }
            }
        }

        // グローバル関数として定義（onclick用）
        window.closeTuner = closeTuner;