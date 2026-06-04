const challenges = getChallenges();
function renderChallenge(id) {

   
    let challenge = challenges.find(c => c.id === id);

    if (!challenge) {
        console.log("challenge not found");
        return;
    }

  
    const diffClass = {
        Easy: 'badge-easy',
        Medium: 'badge-medium',
        Hard: 'badge-hard'
    };

    
    document.getElementById('challenge-title').textContent = challenge.title;
    document.getElementById('challenge-summary').textContent = challenge.summary;
    document.getElementById('header-points').textContent = challenge.points + " points";

   
    let diff = document.getElementById('badge-difficulty');
    diff.textContent = challenge.difficulty;
    diff.className = "badge " + diffClass[challenge.difficulty];

  
    document.getElementById('badge-category').textContent = challenge.category;

  
    document.getElementById('challenge-description').innerHTML = challenge.description;

   
    let detailsHTML = "";
    challenge.details.forEach(d => {
        detailsHTML += `<p>${d}</p>`;
    });
    document.getElementById('challenge-details').innerHTML = detailsHTML;


    let examplesHTML = "";

   challenge.examples.forEach((ex, index) => {
    examplesHTML += `
    <div class="example-block">
        <p class="example-number">Example ${index + 1}</p>
        <p class="input-line"><span class="ex-label-input">Input:</span> ${ex.input}</p>
        <p class="output-line"><span class="ex-label-output">Output:</span> ${ex.output}</p>
        ${ex.explanation ? `<p class="explanation-line"><span class="ex-label-explanation">Explanation:</span> ${ex.explanation}</p>` : ""}
    </div>
    `;
});

    document.getElementById('challenge-examples').innerHTML = examplesHTML;

 
    document.getElementById('code-editor').value = challenge.defaultCode;

    document.getElementById('info-points').textContent = challenge.points + " Points";
    document.getElementById('info-difficulty').textContent = challenge.difficulty;
    document.getElementById('info-time').textContent = challenge.timeLimit;

  
    document.getElementById('total-submissions').textContent =
        challenge.stats.totalSubmissions.toLocaleString();

    document.getElementById('accepted').textContent =
        challenge.stats.accepted.toLocaleString();

    document.getElementById('success-rate').textContent =
        challenge.stats.successRate;
}



const params = new URLSearchParams(window.location.search);
const challengeId = parseInt(params.get('id')) || 1;


renderChallenge(challengeId);