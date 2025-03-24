export function smallFireworks() {
    confetti({
        particleCount: 10,
        spread: 120,
        origin: {
            x: event.clientX / window.innerWidth,
            y: event.clientY / window.innerHeight
        }
    });
}
export function fireworks() {
    var duration = 3 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.9) }
        }));
    }, 250);
}
