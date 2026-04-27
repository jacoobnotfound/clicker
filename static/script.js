const button = document.getElementById('clickBtn');
const score = document.getElementById('score')

let multiplier = 1;

let clicks = 0;

button.addEventListener('click', function() {
    clicks++;
    score.textContent = clicks * multiplier;

});