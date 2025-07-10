document.addEventListener('DOMContentLoaded', function() {
    const teamMembers = document.querySelectorAll('.team-member');
    const easterEggFoundDiv = document.querySelector('.easter-egg-found');
    const easterEggMessage = document.querySelector('.easter-egg-message');
    const easterEggCounter = document.querySelector('.easter-egg-counter');
    const secretButton = document.querySelector('.secret-button');
    const bars = document.querySelectorAll('.audio-visualizer .bar');

    // Ініціалізація міні-гри
    const friendImage = document.getElementById('friend-image');
    const effectContainer = document.getElementById('effect-container');
    const reactionText = document.getElementById('reaction-text');
    const punchCount = document.getElementById('punch-count');
    const enduranceProgress = document.getElementById('endurance-progress');
    const gameLevel = document.getElementById('game-level');
    const resetButton = document.getElementById('reset-game');
    const superPunchButton = document.getElementById('super-punch');

    let foundEasterEggs = 0;
    const totalEasterEggs = 7;
    let foundSecrets = new Set();

    // Змінні для міні-гри
    let count = 0;
    let endurance = 100;
    let superPunchAvailable = false;
    let gameActive = true;

    // Хранение текущей активной пасхалки и аудио
    let currentActiveSecret = null;
    let currentAudio = null;

    // Для управления таймерами сообщений
    let messageTimeout = null;

    // Константи для міні-гри (ваші оригінальні)
    const effects = ['💥', '👊', '⚡', '💫', '😵', '🌟', '💢'];
    const reactions = [
        { count: 5, text: "я щас буду матюкать твою маму" },
        { count: 10, text: "я щас буду матюкать твою маму" },
        { count: 20, text: "я щас буду матюкать твою маму" },
        { count: 30, text: "я щас буду матюкать твою маму" },
        { count: 40, text: "остановись пж" },
        { count: 50, text: "я начина. злится" },
        { count: 60, text: "месть!" },
        { count: 75, text: "я щас заплачу" },
        { count: 90, text: "я тебя запомнил" },
        { count: 100, text: "сдаюсь" }
    ];

    const levels = [
        { count: 0, name: "лох" },
        { count: 10, name: "новичок" },
        { count: 15, name: "средничок" },
        { count: 20, name: "про" },
        { count: 25, name: "эксперт" },
        { count: 33, name: "OBLADAET" }
    ];

    // Створення стилів для ефектів
    function createGameStyles() {
        if (!document.getElementById('game-effects-styles')) {
            const style = document.createElement('style');
            style.id = 'game-effects-styles';
            style.innerHTML = `
                .effect {
                    position: absolute;
                    font-size: 2rem;
                    font-weight: bold;
                    pointer-events: none;
                    z-index: 1000;
                    animation: effectBurst 1s ease-out forwards;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                }
                
                @keyframes effectBurst {
                    0% {
                        transform: scale(0.5) rotate(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.2) rotate(180deg);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(0.8) rotate(360deg) translateY(-50px);
                        opacity: 0;
                    }
                }
                
                .friend-hit {
                    animation: friendShake 0.3s ease-in-out;
                    filter: brightness(1.3) hue-rotate(30deg);
                }
                
                @keyframes friendShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px) rotate(-2deg); }
                    75% { transform: translateX(5px) rotate(2deg); }
                }
                
                .screen-shake {
                    animation: screenShake 0.5s ease-in-out;
                }
                
                @keyframes screenShake {
                    0%, 100% { transform: translateX(0); }
                    10% { transform: translateX(-5px); }
                    20% { transform: translateX(5px); }
                    30% { transform: translateX(-3px); }
                    40% { transform: translateX(3px); }
                    50% { transform: translateX(-2px); }
                    60% { transform: translateX(2px); }
                    70% { transform: translateX(-1px); }
                    80% { transform: translateX(1px); }
                    90% { transform: translateX(0); }
                }
                
                .reaction-visible {
                    animation: reactionPop 0.5s ease-out;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                
                @keyframes reactionPop {
                    0% { 
                        transform: scale(0.5) translateY(20px);
                        opacity: 0;
                    }
                    50% { 
                        transform: scale(1.1) translateY(-5px);
                        opacity: 1;
                    }
                    100% { 
                        transform: scale(1) translateY(0);
                        opacity: 1;
                    }
                }
                
                .super-punch-effect {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100px;
                    height: 100px;
                    border: 3px solid #ff6b35;
                    border-radius: 50%;
                    animation: superPunchRing 0.6s ease-out forwards;
                    pointer-events: none;
                    z-index: 999;
                }
                
                @keyframes superPunchRing {
                    0% {
                        width: 20px;
                        height: 20px;
                        opacity: 1;
                        border-width: 5px;
                    }
                    100% {
                        width: 200px;
                        height: 200px;
                        opacity: 0;
                        border-width: 1px;
                    }
                }
                
                .combo-effect {
                    position: absolute;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: #ff6b35;
                    font-size: 1.5rem;
                    font-weight: bold;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                    animation: comboFloat 2s ease-out forwards;
                    pointer-events: none;
                    z-index: 1001;
                }
                
                @keyframes comboFloat {
                    0% {
                        transform: translateX(-50%) scale(0.5);
                        opacity: 0;
                    }
                    20% {
                        transform: translateX(-50%) scale(1.2);
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(-50%) scale(1) translateY(-30px);
                        opacity: 0;
                    }
                }
                
                .critical-hit {
                    animation: criticalHit 0.8s ease-out;
                }
                
                @keyframes criticalHit {
                    0% { filter: brightness(1) hue-rotate(0deg) saturate(1); }
                    25% { filter: brightness(2) hue-rotate(90deg) saturate(2); }
                    50% { filter: brightness(1.5) hue-rotate(180deg) saturate(1.5); }
                    75% { filter: brightness(2) hue-rotate(270deg) saturate(2); }
                    100% { filter: brightness(1) hue-rotate(360deg) saturate(1); }
                }
                
                .damage-number {
                    position: absolute;
                    color: #ff3030;
                    font-size: 1.8rem;
                    font-weight: bold;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                    animation: damageNumber 1.2s ease-out forwards;
                    pointer-events: none;
                    z-index: 1002;
                }
                
                @keyframes damageNumber {
                    0% {
                        transform: scale(0.5) translateY(0);
                        opacity: 1;
                    }
                    30% {
                        transform: scale(1.3) translateY(-10px);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1) translateY(-40px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Анимация для аудио-визуализатора
    function animateVisualizer() {
        if (bars.length > 0) {
            bars.forEach(bar => {
                const height = Math.floor(Math.random() * 20) + 5;
                bar.style.height = `${height}px`;
            });
        }
    }

    // Запуск анимации визуализатора
    setInterval(animateVisualizer, 100);

    // Функції для міні-гри
    function createEffect(x, y, isSuper = false) {
        if (!effectContainer) return;

        const effectsToUse = isSuper ? ['💥', '🔥', '⚡', '💯', '🌟'] : effects;
        const effect = document.createElement('div');
        effect.classList.add('effect');
        effect.textContent = effectsToUse[Math.floor(Math.random() * effectsToUse.length)];
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';

        if (isSuper) {
            effect.style.fontSize = '3rem';
            effect.style.color = '#ff6b35';
        }

        effectContainer.appendChild(effect);

        setTimeout(() => {
            if (effect.parentNode) {
                effect.remove();
            }
        }, 1000);
    }

    function createDamageNumber(x, y, damage) {
        if (!effectContainer) return;

        const damageEl = document.createElement('div');
        damageEl.classList.add('damage-number');
        damageEl.textContent = `-${damage}`;
        damageEl.style.left = x + 'px';
        damageEl.style.top = y + 'px';

        effectContainer.appendChild(damageEl);

        setTimeout(() => {
            if (damageEl.parentNode) {
                damageEl.remove();
            }
        }, 1200);
    }

    function createSuperPunchEffect() {
        if (!friendImage || !effectContainer) return;

        const ring = document.createElement('div');
        ring.classList.add('super-punch-effect');
        effectContainer.appendChild(ring);

        setTimeout(() => {
            if (ring.parentNode) {
                ring.remove();
            }
        }, 600);
    }

    function createComboEffect(comboCount) {
        if (!effectContainer) return;

        const combo = document.createElement('div');
        combo.classList.add('combo-effect');
        combo.textContent = `COMBO x${comboCount}!`;
        effectContainer.appendChild(combo);

        setTimeout(() => {
            if (combo.parentNode) {
                combo.remove();
            }
        }, 2000);
    }

    function checkReactions() {
        for (let reaction of reactions) {
            if (count === reaction.count) {
                showGameReaction(reaction.text);
                break;
            }
        }
    }

    function showGameReaction(text) {
        if (!reactionText) return;

        // Очищаем предыдущий таймаут
        if (reactionText.timeoutId) {
            clearTimeout(reactionText.timeoutId);
        }

        reactionText.textContent = text;
        reactionText.classList.remove('reaction-visible');

        // Принудительно перезапускаем анимацию
        setTimeout(() => {
            reactionText.classList.add('reaction-visible');
        }, 50);

        // Устанавливаем таймаут для скрытия (увеличено до 8 секунд)
        reactionText.timeoutId = setTimeout(() => {
            reactionText.classList.remove('reaction-visible');
        }, 8000);
    }

    function updateLevel() {
        if (!gameLevel) return;

        let currentLevel = "Новачок";

        for (let i = levels.length - 1; i >= 0; i--) {
            if (count >= levels[i].count) {
                currentLevel = levels[i].name;
                break;
            }
        }

        gameLevel.textContent = currentLevel;

        // Логирование для отладки
        console.log(`Счет: ${count}, Уровень: ${currentLevel}`);
    }

    function addScreenShake() {
        document.body.classList.add('screen-shake');
        setTimeout(() => {
            document.body.classList.remove('screen-shake');
        }, 500);
    }

    // Функция для сброса всех эффектов члена команды
    function resetMemberEffects(element) {
        element.style.backgroundColor = '';
        element.style.transform = '';
        element.style.boxShadow = '';
        element.style.border = '';
        element.style.background = '';
        element.style.color = '';

        element.classList.remove('shake-animation', 'ipad-rotate', 'revo-mode',
            'dormitory-style', 'dead-inside');

        const p = element.querySelector('p');
        if (p) {
            p.innerHTML = element.getAttribute('data-original-title') || '';
            p.style = '';
        }

        const h2 = element.querySelector('h2');
        if (h2) {
            h2.innerHTML = element.getAttribute('data-original-name') || h2.textContent;
            h2.style = '';
        }

        const overlay = element.querySelector('.overlay');
        if (overlay) {
            overlay.style.background = '';
            overlay.style.opacity = '';
        }
    }

    // Функция для остановки текущего аудио
    function stopCurrentAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
    }

    // Функция для сброса всех активных пасхалок
    function resetAllActiveSecrets() {
        if (currentActiveSecret) {
            const activeElement = document.querySelector(`[data-secret="${currentActiveSecret}"]`);
            if (activeElement) {
                resetMemberEffects(activeElement);
            }

            document.body.classList.remove('sc-rapper-mode');

            if (document.querySelector('.hidden-crown')) {
                document.querySelector('.hidden-crown').style.display = '';
                document.querySelector('.hidden-crown').style.color = '';
            }

            stopCurrentAudio();
            currentActiveSecret = null;
        }
    }

    // Сохраняем оригинальные значения текста
    teamMembers.forEach(member => {
        const h2 = member.querySelector('h2');
        const p = member.querySelector('p');

        if (h2) member.setAttribute('data-original-name', h2.textContent);
        if (p) member.setAttribute('data-original-title', p.textContent);
    });

    // Музыкальные треки для каждой пасхалки
    const tracks = {
        'music': 'banana_song.mp3',
        'game': 'rage_song.mp3',
        'code': 'revo_hookah_song.mp3',
        'camera': 'ipad_tech_song.mp3',
        'palette': 'obshaga_rap.mp3',
        'bulb': 'dead_inside_song.mp3',
        'footer-secret': 'skrrrt_beat.mp3'
    };

    // Пасхалки
    const secrets = {
        'music': {
            trigger: 'click',
            message: 'УУУУУ МИНЬОНЫ БАНАНА! ТРУБАААА,БЕНЕН КИНГ🍌👑',
            action: function(element) {
                resetAllActiveSecrets();
                const img = element.querySelector('img');
                element.style.backgroundColor = '#FFEB3B';
                const p = element.querySelector('p');
                p.innerHTML = '<span style="font-size: 20px;">🍌 BANANA GANG 🍌</span>';
                element.style.transform = 'rotate(3deg)';

                const overlay = element.querySelector('.overlay');
                overlay.style.background = 'linear-gradient(to top, rgba(255, 235, 59, 0.8), transparent)';

                playSound(tracks.music);
                return 'music';
            }
        },
        'game': {
            trigger: 'click',
            message: 'СДОХНИ-СДОХНИ-СДОХНИ! СДОХНИ ТВАРЬ! РАААААГГЕЕЕЕ! 🔥💀',
            action: function(element) {
                resetAllActiveSecrets();
                const h2 = element.querySelector('h2');
                h2.innerHTML = 'ПУРИК: <span style="color:red;">СДОХНИ!!!</span>';
                element.classList.add('shake-animation');
                const p = element.querySelector('p');
                p.innerHTML = '<span style="font-size: 18px;">💀 RAGE MACHINE 💀</span>';
                element.style.border = '3px solid red';

                const overlay = element.querySelector('.overlay');
                overlay.style.background = 'linear-gradient(to top, rgba(255, 0, 0, 0.5), transparent)';

                playSound(tracks.game);
                return 'game';
            }
        },
        'code': {
            trigger: 'click',
            message: 'СОНЯ ОТКРЫЛА СВОЙ REVO! ОЛЕГ БЕРЕГИСЬ! 💨🌬️',
            action: function(element) {
                resetAllActiveSecrets();
                element.classList.add('revo-mode');
                const p = element.querySelector('p');
                p.innerHTML = '<span style="font-size: 16px;">💨 REVO HOOKAH QUEEN 💨</span>';
                element.style.transform = 'rotate(-2deg)';

                const overlay = element.querySelector('.overlay');
                overlay.style.background = 'linear-gradient(to top, rgba(75, 0, 130, 0.7), transparent)';
                overlay.style.opacity = '1';

                playSound(tracks.code);
                return 'code';
            }
        },
        'camera': {
            trigger: 'click',
            message: 'айпадик реальный сваг, играет в клеш рояль даже во сне! 📱✨',
            action: function(element) {
                resetAllActiveSecrets();
                element.classList.add('ipad-rotate');
                element.style.boxShadow = '0 0 20px rgba(0, 195, 255, 0.8)';
                const p = element.querySelector('p');
                p.innerHTML = '<span style="font-size: 16px;">📱 IPAD KID SWAG 📱</span>';

                const overlay = element.querySelector('.overlay');
                overlay.style.background = 'linear-gradient(to top, rgba(0, 122, 255, 0.5), transparent)';

                playSound(tracks.camera);
                return 'camera';
            }
        },
        'palette': {
            trigger: 'click',
            message: 'максим дропнул новый трек про кроликов! Доширак-флекс, душ раз в неделю, вписки 24/7! 🏠🎵',
            action: function(element) {
                resetAllActiveSecrets();
                const h2 = element.querySelector('h2');
                h2.innerHTML = 'МАКСИМ а.к.а BUNNY LOVER';
                element.classList.add('dormitory-style');
                const p = element.querySelector('p');
                p.innerHTML = '<span style="font-size: 16px;">🏠 DOSHIRAK GANG 🏠</span>';

                const overlay = element.querySelector('.overlay');
                overlay.style.background = 'linear-gradient(to top, rgba(78, 40, 18, 0.7), transparent)';

                playSound(tracks.palette);
                return 'palette';
            }
        },
        'bulb': {
            trigger: 'click',
            message: 'никитка – настоящий пацик! EEEEEEE 2holis! 💀🎤',
            action: function(element) {
                resetAllActiveSecrets();
                element.classList.add('dead-inside');
                const p = element.querySelector('p');
                p.innerHTML = '<span style="font-size: 18px;">💀 DEAD INSIDE 1000-7 💀</span>';
                element.style.background = 'linear-gradient(to bottom, #000, #333)';
                element.style.color = 'white';

                const overlay = element.querySelector('.overlay');
                overlay.style.background = 'linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))';
                overlay.style.opacity = '1';

                playSound(tracks.bulb);
                return 'bulb';
            }
        },
        'footer-secret': {
            trigger: 'click',
            message: 'ШЕЕЕШ! Ты нашел секретную фишку! Теперь сайт в стиле СК РЕПЕРОВ! SKRRRT! 🔥💯',
            action: function() {
                resetAllActiveSecrets();
                document.body.classList.add('sc-rapper-mode');

                if (document.querySelector('.hidden-crown')) {
                    document.querySelector('.hidden-crown').style.display = 'block';
                    document.querySelector('.hidden-crown').style.color = 'gold';
                }

                bars.forEach(bar => {
                    bar.style.backgroundColor = 'gold';
                });

                playSound(tracks['footer-secret']);
                return 'footer-secret';
            }
        }
    };

    // Функция для проигрывания звука
    function playSound(soundFile) {
        stopCurrentAudio();
        try {
            currentAudio = new Audio(soundFile);
            currentAudio.volume = 0.3;
            currentAudio.loop = true;

            currentAudio.play().catch(e => {
                console.log('Не удалось воспроизвести звук:', e);
            });

            currentAudio.addEventListener('playing', function() {
                document.body.classList.add('music-playing');
            });

        } catch (e) {
            console.log('Звук не найден или не поддерживается');
        }
    }

    // Функция для отображения сообщения о найденной/скрытой пасхалке
    function showEasterEggMessage(message, isFound = true) {
        if (messageTimeout) {
            clearTimeout(messageTimeout);
            messageTimeout = null;
        }

        easterEggMessage.innerHTML = message;

        const heading = easterEggFoundDiv.querySelector('h3');
        if (heading) {
            heading.textContent = isFound ? 'ПАСХАЛКА НАЙДЕНА!' : 'ПАСХАЛКА СКРЫТА!';
        }

        ensureAnimationStyles();
        easterEggFoundDiv.style.display = 'none';

        setTimeout(() => {
            easterEggFoundDiv.style.display = 'block';
            easterEggFoundDiv.classList.remove('hidden');
            easterEggFoundDiv.style.animation = 'easterEggSlideUp 0.5s ease-out forwards';

            messageTimeout = setTimeout(() => {
                easterEggFoundDiv.style.animation = 'easterEggSlideDown 0.5s ease-in forwards';
                messageTimeout = setTimeout(() => {
                    easterEggFoundDiv.classList.add('hidden');
                    messageTimeout = null;
                }, 500);
            }, 5000);
        }, 50);
    }

    // Функция для создания стилей анимации
    function ensureAnimationStyles() {
        if (!document.getElementById('easter-egg-animations')) {
            const style = document.createElement('style');
            style.id = 'easter-egg-animations';
            style.innerHTML = `
                @keyframes easterEggSlideUp {
                    from { transform: translate(-50%, 100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                @keyframes easterEggSlideDown {
                    from { transform: translate(-50%, 0); opacity: 1; }
                    to { transform: translate(-50%, 100%); opacity: 0; }
                }
                
                .easter-egg-found {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80%;
                    max-width: 500px;
                    z-index: 1000;
                    background: rgba(10, 10, 10, 0.95);
                    border-radius: 10px;
                    border-left: 5px solid var(--sc-orange);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    transform-origin: center bottom;
                    display: block;
                }
                
                .easter-egg-found.hidden {
                    display: none;
                }
                
                .easter-egg-message {
                    font-size: 16px;
                    line-height: 1.4;
                    margin: 10px 0;
                    padding: 0 15px;
                    overflow-wrap: break-word;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Функция для обновления счетчика найденных пасхалок
    function updateEasterEggCounter() {
        foundEasterEggs = foundSecrets.size;
        easterEggCounter.innerHTML = '';
        easterEggCounter.textContent = foundEasterEggs;

        easterEggCounter.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            easterEggCounter.style.animation = '';
        }, 500);

        if (foundEasterEggs === totalEasterEggs) {
            showEasterEggMessage('ШЕЕЕЕШ! ТЫ НАШЕЛ ВСЕ ПАСХАЛКИ! АБСОЛЮТНЫЙ ФЛЕКС! 💯🔥👑', true);
            document.body.classList.add('swag-mode');
            playSpecialSound('victory.mp3');

            bars.forEach(bar => {
                bar.style.backgroundColor = 'gold';
                bar.style.boxShadow = '0 0 10px gold';
            });
        }
    }

    // Функция для проигрывания специальных звуков
    function playSpecialSound(soundFile) {
        try {
            const audio = new Audio(soundFile);
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Не удалось воспроизвести звук:', e));
        } catch (e) {
            console.log('Звук не найден или не поддерживается');
        }
    }

    // Инициализация стилей
    createGameStyles();

    // Обработчики событий для пасхалок
    teamMembers.forEach(member => {
        const secret = member.dataset.secret;
        if (secrets[secret]) {
            member.addEventListener('click', function() {
                const isThisActive = currentActiveSecret === secret;

                if (isThisActive) {
                    resetAllActiveSecrets();
                    showEasterEggMessage(`Пасхалка скрыта! Кликни снова, чтобы активировать.`, false);
                } else {
                    const activatedSecret = secrets[secret].action(member);
                    currentActiveSecret = activatedSecret;

                    if (!foundSecrets.has(secret)) {
                        foundSecrets.add(secret);
                        updateEasterEggCounter();
                        showEasterEggMessage(secrets[secret].message, true);

                        bars.forEach(bar => {
                            bar.style.backgroundColor = '#ff5500';
                            setTimeout(() => {
                                if (currentActiveSecret === secret) {
                                    bar.style.backgroundColor = '';
                                }
                            }, 1000);
                        });
                    } else {
                        showEasterEggMessage(`Пасхалка "${secret}" активирована!`, true);
                    }
                }
            });
        }
    });

    // Обработчик для секретной кнопки
    if (secretButton && secrets['footer-secret']) {
        secretButton.addEventListener('click', function() {
            const isThisActive = currentActiveSecret === 'footer-secret';

            if (isThisActive) {
                resetAllActiveSecrets();
                showEasterEggMessage(`Секретная кнопка деактивирована!`, false);
            } else {
                const activatedSecret = secrets['footer-secret'].action();
                currentActiveSecret = activatedSecret;

                if (!foundSecrets.has('footer-secret')) {
                    foundSecrets.add('footer-secret');
                    updateEasterEggCounter();
                    showEasterEggMessage(secrets['footer-secret'].message, true);
                } else {
                    showEasterEggMessage(`Секретная фишка активирована!`, true);
                }
            }
        });
    }

    // Обработчики для міні-гри
    if (friendImage) {
        friendImage.addEventListener('click', function (e) {
            if (!gameActive) return;

            const rect = friendImage.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            count++;
            const damage = Math.floor(Math.random() * 5) + 1;

            if (punchCount) punchCount.textContent = count;

            endurance = Math.max(0, endurance - damage);
            if (enduranceProgress) enduranceProgress.style.width = endurance + '%';

            // Визуальные эффекты
            friendImage.classList.add('friend-hit');
            setTimeout(() => friendImage.classList.remove('friend-hit'), 300);

            // Критический удар (10% шанс)
            const isCritical = Math.random() < 0.1;
            if (isCritical) {
                friendImage.classList.add('critical-hit');
                setTimeout(() => friendImage.classList.remove('critical-hit'), 800);
                addScreenShake();
            }

            createEffect(x, y, isCritical);
            createDamageNumber(x, y, damage);

            // Комбо эффект
            if (count % 10 === 0) {
                createComboEffect(Math.floor(count / 10));
            }

            // Обязательно вызываем обновление уровня
            updateLevel();
            checkReactions();

            // Проверка супер-удара
            if (count % 25 === 0) {
                superPunchAvailable = true;
                if (superPunchButton) {
                    superPunchButton.disabled = false;
                    console.log('Супер-удар доступен!');
                }
            }

            if (endurance <= 0 && gameActive) {
                gameActive = false;
                showGameReaction("я...проиграл?!");
                friendImage.style.filter = 'grayscale(100%)';
            }
        });
    }

    if (superPunchButton) {
        superPunchButton.addEventListener('click', function () {
            console.log('Супер-удар кнопка нажата!', { superPunchAvailable, gameActive });

            if (!superPunchAvailable || !gameActive) {
                console.log('Супер-удар недоступен');
                return;
            }

            count += 10;
            const damage = 15;

            if (punchCount) punchCount.textContent = count;

            endurance = Math.max(0, endurance - damage);
            if (enduranceProgress) enduranceProgress.style.width = endurance + '%';

            if (friendImage) {
                friendImage.classList.add('friend-hit', 'critical-hit');
                setTimeout(() => {
                    friendImage.classList.remove('friend-hit', 'critical-hit');
                }, 800);
            }

            // Супер эффекты
            createSuperPunchEffect();
            addScreenShake();

            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const x = Math.random() * (friendImage?.offsetWidth || 100);
                    const y = Math.random() * (friendImage?.offsetHeight || 100);
                    createEffect(x, y, true);
                }, i * 100);
            }

            // Центральный урон
            const centerX = (friendImage?.offsetWidth || 100) / 2;
            const centerY = (friendImage?.offsetHeight || 100) / 2;
            createDamageNumber(centerX, centerY, damage);

            showGameReaction("УДАР СО СПИНЫ?");

            // Сброс супер-удара
            superPunchAvailable = false;
            superPunchButton.disabled = true;

            // Обязательно обновляем уровень
            updateLevel();
            checkReactions();

            if (endurance <= 0 && gameActive) {
                gameActive = false;
                showGameReaction("я...проиграл?");
                if (friendImage) friendImage.style.filter = 'grayscale(100%)';
            }
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', function () {
            count = 0;
            endurance = 100;
            gameActive = true;
            superPunchAvailable = false;

            if (punchCount) punchCount.textContent = "0";
            if (enduranceProgress) enduranceProgress.style.width = '100%';
            if (gameLevel) gameLevel.textContent = "новичок";
            if (friendImage) friendImage.style.filter = '';
            if (superPunchButton) superPunchButton.disabled = true;

            showGameReaction("РЕВАНШ!");

            // Принудительно скрываем реакцию через 5 секунд
            setTimeout(() => {
                if (reactionText) {
                    reactionText.classList.remove('reaction-visible');
                }
            }, 5000);
        });
    }

    // Ініціалізація анімації
    setTimeout(() => {
        document.body.classList.add('init-animation');
        setTimeout(() => {
            document.body.classList.remove('init-animation');
        }, 1000);
    }, 100);
});
// Quiz System (замінити попередню версію)
const quizData = [
    {
        question: "Кто с команды любит миньйонов?",
        answers: ["Соня", "Максим", "Пурик", "Олег"],
        correct: 3,
        member: "music"
    },
    {
        question: "Кто сказал бы: 'СДОХНИ ТВАРЬ!'?",
        answers: ["Никита", "Пурік", "Соня", "Олег"],
        correct: 1,
        member: "game"
    },
    {
        question: "Кто с команды експерт по ревчикам?",
        answers: ["Никита", "Соня", "Олег", "Максим"],
        correct: 1,
        member: "code"
    },
    {
        question: "Кто самый нищук в клеш рояле?",
        answers: ["Максим", "Айпад", "Олег", "Пурік"],
        correct: 1,
        member: "camera"
    },
    {
        question: "Кто любитель кроликов?",
        answers: ["Максим", "Айпад", "Никита", "Пурік"],
        correct: 0,
        member: "palette"
    },
    {
        question: "Кто самая толстая девочка в новоселице ?",
        answers: ["НАС ПП", "сашалесби", "лера", "дашапоп"],
        correct: 0,
        member: "bulb"
    },
    {
        question: "Кого хотел бить айскуб?",
        answers: ["Олег", "Пурік", "Соня", "Никита"],
        correct: 0,
        member: "game"
    },
    {
        question: "У кого дом стал нашим общим домом?",
        answers: ["Максим", "Пурік", "Нікіта", "Олег"],
        correct: 2,
        member: "bulb"
    },
    {
        question: "Кто из нас каждую гулянку покупает бестшот?",
        answers: ["Олег", "Никита", "Максим", "Пурик"],
        correct: 1,
        member: "camera"
    },
    {
        question: "Кто спасёт соню от ревчика?",
        answers: ["Максим", "Олег", "Пурик", "Нікіта"],
        correct: 1,
        member: "code"
    }
];

let currentQuizQuestion = 0;
let quizScore = 0;
let quizQuestions = [];
const TOTAL_QUESTIONS = 10;

const quizModal = document.getElementById('team-quiz');
const quizTrigger = document.getElementById('quiz-trigger');
const quizClose = document.querySelector('.quiz-close');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const scoreDisplay = document.getElementById('score');
const quizResult = document.getElementById('quiz-result');
const finalScore = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-quiz');

// Відкрити квіз
if (quizTrigger) {
    quizTrigger.addEventListener('click', startQuiz);
}
if (quizClose) {
    quizClose.addEventListener('click', closeQuiz);
}
if (restartBtn) {
    restartBtn.addEventListener('click', startQuiz);
}

if (quizModal) {
    quizModal.addEventListener('click', (e) => {
        if (e.target === quizModal) closeQuiz();
    });
}

function startQuiz() {
    console.log('Квіз запущено!');
    currentQuizQuestion = 0;
    quizScore = 0;
    quizQuestions = shuffleArray([...quizData]).slice(0, TOTAL_QUESTIONS);

    if (quizModal) quizModal.style.display = 'block';
    if (quizResult) quizResult.style.display = 'none';

    const quizGame = document.getElementById('quiz-game');
    if (quizGame) quizGame.style.display = 'block';

    updateQuizScore();
    showQuizQuestion();
}

function closeQuiz() {
    if (quizModal) quizModal.style.display = 'none';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showQuizQuestion() {
    const question = quizQuestions[currentQuizQuestion];
    console.log(`Питання ${currentQuizQuestion + 1}:`, question.question);

    if (questionText) {
        questionText.textContent = question.question;
    }

    if (answersContainer) {
        answersContainer.innerHTML = '';

        question.answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = answer;
            btn.addEventListener('click', () => selectQuizAnswer(index, question.correct));
            answersContainer.appendChild(btn);
        });
    }
}

function selectQuizAnswer(selected, correct) {
    const buttons = document.querySelectorAll('.answer-btn');

    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === correct) {
            btn.classList.add('correct');
        } else if (index === selected && selected !== correct) {
            btn.classList.add('wrong');
        }
    });

    if (selected === correct) {
        quizScore++;
        console.log('Правильно! Рахунок:', quizScore);
    }

    setTimeout(() => {
        currentQuizQuestion++;
        updateQuizScore();

        if (currentQuizQuestion < TOTAL_QUESTIONS) {
            showQuizQuestion();
        } else {
            showQuizResult();
        }
    }, 1500);
}

function updateQuizScore() {
    if (scoreDisplay) {
        scoreDisplay.textContent = `${quizScore}/${TOTAL_QUESTIONS}`;
        console.log('Оновлено рахунок:', `${quizScore}/${TOTAL_QUESTIONS}`);
    }
}

function showQuizResult() {
    console.log('Показуємо результат. Фінальний рахунок:', quizScore);

    const quizGame = document.getElementById('quiz-game');
    if (quizGame) quizGame.style.display = 'none';
    if (quizResult) quizResult.style.display = 'block';

    let message = '';
    if (quizScore >= 8) message = 'ЛЕГЕНДА! Ти знаєш команду краще всіх! 🏆';
    else if (quizScore >= 6) message = 'Відмінно! Ти справжній друг команди! 🌟';
    else if (quizScore >= 4) message = 'Непогано! Але можна краще вивчити команду 😊';
    else message = 'Треба більше спілкуватися з командою! 😅';

    if (finalScore) {
        finalScore.innerHTML = `<strong>Твій результат: ${quizScore}/${TOTAL_QUESTIONS}</strong><br><br>${message}`;
    }
}